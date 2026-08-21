import { Prisma, type PrismaClient } from "@prisma/client";
import { PersistenceConflictError, type IdempotencyRecord, type PersistedCart, type PersistedEvent, type PersistedTransaction } from "./foundation/commerce/persistence.ts";

type Client = PrismaClient | Prisma.TransactionClient;
type Json = Prisma.InputJsonValue;
const json = (value: Readonly<Record<string, unknown>>): Json => JSON.parse(JSON.stringify(value)) as Json;
const now = () => new Date();

export type PrismaCart = PersistedCart & Readonly<{ ownerKind: "GUEST" | "ACCOUNT"; ownerRef: string; state?: string }>;
export type PrismaCheckout = Readonly<{ id: string; cartId: string; cartVersion: number; state: string; idempotencyKey: string; fingerprint: string; readiness: Readonly<Record<string, unknown>>; expiresAt: Date }>;
export type PrismaOrder = PersistedTransaction & Readonly<{ checkoutId: string; cartVersion: number; orderState: string; paymentState: string; fulfillmentState: string; productionState: string; shipmentState: string; subtotalMinor: number; currency: string; items: readonly Readonly<{ id: string; snapshot: Readonly<Record<string, unknown>> }>[] }>;
export type PrismaOperation = Readonly<{ id: string; orderId: string; kind: string; provider?: string; idempotencyKey: string; state: string; reconciliation: string; diagnostic?: Readonly<Record<string, unknown>> }>;

/** PostgreSQL implementation of the V1D persistence boundary. No Commerce caller imports Prisma types. */
export class PrismaCommerceAdapter {
  constructor(private readonly client: PrismaClient) {}
  private async withTransaction<T>(work: (client: Prisma.TransactionClient) => Promise<T>): Promise<T> { return this.client.$transaction(work); }

  async getCart(id: string): Promise<PersistedCart | null> {
    const cart = await this.client.commerceCart.findUnique({ where: { id } });
    return cart ? Object.freeze({ id: cart.id, version: cart.version, snapshot: cart.snapshot as Record<string, unknown> }) : null;
  }

  async saveCart(input: PrismaCart, expectedVersion?: number): Promise<PersistedCart> {
    const state = input.state ?? "ACTIVE"; const snapshot = json(input.snapshot);
    if (expectedVersion === undefined) {
      try { const saved = await this.client.commerceCart.create({ data: { id: input.id, ownerKind: input.ownerKind, ownerRef: input.ownerRef, state, version: input.version, snapshot, createdAt: now(), updatedAt: now() } }); return Object.freeze({ id: saved.id, version: saved.version, snapshot: saved.snapshot as Record<string, unknown> }); }
      catch (error) { if ((error as { code?: string }).code === "P2002") throw new PersistenceConflictError("STALE_VERSION"); throw error; }
    }
    const result = await this.client.commerceCart.updateMany({ where: { id: input.id, version: expectedVersion }, data: { ownerKind: input.ownerKind, ownerRef: input.ownerRef, state, snapshot, version: { increment: 1 }, updatedAt: now() } });
    if (result.count !== 1) throw new PersistenceConflictError("STALE_VERSION"); return (await this.getCart(input.id))!;
  }

  async submitCheckout(input: PrismaCheckout): Promise<PrismaCheckout> {
    try { await this.client.commerceCheckoutSession.create({ data: { id: input.id, cartId: input.cartId, cartVersion: input.cartVersion, state: input.state, idempotencyKey: input.idempotencyKey, readiness: json({ fingerprint: input.fingerprint, ...input.readiness }), expiresAt: input.expiresAt, createdAt: now(), updatedAt: now() } }); return input; }
    catch (error) { if ((error as { code?: string }).code !== "P2002") throw error; const saved = await this.client.commerceCheckoutSession.findUniqueOrThrow({ where: { idempotencyKey: input.idempotencyKey } }); if ((saved.readiness as { fingerprint?: string }).fingerprint !== input.fingerprint) throw new PersistenceConflictError("IDEMPOTENCY_CONFLICT"); return Object.freeze({ id: saved.id, cartId: saved.cartId, cartVersion: saved.cartVersion, state: saved.state, idempotencyKey: saved.idempotencyKey, fingerprint: input.fingerprint, readiness: saved.readiness as Record<string, unknown>, expiresAt: saved.expiresAt }); }
  }

  async claimIdempotency(record: IdempotencyRecord, client: Client = this.client): Promise<IdempotencyRecord> {
    try { const saved = await client.commerceIdempotency.create({ data: { key: record.key, operation: record.operation, fingerprint: record.fingerprint, state: record.state, result: record.result ? json(record.result) : undefined, createdAt: now(), updatedAt: now() } }); return Object.freeze({ key: saved.key, operation: saved.operation, fingerprint: saved.fingerprint, state: saved.state as IdempotencyRecord["state"], result: saved.result as Record<string, unknown> | undefined }); }
    catch (error) { if ((error as { code?: string }).code !== "P2002") throw error; const saved = await client.commerceIdempotency.findUniqueOrThrow({ where: { key: record.key } }); if (saved.operation !== record.operation || saved.fingerprint !== record.fingerprint) throw new PersistenceConflictError("IDEMPOTENCY_CONFLICT"); return Object.freeze({ key: saved.key, operation: saved.operation, fingerprint: saved.fingerprint, state: saved.state as IdempotencyRecord["state"], result: saved.result as Record<string, unknown> | undefined }); }
  }

  async createOrder(input: PrismaOrder & Readonly<{ idempotency: IdempotencyRecord; event: PersistedEvent }>): Promise<IdempotencyRecord> { return this.withTransaction(async (client) => { const existing = await client.commerceIdempotency.findUnique({ where: { key: input.idempotency.key } }); if (existing) { if (existing.operation !== input.idempotency.operation || existing.fingerprint !== input.idempotency.fingerprint) throw new PersistenceConflictError("IDEMPOTENCY_CONFLICT"); return Object.freeze({ key: existing.key, operation: existing.operation, fingerprint: existing.fingerprint, state: existing.state as IdempotencyRecord["state"], result: existing.result as Record<string, unknown> | undefined }); } await this.claimIdempotency(input.idempotency, client); await client.commerceOrder.create({ data: { id: input.id, checkoutId: input.checkoutId, cartVersion: input.cartVersion, orderState: input.orderState, paymentState: input.paymentState, fulfillmentState: input.fulfillmentState, productionState: input.productionState, shipmentState: input.shipmentState, subtotalMinor: input.subtotalMinor, currency: input.currency, snapshot: json(input.snapshot), createdAt: now(), updatedAt: now(), items: { create: input.items.map((item) => ({ id: item.id, snapshot: json(item.snapshot) })) } } }); await this.appendEvent(input.event, client); await client.commerceIdempotency.update({ where: { key: input.idempotency.key }, data: { result: json({ orderId: input.id }), updatedAt: now() } }); return Object.freeze({ ...input.idempotency, result: { orderId: input.id } }); }); }

  async executeOperation(input: PrismaOperation & Readonly<{ event: PersistedEvent }>): Promise<PrismaOperation> {
    const project = (saved: { id: string; orderId: string; kind: string; provider: string | null; idempotencyKey: string; state: string; reconciliation: string; diagnostic: Prisma.JsonValue | null }) => Object.freeze({ id: saved.id, orderId: saved.orderId, kind: saved.kind, provider: saved.provider ?? undefined, idempotencyKey: saved.idempotencyKey, state: saved.state, reconciliation: saved.reconciliation, diagnostic: saved.diagnostic as Record<string, unknown> | undefined });
    try {
      return await this.withTransaction(async (client) => {
        const existing = await client.commerceOperation.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
        if (existing) { if (existing.orderId !== input.orderId || existing.kind !== input.kind) throw new PersistenceConflictError("IDEMPOTENCY_CONFLICT"); return project(existing); }
        const saved = await client.commerceOperation.create({ data: { id: input.id, orderId: input.orderId, kind: input.kind, provider: input.provider, idempotencyKey: input.idempotencyKey, state: input.state, reconciliation: input.reconciliation, version: 1, diagnostic: input.diagnostic ? json(input.diagnostic) : undefined, createdAt: now(), updatedAt: now() } });
        await this.appendEvent({ ...input.event, transactionId: input.orderId }, client);
        return project(saved);
      });
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error;
      const existing = await this.client.commerceOperation.findUniqueOrThrow({ where: { idempotencyKey: input.idempotencyKey } });
      if (existing.orderId !== input.orderId || existing.kind !== input.kind) throw new PersistenceConflictError("IDEMPOTENCY_CONFLICT");
      return project(existing);
    }
  }
  async reconcileOperation(idempotencyKey: string, state: string, reconciliation: string): Promise<void> { await this.client.commerceOperation.update({ where: { idempotencyKey }, data: { state, reconciliation, version: { increment: 1 }, updatedAt: now() } }); }
  async appendEvent(event: PersistedEvent, client: Client = this.client): Promise<boolean> { try { await client.commerceEvent.create({ data: { id: event.id, orderId: event.transactionId, eventType: event.type, correlationId: event.payload?.correlationId as string | undefined, sequence: event.sequence, occurredAt: now(), payload: event.payload ? json(event.payload) : undefined } }); return true; } catch (error) { if ((error as { code?: string }).code === "P2002") return false; throw error; } }
  async applyLifecycleEvent(input: PersistedEvent & Readonly<{ field: "paymentState" | "fulfillmentState" | "productionState" | "shipmentState"; state: string }>): Promise<boolean> { return this.withTransaction(async (client) => { const latest = await client.commerceEvent.findFirst({ where: { orderId: input.transactionId, eventType: input.type }, orderBy: { sequence: "desc" } }); if (latest && latest.sequence >= input.sequence) return false; if (!await this.appendEvent(input, client)) return false; await client.commerceOrder.update({ where: { id: input.transactionId }, data: { [input.field]: input.state, updatedAt: now() } }); return true; }); }
  async saveReview(input: Readonly<{ id: string; orderId: string; operationId?: string; reason: string; customerActionRequired?: boolean; operatorActionRequired: boolean }>): Promise<void> { await this.client.commerceManualReview.upsert({ where: { id: input.id }, create: { id: input.id, orderId: input.orderId, operationId: input.operationId, reason: input.reason, status: "OPEN", customerActionRequired: input.customerActionRequired ?? false, operatorActionRequired: input.operatorActionRequired, createdAt: now(), updatedAt: now() }, update: {} }); }
  async events(orderId: string) { return this.client.commerceEvent.findMany({ where: { orderId }, orderBy: [{ sequence: "asc" }, { occurredAt: "asc" }] }); }
  async reviews(orderId: string) { return this.client.commerceManualReview.findMany({ where: { orderId }, orderBy: { createdAt: "asc" } }); }
  async getOrder(id: string) { return this.client.commerceOrder.findUnique({ where: { id }, include: { items: { orderBy: { id: "asc" } } } }); }
}
