import { hasActiveConsent, type ConsentDecision } from "./consent.ts";
import {
  BIOGRAPHY_MAX_LENGTH,
  validateCallsign,
  validateOptionalDisplayName,
  type CityLevelLocation,
  type MemberProfile,
} from "./member.ts";

export type PublicMemberProfile = {
  publicId: string;
  callsign: string;
  displayName?: string;
  biography?: string;
  avatarUrl?: string;
  location?: CityLevelLocation;
};

function safeBiography(value: string | undefined): string | undefined {
  const normalized = value?.normalize("NFKC").trim();
  if (!normalized || normalized.length > BIOGRAPHY_MAX_LENGTH || /\p{Cc}/u.test(normalized)) {
    return undefined;
  }
  return normalized;
}

function safeAvatarUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function safeCityLevelLocation(
  location: CityLevelLocation | undefined,
): CityLevelLocation | undefined {
  if (!location) return undefined;
  const fields = [location.city, location.region, location.country];
  if (fields.some((field) => !field.trim() || field.length > 100 || /\p{Cc}/u.test(field))) {
    return undefined;
  }
  return {
    city: location.city.trim(),
    region: location.region.trim(),
    country: location.country.trim(),
  };
}

/**
 * Produces a public profile from an explicit allow-list. Authentication IDs,
 * member IDs, email, addresses, payments, preferences, and service information
 * cannot flow through because this helper never accepts private account data.
 */
export function projectPublicMemberProfile(
  profile: MemberProfile,
  consent: readonly ConsentDecision[],
): PublicMemberProfile | null {
  if (
    profile.visibility !== "PUBLIC" ||
    !hasActiveConsent(consent, "PUBLIC_MEMBER_PROFILE")
  ) {
    return null;
  }

  const callsign = validateCallsign(profile.callsign);
  if (!callsign.valid) return null;

  const publicProfile: PublicMemberProfile = {
    publicId: profile.publicId,
    callsign: callsign.callsign,
  };

  const displayName = validateOptionalDisplayName(profile.displayName);
  if (displayName.valid && displayName.value) publicProfile.displayName = displayName.value;
  const biography = safeBiography(profile.biography);
  if (biography) publicProfile.biography = biography;
  const avatarUrl = safeAvatarUrl(profile.avatarUrl);
  if (avatarUrl) publicProfile.avatarUrl = avatarUrl;
  const location = safeCityLevelLocation(profile.cityLevelLocation);
  if (
    location &&
    hasActiveConsent(consent, "PUBLIC_MEMBER_LOCATION")
  ) {
    publicProfile.location = location;
  }

  return publicProfile;
}
