import "server-only";

import { withAuth } from "@workos-inc/authkit-nextjs";

import { memberIdentityRepository } from "../domain/persistence/repositories.server.ts";

export class MemberSessionError extends Error {
  constructor(readonly reason: "UNVERIFIED_EMAIL" | "MISSING_MEMBER" | "INELIGIBLE_MEMBER") {
    super("The authenticated session is not linked to an eligible member.");
    this.name = "MemberSessionError";
  }
}

export async function requireMemberSession() {
  const { user } = await withAuth({ ensureSignedIn: true });
  if (!user.emailVerified) throw new MemberSessionError("UNVERIFIED_EMAIL");
  const member = await memberIdentityRepository.findMemberByIdentity({
    provider: "workos",
    providerSubject: user.id,
  });
  if (!member) throw new MemberSessionError("MISSING_MEMBER");
  if (member.status !== "ACTIVE" || !member.ageEligibilityAttestedAt) {
    throw new MemberSessionError("INELIGIBLE_MEMBER");
  }
  return { member, workosUserId: user.id };
}
