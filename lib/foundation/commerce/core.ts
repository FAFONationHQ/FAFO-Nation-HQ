import { addMoney, createMoney, type Money } from "../money.ts";

export type CommerceFailureCode =
  | "VALIDATION_FAILURE" | "STALE_PRICE" | "PRODUCT_UNAVAILABLE" | "CONFIGURATION_INVALID"
  | "INVENTORY_UNAVAILABLE" | "PAYMENT_FAILURE" | "PAYMENT_REQUIRES_ACTION"
  | "FULFILLMENT_FAILURE" | "PROVIDER_UNAVAILABLE" | "DUPLICATE_OPERATION"
  | "INVALID_STATE_TRANSITION";

export class CommerceDomainError extends Error {
  constructor(readonly code: CommerceFailureCode, message: string, readonly causeCode?: string) {
    super(message); this.name = "CommerceDomainError";
  }
}

export type CommerceResult<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; failure: CommerceFailureCode }>;
export const success = <T>(value: T): CommerceResult<T> => ({ ok: true, value });
export const failure = (code: CommerceFailureCode): CommerceResult<never> => ({ ok: false, failure: code });

declare const identifierBrand: unique symbol;
export type CommerceIdentifier<TKind extends string> = string & { readonly [identifierBrand]: TKind };
function identifier<TKind extends string>(kind: TKind, value: string): CommerceIdentifier<TKind> {
  const normalized = value.trim();
  if (!normalized) throw new CommerceDomainError("VALIDATION_FAILURE", `${kind} must not be empty.`);
  return normalized as CommerceIdentifier<TKind>;
}
export const cartId = (value: string) => identifier("CartId", value);
export const cartItemId = (value: string) => identifier("CartItemId", value);
export const checkoutSessionId = (value: string) => identifier("CheckoutSessionId", value);
export const orderId = (value: string) => identifier("OrderId", value);
export const orderItemId = (value: string) => identifier("OrderItemId", value);
export const paymentId = (value: string) => identifier("PaymentId", value);
export const paymentAttemptId = (value: string) => identifier("PaymentAttemptId", value);
export const fulfillmentId = (value: string) => identifier("FulfillmentId", value);
export const fulfillmentRequestId = (value: string) => identifier("FulfillmentRequestId", value);
export const shipmentId = (value: string) => identifier("ShipmentId", value);
export const inventoryReservationId = (value: string) => identifier("InventoryReservationId", value);
export const idempotencyKey = (value: string) => identifier("IdempotencyKey", value);

export type CustomerReference = Readonly<{ kind: "GUEST"; reference: string } | { kind: "ACCOUNT"; reference: string }>;
export type CompletedConfiguration = Readonly<{
  kind: "PERSONALIZATION" | "CUSTOM_BUILD" | "COMPATIBLE";
  reference: string;
  summary?: string;
}>;
export type CommercialItemSnapshot = Readonly<{
  catalogProductId: string; title: string; variantReference?: string; selectedOptions?: Readonly<Record<string, string>>;
  quantity: number; unitPrice: Money; priceVersion: string; capturedAt: string;
  configuration?: CompletedConfiguration; fulfillmentReference?: string;
}>;
export function commercialItemSnapshot(input: CommercialItemSnapshot): CommercialItemSnapshot {
  if (!Number.isSafeInteger(input.quantity) || input.quantity < 1 || !input.catalogProductId.trim() || !input.title.trim() || !input.priceVersion.trim()) {
    throw new CommerceDomainError("VALIDATION_FAILURE", "Commercial item snapshot is incomplete or has an invalid quantity.");
  }
  if (!createMoney(input.unitPrice.minorUnits, input.unitPrice.currency)) throw new CommerceDomainError("VALIDATION_FAILURE", "Unit price is invalid.");
  return Object.freeze({ ...input, selectedOptions: input.selectedOptions ? Object.freeze({ ...input.selectedOptions }) : undefined });
}
export type Cart = Readonly<{ id: CommerceIdentifier<"CartId">; owner: CustomerReference; state: "ACTIVE" | "CHECKOUT_STARTED" | "ABANDONED"; items: readonly Readonly<{ id: CommerceIdentifier<"CartItemId">; snapshot: CommercialItemSnapshot }>[]; createdAt: string; updatedAt: string; version: number }>;
export function createCart(id: string, owner: CustomerReference, now: string): Cart { return Object.freeze({ id: cartId(id), owner: Object.freeze({ ...owner }), state: "ACTIVE", items: Object.freeze([]), createdAt: now, updatedAt: now, version: 1 }); }
export function addCartItem(cart: Cart, itemId: string, snapshot: CommercialItemSnapshot, now: string): Cart {
  if (cart.state !== "ACTIVE") throw new CommerceDomainError("INVALID_STATE_TRANSITION", "Items can only be added to an active cart.");
  if (cart.items.some((item) => item.id === itemId)) throw new CommerceDomainError("DUPLICATE_OPERATION", "Cart item already exists.");
  return Object.freeze({ ...cart, items: Object.freeze([...cart.items, Object.freeze({ id: cartItemId(itemId), snapshot: commercialItemSnapshot(snapshot) })]), updatedAt: now, version: cart.version + 1 });
}

export const CHECKOUT_STATES = ["OPEN", "VALIDATING", "READY", "SUBMITTING", "COMPLETED", "EXPIRED", "FAILED"] as const;
export type CheckoutState = typeof CHECKOUT_STATES[number];
export const ORDER_STATES = ["DRAFT", "SUBMITTED", "CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED", "FAILED"] as const;
export type OrderState = typeof ORDER_STATES[number];
export const PAYMENT_STATES = ["PENDING", "REQUIRES_ACTION", "AUTHORIZED", "CAPTURED", "FAILED", "CANCELLED", "PARTIALLY_REFUNDED", "REFUNDED"] as const;
export type PaymentState = typeof PAYMENT_STATES[number];
export const FULFILLMENT_STATES = ["NOT_REQUESTED", "QUEUED", "SUBMITTING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "FAILED", "CANCELLED"] as const;
export type FulfillmentState = typeof FULFILLMENT_STATES[number];
export const PRODUCTION_STATES = ["NOT_REQUIRED", "WAITING", "PRE_PRODUCTION", "IN_PRODUCTION", "COMPLETE", "BLOCKED", "FAILED", "CANCELLED"] as const;
export type ProductionState = typeof PRODUCTION_STATES[number];
export const SHIPMENT_STATES = ["NOT_REQUIRED", "NOT_SHIPPED", "PREPARING", "LABEL_CREATED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION", "RETURNED", "LOST", "CANCELLED"] as const;
export type ShipmentState = typeof SHIPMENT_STATES[number];

const transitions = {
  checkout: { OPEN: ["VALIDATING", "EXPIRED", "FAILED"], VALIDATING: ["READY", "FAILED", "EXPIRED"], READY: ["SUBMITTING", "EXPIRED"], SUBMITTING: ["COMPLETED", "FAILED"], COMPLETED: [], EXPIRED: [], FAILED: [] },
  order: { DRAFT: ["SUBMITTED", "CANCELLED"], SUBMITTED: ["CONFIRMED", "FAILED", "CANCELLED"], CONFIRMED: ["PROCESSING", "CANCELLED"], PROCESSING: ["COMPLETED", "CANCELLED", "FAILED"], COMPLETED: [], CANCELLED: [], FAILED: [] },
  payment: { PENDING: ["REQUIRES_ACTION", "AUTHORIZED", "CAPTURED", "FAILED", "CANCELLED"], REQUIRES_ACTION: ["AUTHORIZED", "CAPTURED", "FAILED", "CANCELLED"], AUTHORIZED: ["CAPTURED", "FAILED", "CANCELLED"], CAPTURED: ["PARTIALLY_REFUNDED", "REFUNDED"], FAILED: [], CANCELLED: [], PARTIALLY_REFUNDED: ["PARTIALLY_REFUNDED", "REFUNDED"], REFUNDED: [] },
  fulfillment: { NOT_REQUESTED: ["QUEUED", "CANCELLED"], QUEUED: ["SUBMITTING", "FAILED", "CANCELLED"], SUBMITTING: ["ACCEPTED", "FAILED", "CANCELLED"], ACCEPTED: ["IN_PROGRESS", "COMPLETED", "FAILED", "CANCELLED"], IN_PROGRESS: ["COMPLETED", "FAILED", "CANCELLED"], COMPLETED: [], FAILED: [], CANCELLED: [] },
  production: { NOT_REQUIRED: [], WAITING: ["PRE_PRODUCTION", "BLOCKED", "FAILED", "CANCELLED"], PRE_PRODUCTION: ["IN_PRODUCTION", "BLOCKED", "FAILED", "CANCELLED"], IN_PRODUCTION: ["COMPLETE", "BLOCKED", "FAILED", "CANCELLED"], COMPLETE: [], BLOCKED: ["PRE_PRODUCTION", "FAILED", "CANCELLED"], FAILED: [], CANCELLED: [] },
  shipment: { NOT_REQUIRED: [], NOT_SHIPPED: ["PREPARING", "CANCELLED"], PREPARING: ["LABEL_CREATED", "SHIPPED", "CANCELLED"], LABEL_CREATED: ["SHIPPED", "CANCELLED"], SHIPPED: ["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION", "LOST", "RETURNED"], IN_TRANSIT: ["OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION", "LOST", "RETURNED"], OUT_FOR_DELIVERY: ["DELIVERED", "EXCEPTION"], DELIVERED: ["RETURNED"], EXCEPTION: ["IN_TRANSIT", "RETURNED", "LOST"], RETURNED: [], LOST: [], CANCELLED: [] },
} as const;
type TransitionMap = Record<string, readonly string[]>;
function allowed<T extends string>(map: TransitionMap, from: T, to: T) { return (map[from] ?? []).includes(to); }
export const checkoutTransitionIsAllowed = (from: CheckoutState, to: CheckoutState) => allowed(transitions.checkout, from, to);
export const orderTransitionIsAllowed = (from: OrderState, to: OrderState) => allowed(transitions.order, from, to);
export const paymentTransitionIsAllowed = (from: PaymentState, to: PaymentState) => allowed(transitions.payment, from, to);
export const fulfillmentTransitionIsAllowed = (from: FulfillmentState, to: FulfillmentState) => allowed(transitions.fulfillment, from, to);
export const productionTransitionIsAllowed = (from: ProductionState, to: ProductionState) => allowed(transitions.production, from, to);
export const shipmentTransitionIsAllowed = (from: ShipmentState, to: ShipmentState) => allowed(transitions.shipment, from, to);

export type CheckoutSession = Readonly<{ id: CommerceIdentifier<"CheckoutSessionId">; cartId: CommerceIdentifier<"CartId">; state: CheckoutState; idempotencyKey: CommerceIdentifier<"IdempotencyKey">; expiresAt: string }>;
export function transitionCheckout(session: CheckoutSession, to: CheckoutState): CheckoutSession { if (!checkoutTransitionIsAllowed(session.state, to)) throw new CommerceDomainError("INVALID_STATE_TRANSITION", `Cannot transition checkout from ${session.state} to ${to}.`); return Object.freeze({ ...session, state: to }); }
export type OrderItem = Readonly<{ id: CommerceIdentifier<"OrderItemId">; snapshot: CommercialItemSnapshot; lineTotal: Money }>;
export function createOrderItem(id: string, snapshot: CommercialItemSnapshot): OrderItem { const stable = commercialItemSnapshot(snapshot); const total = createMoney(stable.unitPrice.minorUnits * stable.quantity, stable.unitPrice.currency); if (!total) throw new CommerceDomainError("VALIDATION_FAILURE", "Line total is invalid."); return Object.freeze({ id: orderItemId(id), snapshot: stable, lineTotal: total }); }
export type Order = Readonly<{ id: CommerceIdentifier<"OrderId">; owner: CustomerReference; state: OrderState; items: readonly OrderItem[] }>;
export function transitionOrder(order: Order, to: OrderState): Order { if (!orderTransitionIsAllowed(order.state, to)) throw new CommerceDomainError("INVALID_STATE_TRANSITION", `Cannot transition order from ${order.state} to ${to}.`); return Object.freeze({ ...order, state: to }); }

export type PriceValidation = Readonly<{ outcome: "VALID" | "PRICE_CHANGED" | "PRODUCT_CHANGED" | "PRODUCT_UNAVAILABLE" | "CONFIGURATION_CHANGED"; currentUnitPrice?: Money }>;
export type IdempotentOperation = Readonly<{ operation: "CHECKOUT_SUBMISSION" | "ORDER_CREATION" | "PAYMENT_CAPTURE" | "FULFILLMENT_SUBMISSION" | "REFUND_REQUEST" | "PROVIDER_EVENT"; key: CommerceIdentifier<"IdempotencyKey">; subjectReference: string }>;
export class InMemoryIdempotencyRegistry { private readonly seen = new Set<string>(); claim(operation: IdempotentOperation): CommerceResult<void> { const token = `${operation.operation}:${operation.key}:${operation.subjectReference}`; if (this.seen.has(token)) return failure("DUPLICATE_OPERATION"); this.seen.add(token); return success(undefined); } }

export type InventoryCapability = Readonly<{ availableQuantity(input: { skuReference: string }): Promise<number>; reserve(input: { reservationId: CommerceIdentifier<"InventoryReservationId">; skuReference: string; quantity: number }): Promise<CommerceResult<void>>; release(reservationId: CommerceIdentifier<"InventoryReservationId">): Promise<void>; commit(reservationId: CommerceIdentifier<"InventoryReservationId">): Promise<void> }>;
export interface PaymentProviderAdapter { readonly provider: string; createAttempt(input: { paymentId: CommerceIdentifier<"PaymentId">; amount: Money; idempotencyKey: CommerceIdentifier<"IdempotencyKey"> }): Promise<CommerceResult<{ providerReference: string }>>; }
export interface FulfillmentProviderAdapter { readonly provider: string; submit(input: { fulfillmentRequestId: CommerceIdentifier<"FulfillmentRequestId">; orderId: CommerceIdentifier<"OrderId">; idempotencyKey: CommerceIdentifier<"IdempotencyKey"> }): Promise<CommerceResult<{ providerReference: string }>>; }
export type CustomerTimelineKey = "ORDER_RECEIVED" | "PAYMENT_AUTHORIZED" | "PAYMENT_CAPTURED" | "PAYMENT_ACTION_REQUIRED" | "PAYMENT_FAILED" | "FULFILLMENT_ACCEPTED" | "FULFILLMENT_FAILED" | "PRODUCTION_IN_PROGRESS" | "PRODUCTION_ISSUE" | "SHIPMENT_IN_TRANSIT" | "SHIPMENT_DELIVERED" | "SHIPMENT_EXCEPTION";
export type CustomerStatusProjection = Readonly<{ completed: readonly CustomerTimelineKey[]; current: readonly CustomerTimelineKey[]; next: readonly CustomerTimelineKey[]; actionRequired: boolean; exception: boolean }>;
export function projectCustomerStatus(states: { order: OrderState; payment?: PaymentState; fulfillment?: FulfillmentState; production?: ProductionState; shipment?: ShipmentState }): CustomerStatusProjection {
  const completed: CustomerTimelineKey[] = states.order !== "DRAFT" ? ["ORDER_RECEIVED"] : []; const current: CustomerTimelineKey[] = []; const next: CustomerTimelineKey[] = []; let actionRequired = false; let exception = false;
  if (states.payment === "CAPTURED") completed.push("PAYMENT_CAPTURED"); else if (states.payment === "AUTHORIZED") completed.push("PAYMENT_AUTHORIZED"); else if (states.payment === "REQUIRES_ACTION") { current.push("PAYMENT_ACTION_REQUIRED"); actionRequired = true; } else if (states.payment === "FAILED") { current.push("PAYMENT_FAILED"); exception = true; }
  if (states.fulfillment === "ACCEPTED" || states.fulfillment === "IN_PROGRESS" || states.fulfillment === "COMPLETED") completed.push("FULFILLMENT_ACCEPTED"); else if (states.fulfillment === "FAILED") { current.push("FULFILLMENT_FAILED"); exception = true; }
  if (states.production === "IN_PRODUCTION") current.push("PRODUCTION_IN_PROGRESS"); else if (states.production === "BLOCKED" || states.production === "FAILED") { current.push("PRODUCTION_ISSUE"); exception = true; }
  if (states.shipment === "DELIVERED") completed.push("SHIPMENT_DELIVERED"); else if (states.shipment === "IN_TRANSIT" || states.shipment === "OUT_FOR_DELIVERY") current.push("SHIPMENT_IN_TRANSIT"); else if (states.shipment === "EXCEPTION" || states.shipment === "LOST") { current.push("SHIPMENT_EXCEPTION"); exception = true; } else if (states.fulfillment === "COMPLETED") next.push("SHIPMENT_IN_TRANSIT");
  return Object.freeze({ completed: Object.freeze(completed), current: Object.freeze(current), next: Object.freeze(next), actionRequired, exception });
}
export { addMoney, createMoney };
