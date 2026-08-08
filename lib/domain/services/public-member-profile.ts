import { normalizeCallsign } from "../member.ts";
import { projectPublicMemberProfile } from "../public-member.ts";
import type { MemberProfileRepository } from "../persistence/member-repositories.ts";
import {
  PersistenceOperationError,
  PersistenceUnavailableError,
} from "../persistence/member-repositories.ts";

export async function findConsentControlledPublicMember(
  rawCallsign: string,
  repository: MemberProfileRepository,
) {
  try {
    const candidate = await repository.findPublicCandidateByCallsign(normalizeCallsign(rawCallsign));
    if (!candidate) return null;
    return projectPublicMemberProfile(candidate.profile, candidate.consent);
  } catch (error) {
    if (error instanceof PersistenceUnavailableError || error instanceof PersistenceOperationError) {
      return null;
    }
    throw error;
  }
}
