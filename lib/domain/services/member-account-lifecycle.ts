import { CONSENT_PURPOSES, hasActiveConsent } from "../consent.ts";
import {
  createAccountDeletionPreview,
  createMemberAccountExport,
} from "../account-lifecycle.ts";
import type {
  ConsentDecisionRepository,
  MemberIdentityRepository,
  MemberProfileRepository,
  MemberRepositoryUnitOfWork,
} from "../persistence/member-repositories.ts";

export class MemberSelfServiceAccessError extends Error {
  constructor() {
    super("The requested member operation is unavailable.");
    this.name = "MemberSelfServiceAccessError";
  }
}

function assertSelfServiceTarget(authenticatedMemberId: string, requestedMemberId: string) {
  if (!authenticatedMemberId || authenticatedMemberId !== requestedMemberId) {
    throw new MemberSelfServiceAccessError();
  }
}

export async function exportOwnMemberAccount(
  input: { authenticatedMemberId: string; requestedMemberId: string; exportedAt?: Date },
  identities: MemberIdentityRepository,
  profiles: MemberProfileRepository,
  consents: ConsentDecisionRepository,
) {
  assertSelfServiceTarget(input.authenticatedMemberId, input.requestedMemberId);
  const member = await identities.findMemberById(input.authenticatedMemberId);
  if (!member) throw new MemberSelfServiceAccessError();
  const [profile, consentHistory] = await Promise.all([
    profiles.findPrivateProfileByMemberId(member.id),
    consents.listForMember(member.id),
  ]);
  return createMemberAccountExport(member, profile, consentHistory, input.exportedAt);
}

export async function previewOwnAccountDeletion(
  input: { authenticatedMemberId: string; requestedMemberId: string },
  identities: MemberIdentityRepository,
) {
  assertSelfServiceTarget(input.authenticatedMemberId, input.requestedMemberId);
  const member = await identities.findMemberById(input.authenticatedMemberId);
  if (!member) throw new MemberSelfServiceAccessError();
  return createAccountDeletionPreview(member);
}

export async function requestOwnAccountDeletion(
  input: {
    authenticatedMemberId: string;
    requestedMemberId: string;
    requestedAt?: Date;
  },
  unitOfWork: MemberRepositoryUnitOfWork,
) {
  assertSelfServiceTarget(input.authenticatedMemberId, input.requestedMemberId);
  const requestedAt = input.requestedAt ?? new Date();
  if (Number.isNaN(requestedAt.getTime())) throw new MemberSelfServiceAccessError();
  return unitOfWork.execute(async ({ identities, profiles, consents }) => {
    const member = await identities.findMemberById(input.authenticatedMemberId);
    if (!member) throw new MemberSelfServiceAccessError();
    if (member.status === "DELETION_REQUESTED") return member;
    const profile = await profiles.findPrivateProfileByMemberId(member.id);
    const history = await consents.listForMember(member.id);

    if (profile?.visibility === "PUBLIC") {
      await profiles.savePrivateProfile({ ...profile, visibility: "PRIVATE" });
    }
    for (const purpose of CONSENT_PURPOSES) {
      if (hasActiveConsent(history, purpose)) {
        await consents.append({
          memberId: member.id,
          purpose,
          status: "REVOKED",
          policyVersion: "member-privacy-v1",
          source: "PROFILE_SETTINGS",
          decidedAt: requestedAt,
        });
      }
    }
    return identities.requestDeletion(member.id, requestedAt);
  });
}
