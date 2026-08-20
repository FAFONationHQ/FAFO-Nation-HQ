import { resolveFoundationModules } from "./modules";

export const fafoFoundationModules = resolveFoundationModules([
  { id: "catalog", enabled: true, capabilities: ["catalog.read"] },
  { id: "storefront", enabled: true, requiredModules: ["catalog"], capabilities: ["storefront.browse"] },
  { id: "external-purchase", enabled: true, requiredModules: ["storefront"], capabilities: ["product.external-purchase"] },
  { id: "personalization", enabled: true, requiredModules: ["catalog"], capabilities: ["product.personalization"] },
  { id: "custom-build", enabled: true, requiredModules: ["catalog"], optionalModules: ["gallery", "accounts"], capabilities: ["product.custom-build"] },
  { id: "gallery", enabled: true, capabilities: ["gallery.browse"] },
  { id: "accounts", enabled: false },
]);
