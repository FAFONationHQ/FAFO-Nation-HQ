import assert from "node:assert/strict";
import { test } from "vitest";
import {
  FakeFulfillmentProvider, FakePaymentProvider, InMemoryOrderService, addOrMergeCartLine,
  applyProviderEvent, beginTransaction, capturePayment, commercialItemSnapshot, createCart,
  createMoney, evaluateCheckout, projectTransactionTimeline, reconcileFulfillment, reconcilePayment,
  requestRefund, startCheckout, submitFulfillment,
} from "../../lib/foundation/commerce/index.ts";

const now = "2026-08-20T00:00:00.000Z";
const item = () => commercialItemSnapshot({ catalogProductId: "tee", title: "Tee", quantity: 1, unitPrice: createMoney(2500, "CAD"), priceVersion: "p1", capturedAt: now, configuration: { kind: "CUSTOM_BUILD", reference: "build-1", summary: "saved build" } });
const source = { find: () => ({ catalogProductId: "tee", unitPrice: createMoney(2500, "CAD"), priceVersion: "p1", productState: "AVAILABLE" }) };
function ready() { const cart = addOrMergeCartLine(createCart("cart", { kind: "GUEST", reference: "guest" }, now), "line", item(), now); const session = startCheckout({ id: "checkout", cart, key: "checkout-key", expiresAt: "2026-08-21T00:00:00.000Z" }); return { cart, checkout: evaluateCheckout({ session, cart, now, catalog: source }) }; }
function transaction() { const { cart, checkout } = ready(); const order = new InMemoryOrderService().submit({ id: "order", key: "order-key", cart, checkout }); return beginTransaction(order, "WAITING", "NOT_SHIPPED"); }

test("a ready checkout creates one immutable pre-payment order", () => {
  const { cart, checkout } = ready(); const orders = new InMemoryOrderService();
  const first = orders.submit({ id: "order", key: "idem", cart, checkout }); const retry = orders.submit({ id: "other", key: "idem", cart, checkout });
  assert.equal(first.state, "SUBMITTED"); assert.equal(retry, first); assert.deepEqual(first.subtotal, createMoney(2500, "CAD"));
  assert.equal(first.items[0].snapshot.configuration.reference, "build-1");
});

test("payment stays independent, supports action/failure, and blocks fulfillment until capture", () => {
  const pending = transaction(); const fulfillment = new FakeFulfillmentProvider();
  assert.equal(submitFulfillment(pending, fulfillment, "f").fulfillment, "NOT_REQUESTED");
  assert.equal(capturePayment(pending, new FakePaymentProvider({ pay: "REQUIRES_ACTION" }), "pay").payment, "REQUIRES_ACTION");
  assert.equal(capturePayment(pending, new FakePaymentProvider({ pay: "FAILED" }), "pay").payment, "FAILED");
  const captured = capturePayment(pending, new FakePaymentProvider(), "pay"); assert.equal(captured.payment, "CAPTURED"); assert.equal(captured.order.state, "CONFIRMED");
});

test("fake providers make external success with a lost response safe through reconciliation", () => {
  const payments = new FakePaymentProvider({ pay: "TIMEOUT_AFTER_SUCCESS" }); const unknownPayment = capturePayment(transaction(), payments, "pay");
  assert.equal(unknownPayment.payment, "UNKNOWN"); assert.equal(unknownPayment.reviews.length, 1); assert.equal(reconcilePayment(unknownPayment, payments, "pay").payment, "CAPTURED");
  const captured = capturePayment(transaction(), new FakePaymentProvider(), "pay"); const providers = new FakeFulfillmentProvider({ fulfill: "TIMEOUT_AFTER_SUCCESS" }); const unknownFulfillment = submitFulfillment(captured, providers, "fulfill");
  assert.equal(unknownFulfillment.fulfillment, "UNKNOWN"); assert.equal(reconcileFulfillment(unknownFulfillment, providers, "fulfill").fulfillment, "ACCEPTED");
});

test("payment captured plus fulfillment failure remains truthful and retryable without a second charge", () => {
  const captured = capturePayment(transaction(), new FakePaymentProvider(), "pay"); const failed = submitFulfillment(captured, new FakeFulfillmentProvider({ fulfill: "UNAVAILABLE" }), "fulfill");
  assert.equal(failed.payment, "CAPTURED"); assert.equal(failed.fulfillment, "FAILED"); assert.deepEqual(projectTransactionTimeline(failed).current, ["ORDER_PREPARATION_DELAYED"]);
  assert.equal(submitFulfillment(captured, new FakeFulfillmentProvider(), "fulfill").fulfillment, "ACCEPTED");
});

test("duplicate and out-of-order provider events cannot regress production or delivery", () => {
  const base = transaction(); const delivered = applyProviderEvent(base, { id: "ship-delivered", operation: "SHIPMENT", state: "DELIVERED", occurredAt: now, sequence: 2 });
  const stale = applyProviderEvent(delivered, { id: "ship-transit", operation: "SHIPMENT", state: "IN_TRANSIT", occurredAt: now, sequence: 1 });
  assert.equal(stale.shipment, "DELIVERED"); assert.equal(applyProviderEvent(stale, { id: "ship-transit", operation: "SHIPMENT", state: "IN_TRANSIT", occurredAt: now, sequence: 1 }), stale);
  const complete = applyProviderEvent(base, { id: "prod-complete", operation: "PRODUCTION", state: "COMPLETE", occurredAt: now, sequence: 2 });
  assert.equal(applyProviderEvent(complete, { id: "prod-start", operation: "PRODUCTION", state: "IN_PRODUCTION", occurredAt: now, sequence: 1 }).production, "COMPLETE");
});

test("unknown events and unresolved reconciliation require operator review without exposing provider jargon", () => {
  const unknown = applyProviderEvent(transaction(), { id: "unknown", operation: "FULFILLMENT", state: "NEW_PROVIDER_THING", occurredAt: now, sequence: 1 });
  assert.equal(unknown.reviews[0].operatorActionRequired, true); assert.equal(projectTransactionTimeline(unknown).action, "OPERATOR");
  const provider = new FakePaymentProvider({ pay: "AMBIGUOUS" }); const unresolved = reconcilePayment(capturePayment(transaction(), provider, "pay"), provider, "pay");
  assert.equal(unresolved.reviews.length, 2);
});

test("refunds preserve fulfillment history and surface completion or review without stopping physical work", () => {
  const captured = capturePayment(transaction(), new FakePaymentProvider(), "pay"); const accepted = submitFulfillment(captured, new FakeFulfillmentProvider(), "fulfill");
  const refunded = requestRefund(accepted, new FakePaymentProvider(), "pay"); assert.equal(refunded.payment, "REFUNDED"); assert.equal(refunded.fulfillment, "ACCEPTED"); assert.equal(projectTransactionTimeline(refunded).completed.includes("REFUND_COMPLETED"), true);
  const uncertain = requestRefund(captured, new FakePaymentProvider({ "refund:pay": "AMBIGUOUS" }), "pay"); assert.equal(uncertain.reviews[0].operation, "REFUND");
});
