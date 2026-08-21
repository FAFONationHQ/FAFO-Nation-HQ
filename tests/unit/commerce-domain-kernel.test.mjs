import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CommerceDomainError, InMemoryIdempotencyRegistry, addCartItem, cartId, commercialItemSnapshot,
  createCart, createMoney, createOrderItem, failure, fulfillmentTransitionIsAllowed, idempotencyKey,
  orderTransitionIsAllowed, paymentTransitionIsAllowed, productionTransitionIsAllowed,
  projectCustomerStatus, shipmentTransitionIsAllowed, success, transitionCheckout, transitionOrder,
} from "../../lib/foundation/commerce/index.ts";
import { commerceModuleDefinitions } from "../../lib/foundation/commerce/modules.ts";
import { resolveFoundationModules } from "../../lib/foundation/modules.ts";

const price = createMoney(2599, "cad");
const item = () => commercialItemSnapshot({ catalogProductId: "product-1", title: "Foundation Tee", quantity: 2, unitPrice: price, priceVersion: "price-1", capturedAt: "2026-08-20T00:00:00.000Z" });

test("guest carts are independent of accounts, inventory, payments, and configuration UI", () => {
  const cart = createCart("cart-1", { kind: "GUEST", reference: "guest-1" }, "2026-08-20T00:00:00.000Z");
  const configured = commercialItemSnapshot({ ...item(), configuration: { kind: "CUSTOM_BUILD", reference: "build-1", summary: "approved build" } });
  const updated = addCartItem(cart, "line-1", configured, "2026-08-20T00:01:00.000Z");
  assert.equal(updated.items[0].snapshot.configuration.reference, "build-1");
  assert.throws(() => addCartItem(updated, "line-1", item(), "2026-08-20T00:02:00.000Z"), CommerceDomainError);
  assert.throws(() => commercialItemSnapshot({ ...item(), quantity: 0 }), CommerceDomainError);
});

test("commercial snapshots and order items survive later catalog mutation", () => {
  const mutable = { ...item(), title: "Original" };
  const orderItem = createOrderItem("order-line-1", mutable);
  mutable.title = "Changed in catalog";
  assert.equal(orderItem.snapshot.title, "Original");
  assert.deepEqual(orderItem.lineTotal, createMoney(5198, "CAD"));
  assert.equal(createMoney(1.5, "CAD"), null);
});

test("checkout and order lifecycles reject impossible transitions", () => {
  const checkout = { id: "checkout-1", cartId: cartId("cart-1"), state: "OPEN", idempotencyKey: idempotencyKey("submit-1"), expiresAt: "2026-08-21" };
  assert.equal(transitionCheckout(checkout, "VALIDATING").state, "VALIDATING");
  assert.throws(() => transitionCheckout(checkout, "COMPLETED"), CommerceDomainError);
  assert.equal(orderTransitionIsAllowed("DRAFT", "SUBMITTED"), true);
  assert.equal(orderTransitionIsAllowed("DRAFT", "COMPLETED"), false);
  assert.throws(() => transitionOrder({ id: "order-1", owner: { kind: "GUEST", reference: "g" }, state: "DRAFT", items: [] }, "COMPLETED"), CommerceDomainError);
});

test("payment, fulfillment, production, and shipment are independent state machines", () => {
  assert.equal(paymentTransitionIsAllowed("CAPTURED", "REFUNDED"), true);
  assert.equal(paymentTransitionIsAllowed("CAPTURED", "CAPTURED"), false);
  assert.equal(fulfillmentTransitionIsAllowed("ACCEPTED", "COMPLETED"), true);
  assert.equal(fulfillmentTransitionIsAllowed("NOT_REQUESTED", "COMPLETED"), false);
  assert.equal(productionTransitionIsAllowed("IN_PRODUCTION", "COMPLETE"), true);
  assert.equal(productionTransitionIsAllowed("CANCELLED", "IN_PRODUCTION"), false);
  assert.equal(shipmentTransitionIsAllowed("NOT_SHIPPED", "DELIVERED"), false);
  assert.equal(shipmentTransitionIsAllowed("SHIPPED", "DELIVERED"), true);
});

test("customer projection exposes concurrent progress, actions, and exceptions without a vague status", () => {
  const status = projectCustomerStatus({ order: "CONFIRMED", payment: "CAPTURED", fulfillment: "ACCEPTED", production: "IN_PRODUCTION", shipment: "NOT_SHIPPED" });
  assert.deepEqual(status.completed, ["ORDER_RECEIVED", "PAYMENT_CAPTURED", "FULFILLMENT_ACCEPTED"]);
  assert.deepEqual(status.current, ["PRODUCTION_IN_PROGRESS"]);
  assert.equal(status.exception, false);
  const exception = projectCustomerStatus({ order: "PROCESSING", payment: "REQUIRES_ACTION", fulfillment: "FAILED" });
  assert.equal(exception.actionRequired, true); assert.equal(exception.exception, true);
});

test("idempotency detects a duplicate dangerous operation while preserving typed results", () => {
  const registry = new InMemoryIdempotencyRegistry();
  const operation = { operation: "CHECKOUT_SUBMISSION", key: idempotencyKey("request-1"), subjectReference: "cart-1" };
  assert.deepEqual(registry.claim(operation), success(undefined));
  assert.deepEqual(registry.claim(operation), failure("DUPLICATE_OPERATION"));
});

test("commerce module contracts keep optional capabilities absent", () => {
  const composition = resolveFoundationModules([{ id: "catalog", enabled: true }, ...commerceModuleDefinitions]);
  assert.equal(composition.enabled.has("inventory"), false);
  assert.equal(composition.enabled.has("payments"), false);
  assert.equal(composition.enabled.has("commerce-cart"), false);
});
