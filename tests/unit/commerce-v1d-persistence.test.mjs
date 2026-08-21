import assert from "node:assert/strict";
import { test } from "vitest";
import { CommerceApplicationService, InMemoryCommerceRepository, PersistenceConflictError } from "../../lib/foundation/commerce/index.ts";

const cart = (version = 1) => ({ id: "cart-1", version, snapshot: { owner: "guest", priceMinor: 2500, currency: "CAD" } });

test("persistent cart contract rejects stale writers and survives a new repository instance", () => {
  const store = new InMemoryCommerceRepository(); const initial = store.saveCart(cart()); const updated = store.saveCart({ ...initial, snapshot: { ...initial.snapshot, quantity: 2 } }, initial.version);
  assert.equal(updated.version, 2); assert.throws(() => store.saveCart(cart(), 1), (error) => error instanceof PersistenceConflictError && error.code === "STALE_VERSION");
  const restarted = new InMemoryCommerceRepository(); restarted.carts.set(updated.id, updated); assert.deepEqual(restarted.getCart("cart-1"), updated);
});

test("persistent idempotency returns the same request and rejects conflicting reuse after restart", () => {
  const store = new InMemoryCommerceRepository(); const first = store.claimIdempotency({ key: "capture-1", operation: "PAYMENT_CAPTURE", fingerprint: "order-1", state: "COMPLETED", result: { payment: "CAPTURED" } });
  assert.equal(store.claimIdempotency({ ...first }).result.payment, "CAPTURED"); assert.throws(() => store.claimIdempotency({ ...first, fingerprint: "order-2" }), PersistenceConflictError);
});

test("atomic application order write rolls back transaction, event, and idempotency on failure", () => {
  const store = new InMemoryCommerceRepository(); const service = new CommerceApplicationService(store);
  assert.throws(() => store.transaction(() => { service.saveOrderAtomically({ id: "order-1", version: 1, snapshot: { title: "Original", configuration: "build-v1" } }, { id: "event-1", transactionId: "order-1", sequence: 1, type: "ORDER_SUBMITTED" }, { key: "order-key", operation: "ORDER_CREATE", fingerprint: "cart-1", state: "COMPLETED" }); throw new Error("injected write failure"); }));
  assert.equal(store.getTransaction("order-1"), null); assert.deepEqual(store.events("order-1"), []); assert.equal(store.claimIdempotency({ key: "order-key", operation: "ORDER_CREATE", fingerprint: "cart-1", state: "COMPLETED" }).state, "COMPLETED");
});

test("durable events, manual review, and immutable order snapshots reconstruct after restart", () => {
  const store = new InMemoryCommerceRepository(); store.saveTransaction({ id: "order-1", version: 1, snapshot: { title: "Original tee", priceMinor: 2500, configuration: { reference: "build-v1", summary: "approved" }, payment: "CAPTURED", production: "IN_PRODUCTION" } });
  store.appendEvent({ id: "event-1", transactionId: "order-1", sequence: 1, type: "PAYMENT_CAPTURED" }); store.saveReview({ id: "review-1", transactionId: "order-1", reason: "provider outcome unknown", status: "OPEN", operatorActionRequired: true });
  const restarted = new InMemoryCommerceRepository(); for (const [key, value] of store.transactions) restarted.transactions.set(key, value); for (const [key, value] of store.audit) restarted.audit.set(key, value); for (const [key, value] of store.review) restarted.review.set(key, value);
  assert.equal(restarted.getTransaction("order-1").snapshot.title, "Original tee"); assert.equal(restarted.events("order-1")[0].type, "PAYMENT_CAPTURED"); assert.equal(restarted.reviews("order-1")[0].operatorActionRequired, true);
});
