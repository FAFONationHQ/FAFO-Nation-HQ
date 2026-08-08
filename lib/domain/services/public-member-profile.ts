import { normalizeCallsign } from "../member.ts";
import { projectPublicMemberProfile } from "../public-member.ts";
import type { MemberProfileRepository } from "../persistence/member-repositories.ts";

export async function findConsentControlledPublicMember(
  rawCallsign: string,
  repository: MemberProfileRepository,
) {
  const candidate = await repository.findPublicCandidateByCallsign(normalizeCallsign(rawCallsign));
  if (!candidate) return null;
  return projectPublicMemberProfile(candidate.profile, candidate.consent);
}
