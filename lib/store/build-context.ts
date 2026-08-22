import { fafoStorefrontCatalog } from "../catalog/fafo-storefront-catalog";
import { capabilityIsEnabled } from "../foundation/modules";
import { fafoFoundationModules } from "../foundation/fafo-composition";
import { buildCapabilityFromRoute, type BuildCapabilityId } from "./build-capabilities";

export function resolveBuildContext(routeCapability: string, productSlug: string) {
  const capability = buildCapabilityFromRoute(routeCapability);
  const product = fafoStorefrontCatalog.getPublishedProduct(productSlug);
  const action = capability ? product?.actions.find((candidate) => candidate.id === capability && candidate.status === "AVAILABLE") : undefined;
  return capability && product && action ? { capability, product, action } : null;
}

export function galleryIsAvailableFor(capability: BuildCapabilityId): boolean {
  return capability === "custom-build" && capabilityIsEnabled(fafoFoundationModules, "gallery.browse");
}
