/** Persistence ports deliberately use immutable snapshots, never Prisma types. */
export type PersistedCart = Readonly<{ id: string; version: number; snapshot: Readonly<Record<string, unknown>> }>;
export type PersistedTransaction = Readonly<{ id: string; version: number; snapshot: Readonly<Record<string, unknown>> }>;
export type PersistedEvent = Readonly<{ id: string; transactionId: string; sequence: number; type: string; payload?: Readonly<Record<string, unknown>> }>;
export type IdempotencyRecord = Readonly<{ key: string; operation: string; fingerprint: string; state: "COMPLETED" | "UNKNOWN"; result?: Readonly<Record<string, unknown>> }>;
export type ManualReviewRecord = Readonly<{ id: string; transactionId: string; reason: string; status: "OPEN" | "RESOLVED"; operatorActionRequired: boolean }>;
export class PersistenceConflictError extends Error { constructor(readonly code: "STALE_VERSION" | "IDEMPOTENCY_CONFLICT" | "REPOSITORY_UNAVAILABLE") { super(code); } }
export interface CommerceUnitOfWork { transaction<T>(work: () => T): T; }
export interface CommerceRepository { getCart(id: string): PersistedCart | null; saveCart(cart: PersistedCart, expectedVersion?: number): PersistedCart; getTransaction(id: string): PersistedTransaction | null; saveTransaction(transaction: PersistedTransaction): void; appendEvent(event: PersistedEvent): void; events(transactionId: string): readonly PersistedEvent[]; claimIdempotency(record: IdempotencyRecord): IdempotencyRecord; saveReview(review: ManualReviewRecord): void; reviews(transactionId: string): readonly ManualReviewRecord[]; }
/** Test/restart seam: a new instance can be constructed around these durable maps. */
export class InMemoryCommerceRepository implements CommerceRepository, CommerceUnitOfWork {
  readonly carts = new Map<string, PersistedCart>(); readonly transactions = new Map<string, PersistedTransaction>(); readonly idempotency = new Map<string, IdempotencyRecord>(); readonly audit = new Map<string, PersistedEvent>(); readonly review = new Map<string, ManualReviewRecord>();
  transaction<T>(work: () => T): T { const carts = new Map(this.carts), transactions = new Map(this.transactions), idempotency = new Map(this.idempotency), audit = new Map(this.audit), review = new Map(this.review); try { return work(); } catch (error) { this.carts.clear(); carts.forEach((value, key) => this.carts.set(key, value)); this.transactions.clear(); transactions.forEach((value, key) => this.transactions.set(key, value)); this.idempotency.clear(); idempotency.forEach((value, key) => this.idempotency.set(key, value)); this.audit.clear(); audit.forEach((value, key) => this.audit.set(key, value)); this.review.clear(); review.forEach((value, key) => this.review.set(key, value)); throw error; } }
  getCart(id: string) { return this.carts.get(id) ?? null; }
  saveCart(cart: PersistedCart, expectedVersion?: number) { const current = this.carts.get(cart.id); if (expectedVersion !== undefined && current?.version !== expectedVersion) throw new PersistenceConflictError("STALE_VERSION"); const next = Object.freeze({ ...cart, version: (current?.version ?? cart.version - 1) + 1 }); this.carts.set(next.id, next); return next; }
  getTransaction(id: string) { return this.transactions.get(id) ?? null; }
  saveTransaction(transaction: PersistedTransaction) { this.transactions.set(transaction.id, Object.freeze({ ...transaction })); }
  appendEvent(event: PersistedEvent) { if (!this.audit.has(event.id)) this.audit.set(event.id, Object.freeze({ ...event })); }
  events(transactionId: string) { return [...this.audit.values()].filter((event) => event.transactionId === transactionId).sort((a, b) => a.sequence - b.sequence); }
  claimIdempotency(record: IdempotencyRecord) { const current = this.idempotency.get(record.key); if (current && (current.operation !== record.operation || current.fingerprint !== record.fingerprint)) throw new PersistenceConflictError("IDEMPOTENCY_CONFLICT"); if (current) return current; this.idempotency.set(record.key, Object.freeze({ ...record })); return record; }
  saveReview(review: ManualReviewRecord) { this.review.set(review.id, Object.freeze({ ...review })); }
  reviews(transactionId: string) { return [...this.review.values()].filter((review) => review.transactionId === transactionId); }
}
export class CommerceApplicationService {
  constructor(private readonly repository: CommerceRepository & CommerceUnitOfWork) {}
  saveOrderAtomically(transaction: PersistedTransaction, event: PersistedEvent, idempotency: IdempotencyRecord) { return this.repository.transaction(() => { const claimed = this.repository.claimIdempotency(idempotency); if (claimed !== idempotency) return claimed; this.repository.saveTransaction(transaction); this.repository.appendEvent(event); return claimed; }); }
}
