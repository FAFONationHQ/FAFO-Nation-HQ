export const MEMBER_ELIGIBILITY_POLICY_VERSION = "member-eligibility-v1";

type MemberSignUpState = {
  kind: "member-sign-up";
  adultEligibilityAttested: true;
  policyVersion: typeof MEMBER_ELIGIBILITY_POLICY_VERSION;
};

export function createMemberSignUpState(): string {
  return JSON.stringify({
    kind: "member-sign-up",
    adultEligibilityAttested: true,
    policyVersion: MEMBER_ELIGIBILITY_POLICY_VERSION,
  } satisfies MemberSignUpState);
}

export function parseMemberSignUpState(value: string | undefined): MemberSignUpState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<MemberSignUpState>;
    if (
      parsed.kind !== "member-sign-up" ||
      parsed.adultEligibilityAttested !== true ||
      parsed.policyVersion !== MEMBER_ELIGIBILITY_POLICY_VERSION
    ) return null;
    return parsed as MemberSignUpState;
  } catch {
    return null;
  }
}
