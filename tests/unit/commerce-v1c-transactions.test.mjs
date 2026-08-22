import assert from "node:assert/strict";
import { test } from "vitest";
import {
  FakeFulfillmentProvider, FakePaymentProvider, InMemoryOrderService, addOrMergeCartLine,
  applyProviderEvent, beginTransaction, cancellationDisposition, capturePayment, commercialItemSnapshot,
  completeOrderIfEligible, createCart, createMoney, evaluateCheckout, projectTransactionTimeline,
  reconcileFulfillment, reconcilePayment, requestCancellation, requestRefund, retryDisposition,
  startCheckout, submitFulfillment,
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
  assert.equal(failed.payment, "CAPTURED"); assert.equal(failed.fulfillment, "FAILED"); assert.equal(projectTransactionTimeline(failed).current.includes("ORDER_PREPARATION_DELAYED"), true);
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

test("production lifecycle is independent, monotonic, and supports optional stages", () => {
  const captured = capturePayment(transaction(), new FakePaymentProvider(), "pay");
  const accepted = submitFulfillment(captured, new FakeFulfillmentProvider(), "fulfill");
  const pre = applyProviderEvent(accepted, { id: "pre", operation: "PRODUCTION", state: "PRE_PRODUCTION", occurredAt: now, sequence: 1 });
  const active = applyProviderEvent(pre, { id: "active", operation: "PRODUCTION", state: "IN_PRODUCTION", occurredAt: now, sequence: 2 });
  const complete = applyProviderEvent(active, { id: "complete", operation: "PRODUCTION", state: "COMPLETE", occurredAt: now, sequence: 3 });
  assert.equal(pre.production, "PRE_PRODUCTION"); assert.equal(active.production, "IN_PRODUCTION"); assert.equal(complete.production, "COMPLETE");
  assert.equal(applyProviderEvent(complete, { id: "stale", operation: "PRODUCTION", state: "IN_PRODUCTION", occurredAt: now, sequence: 2 }).production, "COMPLETE");
  assert.equal(complete.payment, "CAPTURED"); assert.equal(completeOrderIfEligible({ ...accepted, production: "NOT_REQUIRED", shipment: "NOT_REQUIRED" }).order.state, "COMPLETED");
  assert.equal(applyProviderEvent(accepted, { id: "blocked", operation: "PRODUCTION", state: "BLOCKED", occurredAt: now, sequence: 1 }).production, "BLOCKED");
  assert.equal(applyProviderEvent(accepted, { id: "failed", operation: "PRODUCTION", state: "FAILED", occurredAt: now, sequence: 1 }).production, "FAILED");
});

test("cancellation is policy-driven before production and requires review after commitment", () => {
  const captured = capturePayment(transaction(), new FakePaymentProvider(), "pay");
  const cancelled = requestCancellation(captured); assert.equal(cancelled.order.state, "CANCELLED"); assert.equal(cancelled.production, "CANCELLED"); assert.equal(cancelled.payment, "CAPTURED");
  const active = applyProviderEvent(submitFulfillment(captured, new FakeFulfillmentProvider(), "fulfill"), { id: "start", operation: "PRODUCTION", state: "IN_PRODUCTION", occurredAt: now, sequence: 1 });
  assert.equal(cancellationDisposition(active), "MANUAL_REVIEW_REQUIRED"); assert.equal(requestCancellation(active).reviews[0].operation, "CANCELLATION");
  const shipped = applyProviderEvent(captured, { id: "shipped", operation: "SHIPMENT", state: "SHIPPED", occurredAt: now, sequence: 1 }); assert.equal(requestCancellation(shipped).reviews[0].operation, "CANCELLATION");
});

test("retry policy is bounded and unresolved ambiguity stops automatic execution", () => {
  assert.equal(retryDisposition("RETRYABLE", 0, { maximumAttempts: 2 }), "RETRYABLE");
  assert.equal(retryDisposition("RETRYABLE", 2, { maximumAttempts: 2 }), "MANUAL_REVIEW_REQUIRED");
  assert.equal(retryDisposition("RECONCILIATION_REQUIRED", 0, { maximumAttempts: 2 }), "RECONCILIATION_REQUIRED");
  const provider = new FakeFulfillmentProvider({ fulfill: "AMBIGUOUS" }); const captured = capturePayment(transaction(), new FakePaymentProvider(), "pay");
  const unresolved = reconcileFulfillment(submitFulfillment(captured, provider, "fulfill"), provider, "fulfill"); assert.equal(unresolved.reviews.length, 2);
});

test("full deterministic transaction completes with independent state and a structured timeline", () => {
  const physical = transaction(); const authorized = capturePayment(physical, new FakePaymentProvider({ pay: "AUTHORIZED" }), "pay"); assert.equal(authorized.payment, "AUTHORIZED");
  const captured = capturePayment(authorized, new FakePaymentProvider(), "capture"); const accepted = submitFulfillment(captured, new FakeFulfillmentProvider(), "fulfill");
  const events = [["pre", "PRODUCTION", "PRE_PRODUCTION"], ["prod", "PRODUCTION", "IN_PRODUCTION"], ["done", "PRODUCTION", "COMPLETE"], ["prep", "SHIPMENT", "PREPARING"], ["ship", "SHIPMENT", "SHIPPED"], ["transit", "SHIPMENT", "IN_TRANSIT"], ["out", "SHIPMENT", "OUT_FOR_DELIVERY"], ["delivered", "SHIPMENT", "DELIVERED"]];
  const finished = completeOrderIfEligible(events.reduce((state, [id, operation, stateName], sequence) => applyProviderEvent(state, { id, operation, state: stateName, occurredAt: now, sequence }), accepted));
  const timeline = projectTransactionTimeline(finished); assert.equal(finished.order.state, "COMPLETED"); assert.equal(finished.payment, "CAPTURED"); assert.equal(finished.fulfillment, "ACCEPTED"); assert.equal(finished.production, "COMPLETE"); assert.equal(finished.shipment, "DELIVERED"); assert.equal(timeline.completed.includes("SHIPMENT_DELIVERED"), true); assert.equal(timeline.next.length, 0);
});

test("refund during active production preserves physical-state truth", () => {
  const captured = capturePayment(transaction(), new FakePaymentProvider(), "pay"); const accepted = submitFulfillment(captured, new FakeFulfillmentProvider(), "fulfill");
  const active = applyProviderEvent(accepted, { id: "active-refund", operation: "PRODUCTION", state: "IN_PRODUCTION", occurredAt: now, sequence: 1 }); const refunded = requestRefund(active, new FakePaymentProvider(), "pay");
  assert.equal(refunded.payment, "REFUNDED"); assert.equal(refunded.fulfillment, "ACCEPTED"); assert.equal(refunded.production, "IN_PRODUCTION");
});
