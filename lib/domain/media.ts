export const MEDIA_CONTENT_TYPES = [
  "VIDEO",
  "LIVE_STREAM",
  "PODCAST",
  "INTERVIEW",
  "ARTICLE",
  "GALLERY",
  "ARTIST_FEATURE",
] as const;
export type MediaContentType = (typeof MEDIA_CONTENT_TYPES)[number];

export type MediaPublicationStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "UNPUBLISHED";
export type MediaRightsState = "UNKNOWN" | "PENDING" | "APPROVED" | "RESTRICTED" | "REVOKED";

export type MediaAttribution = {
  displayText: string;
  sourceUrl?: string;
  licenseLabel?: string;
};

export type MediaContentItem = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  contentType: MediaContentType;
  publicationStatus: MediaPublicationStatus;
  manuallyCurated: true;
  active: boolean;
  featured: boolean;
  homepage: boolean;
  sortOrder: number;
  creator?: { name: string; publicSlug?: string };
  attribution?: MediaAttribution;
  rightsState: MediaRightsState;
  externalLinks: readonly string[];
  publishedAt?: string;
  unpublishedAt?: string;
};

export type ArtistSeoData = {
  name: string;
  slug: string;
  summary: string;
  canonicalPath: `/media/${string}`;
  externalLinks: readonly string[];
};

export function mediaIsPubliclyRenderable(item: MediaContentItem): boolean {
  return (
    item.active &&
    item.publicationStatus === "PUBLISHED" &&
    item.rightsState === "APPROVED"
  );
}

export function mediaIsHomepageEligible(item: MediaContentItem): boolean {
  return item.manuallyCurated && item.homepage && mediaIsPubliclyRenderable(item);
}

export function defaultMediaPlacement() {
  return { active: false, featured: false, homepage: false } as const;
}
