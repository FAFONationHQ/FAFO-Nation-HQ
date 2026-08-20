import type { CatalogCollectionSlug, ProductServiceTier } from "../catalog";

export type GalleryAssetRights = "REUSABLE_FAFO_ASSET" | "REFERENCE_ONLY" | "PREVIOUS_CUSTOM_WORK" | "OWNER_REVIEW_REQUIRED";
export type GalleryAsset = Readonly<{ id: string; title: string; rights: GalleryAssetRights; compatibleProductSlugs: readonly string[]; tags: readonly string[] }>;
export type GalleryAssetId = string;
export type GalleryAssetCategory = "GRAPHIC" | "SHAPE" | "MOTIF" | "APPROVED_IMAGERY" | "PREVIOUS_CUSTOM_WORK";
export type GalleryCompatibility = "ALL_PRODUCTS" | CatalogCollectionSlug | `PRODUCT:${string}`;
export type GalleryRecord = Readonly<{ id: GalleryAssetId; title: string; category: GalleryAssetCategory; image: { src: string; alt: string }; rights: GalleryAssetRights; compatibility: readonly GalleryCompatibility[]; publicationState: "PUBLISHED" | "DRAFT" | "WITHHELD" }>;
export const galleryRecords: readonly GalleryRecord[] = [];
export type GuestBuildState = Readonly<{ buildId: string; productSlug: string; tier: Exclude<ProductServiceTier, "DEFAULT">; selectedAssetId?: string; personalization?: Record<string, string>; notes?: string; upload?: { status: "PENDING_INFRASTRUCTURE"; consentAcknowledged: boolean } }>;
export type NativeCheckoutRequest = Readonly<{ productSlug: string; tier: ProductServiceTier; buildId?: string; quantity: number }>;

export const galleryAssetCanBeApplied = (asset: GalleryAsset, productSlug: string) => asset.rights === "REUSABLE_FAFO_ASSET" && asset.compatibleProductSlugs.includes(productSlug);
export const galleryAssetCanInspire = (asset: GalleryAsset) => asset.rights !== "REUSABLE_FAFO_ASSET";
export const galleryRecordIsCompatible = (asset: GalleryRecord, productSlug: string, collection: CatalogCollectionSlug) => asset.compatibility.includes("ALL_PRODUCTS") || asset.compatibility.includes(collection) || asset.compatibility.includes(`PRODUCT:${productSlug}`);
export const buildHasUploadConsent = (build: GuestBuildState) => build.tier === "CUSTOM_BUILD" && build.upload?.consentAcknowledged === true;
