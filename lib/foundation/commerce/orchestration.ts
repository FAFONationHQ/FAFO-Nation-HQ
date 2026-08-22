import type { Money } from "../money.ts";
import { addMoney, cartItemId, checkoutSessionId, createMoney, idempotencyKey, transitionCheckout, type Cart, type CheckoutSession, type CommercialItemSnapshot, type CommerceIdentifier, type CommerceResult, type CustomerReference, type InventoryCapability, failure, success } from "./core.ts";

export type AvailabilityState = "AVAILABLE" | "SOLD_OUT" | "BACK_SOON" | "TEMPORARILY_UNAVAILABLE" | "NEEDS_ATTENTION" | "UNAVAILABLE";
export type CommercialValidationCode = "VALID" | "PRICE_CHANGED" | "PRODUCT_CHANGED" | "PRODUCT_UNAVAILABLE" | "SOLD_OUT" | "TEMPORARILY_UNAVAILABLE" | "BACK_SOON" | "CONFIGURATION_CHANGED" | "CONFIGURATION_INVALID" | "QUANTITY_INVALID" | "CURRENCY_MISMATCH" | "INVENTORY_UNAVAILABLE";
export type CapabilityEvaluation = "PASSED" | "NOT_REQUIRED" | "CAPABILITY_NOT_INSTALLED" | "REQUIRED" | "UNAVAILABLE" | "PENDING_CAPABILITY";

export type AuthoritativeCommercialItem = Readonly<{
  catalogProductId: string; variantReference?: string; unitPrice: Money; priceVersion: string;
  productState: "AVAILABLE" | "UNPUBLISHED" | "REMOVED" | "VARIANT_REMOVED" | "SOLD_OUT" | "BACK_SOON" | "TEMPORARILY_UNAVAILABLE";
  configurationState?: "VALID" | "CHANGED" | "INVALID";
  quantityLimit?: number;
  inventoryRequirement?: "NOT_REQUIRED" | "REQUIRED";
  shippingRequirement?: "NOT_REQUIRED" | "REQUIRED" | "PENDING_CAPABILITY";
  taxRequirement?: "NOT_REQUIRED" | "REQUIRED" | "PENDING_CAPABILITY";
}>;

/** Server-side port. Its source may be a catalog, provider adapter, or fixture; browser values never satisfy it. */
export interface AuthoritativeCommercialCatalog { find(snapshot: CommercialItemSnapshot): AuthoritativeCommercialItem | null; }
export interface InventoryValidationPort { availability(input: { item: AuthoritativeCommercialItem; quantity: number }): "AVAILABLE" | "SOLD_OUT" | "UNAVAILABLE"; }
export type LineValidation = Readonly<{
  lineId: CommerceIdentifier<"CartItemId">; code: CommercialValidationCode; availability: AvailabilityState;
  currentUnitPrice?: Money; recoverable: boolean; customerActionRequired: boolean;
}>;

export function projectAvailability(code: CommercialValidationCode): AvailabilityState {
  if (code === "SOLD_OUT") return "SOLD_OUT";
  if (code === "BACK_SOON") return "BACK_SOON";
  if (code === "TEMPORARILY_UNAVAILABLE" || code === "INVENTORY_UNAVAILABLE") return "TEMPORARILY_UNAVAILABLE";
  if (code === "CONFIGURATION_CHANGED" || code === "CONFIGURATION_INVALID") return "NEEDS_ATTENTION";
  if (code === "PRODUCT_UNAVAILABLE" || code === "PRODUCT_CHANGED") return "UNAVAILABLE";
  return "AVAILABLE";
}

function line(code: CommercialValidationCode, lineId: CommerceIdentifier<"CartItemId">, currentUnitPrice?: Money): LineValidation {
  return Object.freeze({ lineId, code, availability: projectAvailability(code), currentUnitPrice, recoverable: code !== "VALID", customerActionRequired: code !== "VALID" });
}

export function validateCartLine(input: { lineId: CommerceIdentifier<"CartItemId">; snapshot: CommercialItemSnapshot; catalog: AuthoritativeCommercialCatalog; inventory?: InventoryValidationPort }): LineValidation {
  const current = input.catalog.find(input.snapshot);
  if (!current) return line("PRODUCT_UNAVAILABLE", input.lineId);
  if (current.productState === "UNPUBLISHED" || current.productState === "REMOVED" || current.productState === "VARIANT_REMOVED") return line(current.productState === "VARIANT_REMOVED" ? "PRODUCT_CHANGED" : "PRODUCT_UNAVAILABLE", input.lineId);
  if (current.productState === "SOLD_OUT") return line("SOLD_OUT", input.lineId);
  if (current.productState === "BACK_SOON") return line("BACK_SOON", input.lineId);
  if (current.productState === "TEMPORARILY_UNAVAILABLE") return line("TEMPORARILY_UNAVAILABLE", input.lineId);
  if (current.configurationState === "INVALID") return line("CONFIGURATION_INVALID", input.lineId);
  if (current.configurationState === "CHANGED") return line("CONFIGURATION_CHANGED", input.lineId);
  if (!Number.isSafeInteger(input.snapshot.quantity) || input.snapshot.quantity < 1 || (current.quantityLimit !== undefined && input.snapshot.quantity > current.quantityLimit)) return line("QUANTITY_INVALID", input.lineId);
  if (current.unitPrice.currency !== input.snapshot.unitPrice.currency) return line("CURRENCY_MISMATCH", input.lineId, current.unitPrice);
  if (current.unitPrice.minorUnits !== input.snapshot.unitPrice.minorUnits || current.priceVersion !== input.snapshot.priceVersion) return line("PRICE_CHANGED", input.lineId, current.unitPrice);
  if (current.inventoryRequirement === "REQUIRED") {
    if (!input.inventory) return line("INVENTORY_UNAVAILABLE", input.lineId);
    const availability = input.inventory.availability({ item: current, quantity: input.snapshot.quantity });
    if (availability === "SOLD_OUT") return line("SOLD_OUT", input.lineId);
    if (availability !== "AVAILABLE") return line("INVENTORY_UNAVAILABLE", input.lineId);
  }
  return line("VALID", input.lineId);
}

export function commercialLineIdentity(snapshot: CommercialItemSnapshot): string {
  return JSON.stringify({ product: snapshot.catalogProductId, variant: snapshot.variantReference ?? null, options: Object.entries(snapshot.selectedOptions ?? {}).sort(([a], [b]) => a.localeCompare(b)), action: snapshot.commercialAction ?? null, configuration: snapshot.configuration ? [snapshot.configuration.kind, snapshot.configuration.reference] : null, price: [snapshot.unitPrice.minorUnits, snapshot.unitPrice.currency, snapshot.priceVersion] });
}
function replaceSnapshotQuantity(snapshot: CommercialItemSnapshot, quantity: number): CommercialItemSnapshot { return Object.freeze({ ...snapshot, quantity }); }
export function addOrMergeCartLine(cart: Cart, itemId: string, snapshot: CommercialItemSnapshot, now: string): Cart {
  const identity = commercialLineIdentity(snapshot); const existing = cart.items.find((item) => commercialLineIdentity(item.snapshot) === identity);
  if (!existing) return Object.freeze({ ...cart, items: Object.freeze([...cart.items, Object.freeze({ id: cartItemId(itemId), snapshot })]), updatedAt: now, version: cart.version + 1 });
  const quantity = existing.snapshot.quantity + snapshot.quantity;
  if (!Number.isSafeInteger(quantity)) throw new Error("Quantity exceeds safe integer range.");
  return Object.freeze({ ...cart, items: Object.freeze(cart.items.map((item) => item.id === existing.id ? Object.freeze({ ...item, snapshot: replaceSnapshotQuantity(item.snapshot, quantity) }) : item)), updatedAt: now, version: cart.version + 1 });
}
export function updateCartLineQuantity(cart: Cart, lineId: CommerceIdentifier<"CartItemId">, quantity: number, now: string): Cart {
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error("Quantity must be a positive safe integer.");
  if (!cart.items.some((item) => item.id === lineId)) throw new Error("Cart line does not exist.");
  return Object.freeze({ ...cart, items: Object.freeze(cart.items.map((item) => item.id === lineId ? Object.freeze({ ...item, snapshot: replaceSnapshotQuantity(item.snapshot, quantity) }) : item)), updatedAt: now, version: cart.version + 1 });
}
export function removeCartLine(cart: Cart, lineId: CommerceIdentifier<"CartItemId">, now: string): Cart { return Object.freeze({ ...cart, items: Object.freeze(cart.items.filter((item) => item.id !== lineId)), updatedAt: now, version: cart.version + 1 }); }
export function lineSubtotal(snapshot: CommercialItemSnapshot): Money { const value = createMoney(snapshot.unitPrice.minorUnits * snapshot.quantity, snapshot.unitPrice.currency); if (!value) throw new Error("Invalid line total."); return value; }
export function cartSubtotal(cart: Cart): Money | null { return cart.items.reduce<Money | null>((total, item) => total === null ? null : addMoney(total, lineSubtotal(item.snapshot)), createMoney(0, cart.items[0]?.snapshot.unitPrice.currency ?? "XXX")); }

export type CheckoutReadiness = Readonly<{
  status: "READY_FOR_PAYMENT" | "REQUIRES_ATTENTION" | "EXPIRED" | "STALE_CART";
  session: CheckoutSession; cartVersion: number; lines: readonly LineValidation[];
  inventory: CapabilityEvaluation; shipping: CapabilityEvaluation; tax: CapabilityEvaluation; customer: "SUFFICIENT" | "REQUIRED_INFORMATION_MISSING";
}>;
export function startCheckout(input: { id: string; cart: Cart; key: string; expiresAt: string }): CheckoutSession & { cartVersion: number } { return Object.freeze({ id: checkoutSessionId(input.id), cartId: input.cart.id, state: "VALIDATING", idempotencyKey: idempotencyKey(input.key), expiresAt: input.expiresAt, cartVersion: input.cart.version }); }
export function evaluateCheckout(input: { session: CheckoutSession & { cartVersion: number }; cart: Cart; now: string; catalog: AuthoritativeCommercialCatalog; inventory?: InventoryValidationPort }): CheckoutReadiness {
  if (Date.parse(input.now) >= Date.parse(input.session.expiresAt)) return Object.freeze({ status: "EXPIRED", session: transitionCheckout(input.session, "EXPIRED"), cartVersion: input.session.cartVersion, lines: [], inventory: "NOT_REQUIRED", shipping: "NOT_REQUIRED", tax: "NOT_REQUIRED", customer: "SUFFICIENT" });
  if (input.session.cartVersion !== input.cart.version) return Object.freeze({ status: "STALE_CART", session: input.session, cartVersion: input.session.cartVersion, lines: [], inventory: "NOT_REQUIRED", shipping: "NOT_REQUIRED", tax: "NOT_REQUIRED", customer: "SUFFICIENT" });
  const lines = Object.freeze(input.cart.items.map((item) => validateCartLine({ lineId: item.id, snapshot: item.snapshot, catalog: input.catalog, inventory: input.inventory })));
  const authoritative = input.cart.items.map((item) => input.catalog.find(item.snapshot));
  const inventoryRequired = authoritative.some((item) => item?.inventoryRequirement === "REQUIRED");
  const inventory: CapabilityEvaluation = inventoryRequired ? (input.inventory ? (lines.some((result) => result.code === "INVENTORY_UNAVAILABLE" || result.code === "SOLD_OUT") ? "UNAVAILABLE" : "PASSED") : "CAPABILITY_NOT_INSTALLED") : "NOT_REQUIRED";
  const requirement = (field: "shippingRequirement" | "taxRequirement"): CapabilityEvaluation => authoritative.some((item) => item?.[field] === "PENDING_CAPABILITY") ? "PENDING_CAPABILITY" : authoritative.some((item) => item?.[field] === "REQUIRED") ? "REQUIRED" : "NOT_REQUIRED";
  const customer: CheckoutReadiness["customer"] = input.cart.owner.reference.trim() ? "SUFFICIENT" : "REQUIRED_INFORMATION_MISSING";
  const ready = lines.every((result) => result.code === "VALID") && inventory !== "CAPABILITY_NOT_INSTALLED" && inventory !== "UNAVAILABLE" && customer === "SUFFICIENT";
  return Object.freeze({ status: ready ? "READY_FOR_PAYMENT" : "REQUIRES_ATTENTION", session: ready ? transitionCheckout(input.session, "READY") : input.session, cartVersion: input.cart.version, lines, inventory, shipping: requirement("shippingRequirement"), tax: requirement("taxRequirement"), customer });
}

export class InMemoryCheckoutSubmissionService {
  private readonly submissions = new Map<string, { fingerprint: string; session: CheckoutSession & { cartVersion: number } }>();
  submit(input: { id: string; cart: Cart; owner: CustomerReference; key: string; expiresAt: string }): CommerceResult<CheckoutSession & { cartVersion: number }> {
    const fingerprint = JSON.stringify({ cart: input.cart.id, version: input.cart.version, owner: input.owner }); const existing = this.submissions.get(input.key);
    if (existing) return existing.fingerprint === fingerprint ? success(existing.session) : failure("DUPLICATE_OPERATION");
    const session = startCheckout(input); this.submissions.set(input.key, { fingerprint, session }); return success(session);
  }
}
export type OptionalInventoryBoundary = Pick<InventoryCapability, "availableQuantity">;
