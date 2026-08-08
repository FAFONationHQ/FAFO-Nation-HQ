import type {
  LaunchCountry,
  SupportedCurrency,
} from "../config/application.ts";

export const ORDER_LEDGER_AUTHORITY = "FAFO_INTERNAL_LEDGER" as const;

export type Money = Readonly<{
  minorUnits: number;
  currency: SupportedCurrency;
}>;

export function createMoney(
  minorUnits: number,
  currency: SupportedCurrency,
): Money | null {
  return Number.isSafeInteger(minorUnits) && minorUnits >= 0
    ? Object.freeze({ minorUnits, currency })
    : null;
}

export function addMoney(left: Money, right: Money): Money | null {
  if (left.currency !== right.currency) return null;
  return createMoney(left.minorUnits + right.minorUnits, left.currency);
}

export type CommerceMarket = LaunchCountry;
export type PaymentProvider = "STRIPE" | "PAYPAL";
export type FulfillmentProvider = "PRINTIFY" | "PRINTFUL";

export type ProviderReference<TProvider extends string> = Readonly<{
  provider: TProvider;
  externalId: string;
}>;

export const ORDER_STATES = [
  "DRAFT",
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
] as const;
export type OrderState = (typeof ORDER_STATES)[number];

export const PAYMENT_STATES = [
  "NOT_STARTED",
  "PENDING",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
  "CANCELLED",
] as const;
export type PaymentState = (typeof PAYMENT_STATES)[number];

export const FULFILLMENT_STATES = [
  "NOT_REQUESTED",
  "PENDING",
  "SUBMITTED",
  "IN_PRODUCTION",
  "SHIPPED",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
] as const;
export type FulfillmentState = (typeof FULFILLMENT_STATES)[number];

export const REFUND_STATES = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "PROCESSING",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
] as const;
export type RefundState = (typeof REFUND_STATES)[number];

const ORDER_TRANSITIONS: Record<OrderState, readonly OrderState[]> = {
  DRAFT: ["PENDING_PAYMENT", "CANCELLED"],
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const PAYMENT_TRANSITIONS: Record<PaymentState, readonly PaymentState[]> = {
  NOT_STARTED: ["PENDING", "CANCELLED"],
  PENDING: ["AUTHORIZED", "CAPTURED", "FAILED", "CANCELLED"],
  AUTHORIZED: ["CAPTURED", "FAILED", "CANCELLED"],
  CAPTURED: ["PARTIALLY_REFUNDED", "REFUNDED"],
  FAILED: ["PENDING", "CANCELLED"],
  PARTIALLY_REFUNDED: ["PARTIALLY_REFUNDED", "REFUNDED"],
  REFUNDED: [],
  CANCELLED: [],
};

const FULFILLMENT_TRANSITIONS: Record<FulfillmentState, readonly FulfillmentState[]> = {
  NOT_REQUESTED: ["PENDING", "CANCELLED"],
  PENDING: ["SUBMITTED", "FAILED", "CANCELLED"],
  SUBMITTED: ["IN_PRODUCTION", "FAILED", "CANCELLED"],
  IN_PRODUCTION: ["SHIPPED", "FAILED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "FAILED"],
  DELIVERED: [],
  FAILED: ["PENDING", "CANCELLED"],
  CANCELLED: [],
};

const REFUND_TRANSITIONS: Record<RefundState, readonly RefundState[]> = {
  REQUESTED: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["PROCESSING", "CANCELLED"],
  REJECTED: [],
  PROCESSING: ["SUCCEEDED", "FAILED"],
  SUCCEEDED: [],
  FAILED: ["PROCESSING", "CANCELLED"],
  CANCELLED: [],
};

function transitionIsAllowed<TState extends string>(
  transitions: Record<TState, readonly TState[]>,
  from: TState,
  to: TState,
): boolean {
  return transitions[from].includes(to);
}

export const orderTransitionIsAllowed = (from: OrderState, to: OrderState) =>
  transitionIsAllowed(ORDER_TRANSITIONS, from, to);
export const paymentTransitionIsAllowed = (from: PaymentState, to: PaymentState) =>
  transitionIsAllowed(PAYMENT_TRANSITIONS, from, to);
export const fulfillmentTransitionIsAllowed = (
  from: FulfillmentState,
  to: FulfillmentState,
) => transitionIsAllowed(FULFILLMENT_TRANSITIONS, from, to);
export const refundTransitionIsAllowed = (from: RefundState, to: RefundState) =>
  transitionIsAllowed(REFUND_TRANSITIONS, from, to);

export type ImmutablePriceSnapshot = Readonly<{
  productId: string;
  variantId?: string;
  unitPrice: Money;
  quantity: number;
  capturedAt: string;
  priceVersion: string;
}>;

export type OrderEventType =
  | "ORDER_CREATED"
  | "PAYMENT_STATE_CHANGED"
  | "FULFILLMENT_STATE_CHANGED"
  | "REFUND_STATE_CHANGED"
  | "ORDER_CANCELLED"
  | "ORDER_COMPLETED";

export interface PaymentProviderAdapter {
  readonly provider: PaymentProvider;
  createPayment(input: {
    orderId: string;
    amount: Money;
    idempotencyKey: string;
  }): Promise<ProviderReference<PaymentProvider>>;
}

export interface FulfillmentProviderAdapter {
  readonly provider: FulfillmentProvider;
  submitFulfillment(input: {
    orderId: string;
    market: CommerceMarket;
    idempotencyKey: string;
  }): Promise<ProviderReference<FulfillmentProvider>>;
}
