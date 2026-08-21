import type { FoundationModuleDefinition } from "../modules.ts";

/** Declarative boundaries; application composition decides which capabilities are installed. */
export const commerceModuleDefinitions: readonly FoundationModuleDefinition[] = [
  { id: "commerce-cart", enabled: false, requiredModules: ["catalog"], optionalModules: ["accounts", "inventory", "personalization", "custom-build"], capabilities: ["commerce.cart", "commerce.cart-orchestration"] },
  { id: "commerce-checkout", enabled: false, requiredModules: ["commerce-cart"], optionalModules: ["payments", "shipping", "tax", "accounts", "inventory"], capabilities: ["commerce.checkout", "commerce.checkout-orchestration"] },
  { id: "commerce-orders", enabled: false, requiredModules: ["commerce-checkout"], optionalModules: ["payments", "fulfillment", "accounts", "notifications"], capabilities: ["commerce.orders"] },
  { id: "payments", enabled: false, capabilities: ["commerce.payments"] },
  { id: "fulfillment", enabled: false, optionalModules: ["inventory"], capabilities: ["commerce.fulfillment"] },
  { id: "inventory", enabled: false, capabilities: ["commerce.inventory"] },
];
