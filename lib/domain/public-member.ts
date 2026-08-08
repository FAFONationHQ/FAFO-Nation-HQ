import { hasActiveConsent, type ConsentDecision } from "@/lib/domain/consent";
import type { CityLevelLocation, MemberProfile } from "@/lib/domain/member";

export type PublicMemberProfile = {
  publicId: string;
  callsign: string;
  displayName?: string;
  biography?: string;
  avatarUrl?: string;
  location?: CityLevelLocation;
};

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

  const publicProfile: PublicMemberProfile = {
    publicId: profile.publicId,
    callsign: profile.callsign,
  };

  if (profile.displayName) publicProfile.displayName = profile.displayName;
  if (profile.biography) publicProfile.biography = profile.biography;
  if (profile.avatarUrl) publicProfile.avatarUrl = profile.avatarUrl;
  if (
    profile.cityLevelLocation &&
    hasActiveConsent(consent, "PUBLIC_MEMBER_LOCATION")
  ) {
    publicProfile.location = { ...profile.cityLevelLocation };
  }

  return publicProfile;
}
