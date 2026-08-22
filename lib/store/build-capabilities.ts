export const BUILD_CAPABILITY_IDS = ["personalization", "custom-build"] as const;
export type BuildCapabilityId = (typeof BUILD_CAPABILITY_IDS)[number];

export type CompletedPersonalizationConfiguration = Readonly<{
  kind: "personalization";
  productSlug: string;
  values: Readonly<Record<string, string>>;
}>;

export type CompletedBuildConfiguration = Readonly<{
  kind: "custom-build";
  productSlug: string;
  selectedAssetId?: string;
  notes?: string;
}>;

export type CompletedProductConfiguration =
  | CompletedPersonalizationConfiguration
  | CompletedBuildConfiguration;

export function buildCapabilityFromRoute(value: string): BuildCapabilityId | null {
  return BUILD_CAPABILITY_IDS.includes(value as BuildCapabilityId)
    ? value as BuildCapabilityId
    : null;
}

export function buildCapabilityRoute(
  capability: BuildCapabilityId,
  productSlug: string,
  destination: "build" | "gallery" | "review" = "build",
): string {
  return `/store/${destination}/${capability}/${productSlug}`;
}
