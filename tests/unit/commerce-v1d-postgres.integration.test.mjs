import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { test, afterAll, beforeAll } from "vitest";
import { PrismaCommerceAdapter } from "../../lib/commerce-prisma-adapter.ts";
import { projectCustomerStatus } from "../../lib/foundation/commerce/core.ts";
import { PersistenceConflictError } from "../../lib/foundation/commerce/persistence.ts";

const prisma = new PrismaClient();
const db = new PrismaCommerceAdapter(prisma);
const prefix = `v1d-postgres-${process.pid}`;
const id = (name) => `${prefix}-${name}`;
const event = (name, orderId, sequence, type = "ORDER") => ({ id: id(name), transactionId: orderId, sequence, type, payload: { correlationId: id("correlation"), source: "fake-provider" } });
const cart = (name = "cart") => ({ id: id(name), version: 1, ownerKind: "GUEST", ownerRef: id("guest"), snapshot: { items: [{ title: "Original tee", unitPriceMinor: 2500, currency: "CAD", configuration: { kind: "CUSTOM_BUILD", reference: "build-v1" } }] } });
const order = (name = "order") => ({ id: id(name), version: 1, checkoutId: id("checkout"), cartVersion: 2, orderState: "SUBMITTED", paymentState: "PENDING", fulfillmentState: "NOT_REQUESTED", productionState: "WAITING", shipmentState: "NOT_SHIPPED", subtotalMinor: 2500, currency: "CAD", snapshot: { title: "Original tee", personalization: { reference: "personal-v1" }, configuration: { kind: "CUSTOM_BUILD", reference: "build-v1" } }, items: [{ id: id(`${name}-item`), snapshot: { title: "Original tee", quantity: 1, unitPriceMinor: 2500, currency: "CAD", configuration: { kind: "CUSTOM_BUILD", reference: "build-v1" } } }] });

beforeAll(async () => { const identity = await prisma.$queryRawUnsafe("SELECT current_database() AS database"); assert.equal(identity[0].database, "fafo_foundation_commerce_v1d_test"); });
afterAll(async () => { await prisma.commerceOrderItem.deleteMany({ where: { id: { startsWith: prefix } } }); await prisma.commerceEvent.deleteMany({ where: { id: { startsWith: prefix } } }); await prisma.commerceManualReview.deleteMany({ where: { id: { startsWith: prefix } } }); await prisma.commerceOperation.deleteMany({ where: { id: { startsWith: prefix } } }); await prisma.commerceIdempotency.deleteMany({ where: { key: { startsWith: prefix } } }); await prisma.commerceOrder.deleteMany({ where: { id: { startsWith: prefix } } }); await prisma.commerceCheckoutSession.deleteMany({ where: { id: { startsWith: prefix } } }); await prisma.commerceCart.deleteMany({ where: { id: { startsWith: prefix } } }); await prisma.$disconnect(); });

test("PostgreSQL cart and checkout persist across reconstructed adapters and reject concurrent stale writes", async () => {
  const saved = await db.saveCart(cart()); const second = await db.saveCart({ ...cart(), version: saved.version, snapshot: { ...saved.snapshot, quantity: 2 } }, saved.version); assert.equal(second.version, 2);
  await assert.rejects(() => db.saveCart({ ...cart(), version: saved.version }, saved.version), (error) => error instanceof PersistenceConflictError && error.code === "STALE_VERSION");
  const restarted = new PrismaCommerceAdapter(prisma); assert.equal((await restarted.getCart(saved.id)).version, 2);
  const checkout = { id: id("checkout"), cartId: saved.id, cartVersion: 2, state: "READY", idempotencyKey: id("checkout-key"), fingerprint: "guest-cart-v2", readiness: { inventory: "NOT_REQUIRED", account: "GUEST" }, expiresAt: new Date("2026-08-22T00:00:00.000Z") };
  const [left, right] = await Promise.all([db.submitCheckout(checkout), restarted.submitCheckout({ ...checkout, id: id("checkout-retry") })]); assert.equal(left.id, right.id);
  await assert.rejects(() => restarted.submitCheckout({ ...checkout, id: id("checkout-conflict"), fingerprint: "other-cart" }), PersistenceConflictError);
});

test("PostgreSQL order snapshots, order/event/idempotency write, and rollback are atomic", async () => {
  const record = order(); const created = await db.createOrder({ ...record, idempotency: { key: id("order-key"), operation: "ORDER_CREATE", fingerprint: `${record.checkoutId}:2`, state: "COMPLETED" }, event: event("order-created", record.id, 1) });
  assert.equal(created.result.orderId, record.id); const restart = new PrismaCommerceAdapter(prisma); const persisted = await restart.getOrder(record.id);
  assert.equal(persisted.snapshot.configuration.reference, "build-v1"); assert.equal(persisted.items[0].snapshot.configuration.kind, "CUSTOM_BUILD"); assert.equal(persisted.subtotalMinor, 2500);
  const again = await restart.createOrder({ ...record, idempotency: { key: id("order-key"), operation: "ORDER_CREATE", fingerprint: `${record.checkoutId}:2`, state: "COMPLETED" }, event: event("order-created-retry", record.id, 2) }); assert.equal(again.result.orderId, record.id);
  await assert.rejects(() => restart.createOrder({ ...record, idempotency: { key: id("order-key"), operation: "ORDER_CREATE", fingerprint: "conflict", state: "COMPLETED" }, event: event("ignored", record.id, 3) }), PersistenceConflictError);
  const rollbackOrder = order("rollback"); await assert.rejects(() => prisma.$transaction(async (tx) => { await tx.commerceOrder.create({ data: { id: rollbackOrder.id, checkoutId: rollbackOrder.checkoutId, cartVersion: 1, orderState: "SUBMITTED", paymentState: "PENDING", fulfillmentState: "NOT_REQUESTED", productionState: "WAITING", shipmentState: "NOT_SHIPPED", subtotalMinor: 1, currency: "CAD", snapshot: {}, createdAt: new Date(), updatedAt: new Date() } }); throw new Error("injected rollback"); })); assert.equal(await db.getOrder(rollbackOrder.id), null);
});

test("concurrent PostgreSQL order creation returns one durable logical order", async () => {
  const record = order("concurrent"); const input = { ...record, idempotency: { key: id("concurrent-order-key"), operation: "ORDER_CREATE", fingerprint: "concurrent", state: "COMPLETED" }, event: event("concurrent-order", record.id, 1) };
  const [left, right] = await Promise.all([db.createOrder(input), new PrismaCommerceAdapter(prisma).createOrder({ ...input, id: id("concurrent-retry"), items: [{ id: id("concurrent-retry-item"), snapshot: input.items[0].snapshot }] })]);
  assert.equal(left.result.orderId, record.id); assert.equal(right.result.orderId, record.id); assert.equal(await prisma.commerceOrder.count({ where: { id: { startsWith: id("concurrent") } } }), 1); assert.equal(await prisma.commerceOrderItem.count({ where: { orderId: record.id } }), 1); assert.equal((await db.events(record.id)).length, 1);
});

test("required state and event rollback together, while replay and stale streams cannot regress after restart", async () => {
  const record = order("atomic"); await db.createOrder({ ...record, idempotency: { key: id("atomic-key"), operation: "ORDER_CREATE", fingerprint: "atomic", state: "COMPLETED" }, event: event("atomic-order", record.id, 1) });
  await assert.rejects(() => prisma.$transaction(async (tx) => { await tx.commerceOrder.update({ where: { id: record.id }, data: { paymentState: "CAPTURED" } }); throw new Error("required event persistence failed"); }));
  const restarted = new PrismaCommerceAdapter(prisma); assert.equal((await restarted.getOrder(record.id)).paymentState, "PENDING"); assert.equal((await restarted.events(record.id)).length, 1);
  const delivered = { ...event("provider-delivered", record.id, 2, "shipmentState"), field: "shipmentState", state: "DELIVERED" }; assert.equal(await restarted.applyLifecycleEvent(delivered), true);
  const afterReplay = new PrismaCommerceAdapter(prisma); assert.equal(await afterReplay.applyLifecycleEvent(delivered), false); assert.equal((await afterReplay.events(record.id)).filter(({ id: eventId }) => eventId === delivered.id).length, 1);
  assert.equal(await afterReplay.applyLifecycleEvent({ ...event("shipment-stale", record.id, 1, "shipmentState"), field: "shipmentState", state: "IN_TRANSIT" }), false);
  assert.equal(await afterReplay.applyLifecycleEvent({ ...event("production-complete", record.id, 3, "productionState"), field: "productionState", state: "COMPLETE" }), true);
  assert.equal(await new PrismaCommerceAdapter(prisma).applyLifecycleEvent({ ...event("production-stale", record.id, 2, "productionState"), field: "productionState", state: "IN_PRODUCTION" }), false);
  const final = await new PrismaCommerceAdapter(prisma).getOrder(record.id); assert.equal(final.shipmentState, "DELIVERED"); assert.equal(final.productionState, "COMPLETE"); assert.equal(projectCustomerStatus({ order: final.orderState, payment: final.paymentState, fulfillment: final.fulfillmentState, production: final.productionState, shipment: final.shipmentState }).completed.includes("SHIPMENT_DELIVERED"), true);
});

test("PostgreSQL fake-payment/fake-fulfillment recovery is idempotent, chronological, and restart safe", async () => {
  const record = order("flow"); await db.createOrder({ ...record, idempotency: { key: id("flow-order"), operation: "ORDER_CREATE", fingerprint: "flow", state: "COMPLETED" }, event: event("flow-order", record.id, 1) });
  const payment = { id: id("payment"), orderId: record.id, kind: "PAYMENT_CAPTURE", provider: "fake-payment", idempotencyKey: id("pay-key"), state: "UNKNOWN", reconciliation: "RESPONSE_LOST", diagnostic: { providerEffect: "CAPTURED" }, event: event("payment-lost", record.id, 2, "PAYMENT") };
  const [first, duplicate] = await Promise.all([db.executeOperation(payment), db.executeOperation({ ...payment, id: id("payment-race"), event: event("payment-race", record.id, 3, "PAYMENT") })]); assert.equal(first.id, duplicate.id); await db.reconcileOperation(payment.idempotencyKey, "CAPTURED", "RECONCILED_AFTER_RESTART");
  const restarted = new PrismaCommerceAdapter(prisma); const fulfillment = { id: id("fulfillment"), orderId: record.id, kind: "FULFILLMENT_SUBMISSION", provider: "fake-fulfillment", idempotencyKey: id("fulfill-key"), state: "UNKNOWN", reconciliation: "RESPONSE_LOST", diagnostic: { providerEffect: "ACCEPTED" }, event: event("fulfillment-lost", record.id, 4, "FULFILLMENT") };
  await restarted.executeOperation(fulfillment); await restarted.reconcileOperation(fulfillment.idempotencyKey, "ACCEPTED", "RECONCILED_AFTER_RESTART");
  for (const [sequence, name, field, state] of [[5, "authorized", "paymentState", "AUTHORIZED"], [6, "captured", "paymentState", "CAPTURED"], [7, "accepted", "fulfillmentState", "ACCEPTED"], [8, "pre-production", "productionState", "PRE_PRODUCTION"], [9, "in-production", "productionState", "IN_PRODUCTION"], [10, "production-complete", "productionState", "COMPLETE"], [11, "preparing", "shipmentState", "PREPARING"], [12, "shipped", "shipmentState", "SHIPPED"], [13, "transit", "shipmentState", "IN_TRANSIT"], [14, "out", "shipmentState", "OUT_FOR_DELIVERY"], [15, "delivered", "shipmentState", "DELIVERED"], [16, "complete", "orderState", "COMPLETED"]]) assert.equal(await restarted.applyLifecycleEvent({ ...event(`flow-${name}`, record.id, sequence, field), field, state }), true);
  assert.equal(await restarted.applyLifecycleEvent({ ...event("flow-stale", record.id, 14, "shipmentState"), field: "shipmentState", state: "IN_TRANSIT" }), false);
  await restarted.saveReview({ id: id("review"), orderId: record.id, reason: "response was lost", operatorActionRequired: true }); const final = await restarted.getOrder(record.id); assert.equal(final.orderState, "COMPLETED"); assert.equal(final.shipmentState, "DELIVERED"); assert.equal(final.productionState, "COMPLETE"); assert.equal(projectCustomerStatus({ order: final.orderState, payment: final.paymentState, fulfillment: final.fulfillmentState, production: final.productionState, shipment: final.shipmentState }).completed.includes("SHIPMENT_DELIVERED"), true); assert.equal((await restarted.events(record.id)).length, 15); assert.equal((await restarted.reviews(record.id))[0].operatorActionRequired, true);
});
