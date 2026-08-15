export const FEATURE_STATES = [
  "LIVE",
  "PREVIEW",
  "PLANNED",
  "BLOCKED",
] as const;

export type FeatureState = (typeof FEATURE_STATES)[number];

export const FEATURE_STATUS = {
  publicSite: "LIVE",
  memberAccounts: "PLANNED",
  commerce: "PREVIEW",
  customShop: "PLANNED",
  media: "PREVIEW",
  community: "PREVIEW",
  fafoCares: "BLOCKED",
  fafoWorld: "LIVE",
  fafoWorldDynamicPublishing: "PLANNED",
} as const satisfies Record<string, FeatureState>;

export type FeatureKey = keyof typeof FEATURE_STATUS;

export function featureIsPubliclyAvailable(feature: FeatureKey): boolean {
  return FEATURE_STATUS[feature] === "LIVE";
}
