import type {
  MemberIdentityRepository,
  MemberRecord,
} from "../domain/persistence/member-repositories.ts";

export type MemberSessionIdentity = {
  id: string;
  emailVerified: boolean;
};

export class MemberSessionError extends Error {
  constructor(readonly reason:
    | "SIGNED_OUT"
    | "UNVERIFIED_EMAIL"
    | "MISSING_MEMBER"
    | "INELIGIBLE_MEMBER") {
    super("The authenticated session is not linked to an eligible member.");
    this.name = "MemberSessionError";
  }
}

export async function resolveMemberSession(
  user: MemberSessionIdentity | null | undefined,
  repository: MemberIdentityRepository,
): Promise<{ member: MemberRecord; workosUserId: string }> {
  if (!user) throw new MemberSessionError("SIGNED_OUT");
  if (!user.emailVerified) throw new MemberSessionError("UNVERIFIED_EMAIL");
  const member = await repository.findMemberByIdentity({
    provider: "workos",
    providerSubject: user.id,
  });
  if (!member) throw new MemberSessionError("MISSING_MEMBER");
  if (member.status !== "ACTIVE" || !member.ageEligibilityAttestedAt) {
    throw new MemberSessionError("INELIGIBLE_MEMBER");
  }
  return { member, workosUserId: user.id };
}
