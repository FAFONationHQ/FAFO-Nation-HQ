import assert from "node:assert/strict";
import { test } from "vitest";
import {
  InMemoryCheckoutSubmissionService, addOrMergeCartLine, cartSubtotal, commercialItemSnapshot,
  createCart, createMoney, evaluateCheckout, projectAvailability, removeCartLine, startCheckout,
  updateCartLineQuantity,
} from "../../lib/foundation/commerce/index.ts";

const now = "2026-08-20T00:00:00.000Z";
const snapshot = (overrides = {}) => commercialItemSnapshot({ catalogProductId: "tee", title: "Tee", variantReference: "black-m", quantity: 1, unitPrice: createMoney(2500, "CAD"), priceVersion: "p1", capturedAt: now, ...overrides });
const current = (overrides = {}) => ({ catalogProductId: "tee", variantReference: "black-m", unitPrice: createMoney(2500, "CAD"), priceVersion: "p1", productState: "AVAILABLE", ...overrides });
const catalog = (record) => ({ find: () => record });
const guestCart = () => createCart("cart-1", { kind: "GUEST", reference: "guest-1" }, now);

test("guest cart mutations merge only equivalent commercial intent and retain generic configurations", () => {
  const ordinary = addOrMergeCartLine(guestCart(), "line-1", snapshot(), now);
  const merged = addOrMergeCartLine(ordinary, "line-2", snapshot({ quantity: 2 }), now);
  assert.equal(merged.items.length, 1); assert.equal(merged.items[0].snapshot.quantity, 3);
  const personalized = addOrMergeCartLine(merged, "line-3", snapshot({ configuration: { kind: "PERSONALIZATION", reference: "personal-1" } }), now);
  const custom = addOrMergeCartLine(personalized, "line-4", snapshot({ configuration: { kind: "CUSTOM_BUILD", reference: "build-1" } }), now);
  assert.equal(custom.items.length, 3); assert.deepEqual(cartSubtotal(custom), createMoney(12500, "CAD"));
  const changed = updateCartLineQuantity(custom, custom.items[0].id, 4, now); assert.equal(changed.items[0].snapshot.quantity, 4);
  assert.equal(removeCartLine(changed, changed.items[2].id, now).items.length, 2);
  assert.throws(() => updateCartLineQuantity(custom, custom.items[0].id, 0, now));
});

test("authoritative validation rejects browser price, currency, and quantity tampering", () => {
  const cases = [
    [snapshot({ unitPrice: createMoney(1, "CAD") }), current(), "PRICE_CHANGED"],
    [snapshot({ unitPrice: createMoney(2500, "USD") }), current(), "CURRENCY_MISMATCH"],
    [snapshot({ quantity: 9 }), current({ quantityLimit: 2 }), "QUANTITY_INVALID"],
  ];
  for (const [item, record, expected] of cases) {
    const cart = addOrMergeCartLine(guestCart(), `line-${expected}`, item, now);
    const session = startCheckout({ id: `checkout-${expected}`, cart, key: `key-${expected}`, expiresAt: "2026-08-21T00:00:00.000Z" });
    assert.equal(evaluateCheckout({ session, cart, now, catalog: catalog(record) }).lines[0].code, expected);
  }
});

test("availability projection preserves truthful internal distinctions", () => {
  assert.equal(projectAvailability("SOLD_OUT"), "SOLD_OUT");
  assert.equal(projectAvailability("BACK_SOON"), "BACK_SOON");
  assert.equal(projectAvailability("TEMPORARILY_UNAVAILABLE"), "TEMPORARILY_UNAVAILABLE");
  assert.equal(projectAvailability("CONFIGURATION_INVALID"), "NEEDS_ATTENTION");
  assert.equal(projectAvailability("PRODUCT_UNAVAILABLE"), "UNAVAILABLE");
});

test("authoritative product and configuration changes remain line-specific and recoverable", () => {
  const cases = [
    [current({ productState: "UNPUBLISHED" }), "PRODUCT_UNAVAILABLE", "UNAVAILABLE"],
    [current({ productState: "VARIANT_REMOVED" }), "PRODUCT_CHANGED", "UNAVAILABLE"],
    [current({ productState: "SOLD_OUT" }), "SOLD_OUT", "SOLD_OUT"],
    [current({ productState: "BACK_SOON" }), "BACK_SOON", "BACK_SOON"],
    [current({ productState: "TEMPORARILY_UNAVAILABLE" }), "TEMPORARILY_UNAVAILABLE", "TEMPORARILY_UNAVAILABLE"],
    [current({ configurationState: "INVALID" }), "CONFIGURATION_INVALID", "NEEDS_ATTENTION"],
    [current({ configurationState: "CHANGED" }), "CONFIGURATION_CHANGED", "NEEDS_ATTENTION"],
  ];
  for (const [record, code, availability] of cases) {
    const cart = addOrMergeCartLine(guestCart(), `line-${code}`, snapshot(), now);
    const session = startCheckout({ id: `checkout-${code}`, cart, key: `key-${code}`, expiresAt: "2026-08-21T00:00:00.000Z" });
    const result = evaluateCheckout({ session, cart, now, catalog: catalog(record) });
    assert.equal(result.lines[0].code, code); assert.equal(result.lines[0].availability, availability); assert.equal(result.lines[0].recoverable, true);
  }
});

test("mixed cart validation isolates invalid lines and preserves the cart", () => {
  const first = addOrMergeCartLine(guestCart(), "line-valid", snapshot(), now);
  const cart = addOrMergeCartLine(first, "line-bad", snapshot({ variantReference: "red-l" }), now);
  const records = [current(), current({ variantReference: "red-l", productState: "UNPUBLISHED" })]; let i = 0;
  const session = startCheckout({ id: "checkout-mixed", cart, key: "mixed", expiresAt: "2026-08-21T00:00:00.000Z" });
  const result = evaluateCheckout({ session, cart, now, catalog: { find: () => records[i++] } });
  assert.equal(result.status, "REQUIRES_ATTENTION"); assert.deepEqual(result.lines.map(({ code }) => code), ["VALID", "PRODUCT_UNAVAILABLE"]); assert.equal(cart.items.length, 2);
});

test("stocked inventory is optional for POD but required supply is checked when provided", () => {
  const pod = addOrMergeCartLine(guestCart(), "pod", snapshot(), now);
  const podSession = startCheckout({ id: "pod-session", cart: pod, key: "pod", expiresAt: "2026-08-21T00:00:00.000Z" });
  assert.equal(evaluateCheckout({ session: podSession, cart: pod, now, catalog: catalog(current()) }).status, "READY_FOR_PAYMENT");
  const stocked = addOrMergeCartLine(guestCart(), "stock", snapshot(), now);
  const stockSession = startCheckout({ id: "stock-session", cart: stocked, key: "stock", expiresAt: "2026-08-21T00:00:00.000Z" });
  assert.equal(evaluateCheckout({ session: stockSession, cart: stocked, now, catalog: catalog(current({ inventoryRequirement: "REQUIRED" })) }).inventory, "CAPABILITY_NOT_INSTALLED");
  const result = evaluateCheckout({ session: stockSession, cart: stocked, now, catalog: catalog(current({ inventoryRequirement: "REQUIRED" })), inventory: { availability: () => "SOLD_OUT" } });
  assert.equal(result.lines[0].availability, "SOLD_OUT");
});

test("checkout is version-bound, expires without clearing cart, and is idempotent", () => {
  const cart = addOrMergeCartLine(guestCart(), "line", snapshot(), now);
  const session = startCheckout({ id: "checkout", cart, key: "key", expiresAt: "2026-08-21T00:00:00.000Z" });
  const changed = updateCartLineQuantity(cart, cart.items[0].id, 2, now);
  assert.equal(evaluateCheckout({ session, cart: changed, now, catalog: catalog(current()) }).status, "STALE_CART");
  assert.equal(evaluateCheckout({ session, cart, now: "2026-08-22T00:00:00.000Z", catalog: catalog(current()) }).status, "EXPIRED"); assert.equal(cart.items.length, 1);
  const submissions = new InMemoryCheckoutSubmissionService();
  const first = submissions.submit({ id: "checkout-idem", cart, owner: cart.owner, key: "idem", expiresAt: "2026-08-21" });
  const retry = submissions.submit({ id: "another-id", cart, owner: cart.owner, key: "idem", expiresAt: "2026-08-21" });
  const conflict = submissions.submit({ id: "conflict", cart: changed, owner: changed.owner, key: "idem", expiresAt: "2026-08-21" });
  assert.deepEqual(retry, first); assert.equal(conflict.ok, false);
});

test("shipping and tax are requirements, not fabricated calculations", () => {
  const cart = addOrMergeCartLine(guestCart(), "digital", snapshot(), now);
  const session = startCheckout({ id: "checkout-tax", cart, key: "tax", expiresAt: "2026-08-21T00:00:00.000Z" });
  const result = evaluateCheckout({ session, cart, now, catalog: catalog(current({ shippingRequirement: "NOT_REQUIRED", taxRequirement: "PENDING_CAPABILITY" })) });
  assert.equal(result.shipping, "NOT_REQUIRED"); assert.equal(result.tax, "PENDING_CAPABILITY");
});
