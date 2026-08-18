import type { ProductServiceTier } from "../catalog";

export type GalleryAssetRights = "REUSABLE_FAFO_ASSET" | "REFERENCE_ONLY" | "PREVIOUS_CUSTOM_WORK" | "OWNER_REVIEW_REQUIRED";
export type GalleryAsset = Readonly<{ id: string; title: string; rights: GalleryAssetRights; compatibleProductSlugs: readonly string[]; tags: readonly string[] }>;
export type GuestBuildState = Readonly<{ buildId: string; productSlug: string; tier: Exclude<ProductServiceTier, "DEFAULT">; selectedAssetId?: string; personalization?: Record<string, string>; notes?: string; upload?: { status: "PENDING_INFRASTRUCTURE"; consentAcknowledged: boolean } }>;
export type NativeCheckoutRequest = Readonly<{ productSlug: string; tier: ProductServiceTier; buildId?: string; quantity: number }>;
export type PrintifyFulfillmentRequest = Readonly<{ orderId: string; idempotencyKey: string }>;

export const galleryAssetCanBeApplied = (asset: GalleryAsset, productSlug: string) => asset.rights === "REUSABLE_FAFO_ASSET" && asset.compatibleProductSlugs.includes(productSlug);
export const galleryAssetCanInspire = (asset: GalleryAsset) => asset.rights !== "REUSABLE_FAFO_ASSET";
export const buildHasUploadConsent = (build: GuestBuildState) => build.tier === "CUSTOM_BUILD" && build.upload?.consentAcknowledged === true;
