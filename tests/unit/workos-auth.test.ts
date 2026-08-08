import { describe, expect, test } from "vitest";

import {
  associateVerifiedWorkOsUser,
  MissingEligibilityAttestationError,
  UnverifiedWorkOsEmailError,
} from "../../lib/auth/associate-workos-user.ts";
import {
  evaluateMemberAccessEnvironment,
  resolveMemberAccessRedirectOrigin,
} from "../../lib/auth/config.ts";
import { createMemberSignUpState, parseMemberSignUpState } from "../../lib/auth/member-signup-state.ts";
import { MemberSessionError, resolveMemberSession } from "../../lib/auth/member-session.ts";
import { InMemoryMemberRepositories } from "../doubles/in-memory-member-repositories.ts";

const completeEnvironment = {
  DATABASE_URL: "postgresql://isolated.local/fafo_test",
  WORKOS_CLIENT_ID: "client_test",
  WORKOS_API_KEY: "sk_test_value",
  WORKOS_COOKIE_PASSWORD: "12345678901234567890123456789012",
  NEXT_PUBLIC_WORKOS_REDIRECT_URI: "http://localhost:3000/auth/callback",
};

describe("WorkOS member authentication boundary", () => {
  test("denies signed-out, unverified, missing, and ineligible sessions", async () => {
    const repositories = new InMemoryMemberRepositories();
    await expect(resolveMemberSession(null, repositories)).rejects.toMatchObject({ reason: "SIGNED_OUT" });
    await expect(resolveMemberSession({
      id: "unverified",
      emailVerified: false,
    }, repositories)).rejects.toMatchObject({ reason: "UNVERIFIED_EMAIL" });
    await expect(resolveMemberSession({
      id: "missing",
      emailVerified: true,
    }, repositories)).rejects.toMatchObject({ reason: "MISSING_MEMBER" });

    await repositories.ensureMemberForVerifiedIdentity({
      provider: "workos",
      providerSubject: "under-age-boundary",
      verifiedAt: new Date("2026-08-08T19:00:00.000Z"),
    });
    await expect(resolveMemberSession({
      id: "under-age-boundary",
      emailVerified: true,
    }, repositories)).rejects.toEqual(new MemberSessionError("INELIGIBLE_MEMBER"));
  });

  test("resolves a signed-in verified and eligible member without granting authority", async () => {
    const repositories = new InMemoryMemberRepositories();
    const member = await repositories.ensureMemberForVerifiedIdentity({
      provider: "workos",
      providerSubject: "eligible-member",
      verifiedAt: new Date("2026-08-08T19:00:00.000Z"),
      ageEligibility: {
        attestedAt: new Date("2026-08-08T19:00:00.000Z"),
        policyVersion: "member-eligibility-v1",
      },
    });
    await expect(resolveMemberSession({
      id: "eligible-member",
      emailVerified: true,
    }, repositories)).resolves.toEqual({ member, workosUserId: "eligible-member" });
  });

  test("stays disabled until every server and redirect requirement is present", () => {
    expect(evaluateMemberAccessEnvironment({}).enabled).toBe(false);
    expect(evaluateMemberAccessEnvironment({ ...completeEnvironment, DATABASE_URL: "" }).enabled).toBe(false);
    expect(evaluateMemberAccessEnvironment(completeEnvironment)).toEqual({ enabled: true, missing: [], invalid: [] });
  });

  test("rejects placeholders, weak cookie secrets, and unexpected callback paths", () => {
    const readiness = evaluateMemberAccessEnvironment({
      ...completeEnvironment,
      WORKOS_CLIENT_ID: "client_replace_me",
      WORKOS_COOKIE_PASSWORD: "too-short",
      NEXT_PUBLIC_WORKOS_REDIRECT_URI: "http://localhost:3000/not-the-callback",
    });
    expect(readiness.enabled).toBe(false);
    expect(readiness.invalid).toHaveLength(3);
  });

  test("rejects insecure remote callbacks, URL credentials, queries, and fragments", () => {
    for (const redirect of [
      "http://attacker.example/auth/callback",
      "https://user:password@example.test/auth/callback",
      "https://example.test/auth/callback?next=attacker",
      "https://example.test/auth/callback#fragment",
    ]) {
      expect(evaluateMemberAccessEnvironment({
        ...completeEnvironment,
        NEXT_PUBLIC_WORKOS_REDIRECT_URI: redirect,
      }).enabled).toBe(false);
    }
    expect(resolveMemberAccessRedirectOrigin({
      NEXT_PUBLIC_WORKOS_REDIRECT_URI: "http://attacker.example/auth/callback",
    }, "https://fafonationhq.com")).toBe("https://fafonationhq.com");
    expect(resolveMemberAccessRedirectOrigin(completeEnvironment, "https://fafonationhq.com"))
      .toBe("http://localhost:3000");
  });

  test("associates only a WorkOS identity whose email is verified", async () => {
    const repositories = new InMemoryMemberRepositories();
    await expect(associateVerifiedWorkOsUser(
      { id: "user_unverified", emailVerified: false },
      repositories,
    )).rejects.toBeInstanceOf(UnverifiedWorkOsEmailError);

    await expect(associateVerifiedWorkOsUser(
      { id: "user_verified", emailVerified: true },
      repositories,
    )).rejects.toBeInstanceOf(MissingEligibilityAttestationError);

    const member = await associateVerifiedWorkOsUser(
      { id: "user_verified", emailVerified: true },
      repositories,
      {
        observedAt: new Date("2026-08-08T19:00:00.000Z"),
        state: createMemberSignUpState(),
      },
    );
    expect(member.id).toBeTruthy();
    expect(await repositories.findMemberByIdentity({ provider: "workos", providerSubject: "user_verified" })).toEqual(member);
    expect(member.ageEligibilityAttestedAt?.toISOString()).toBe("2026-08-08T19:00:00.000Z");
  });

  test("signup state parsing fails closed", () => {
    expect(parseMemberSignUpState(createMemberSignUpState())).not.toBeNull();
    expect(parseMemberSignUpState('{"adultEligibilityAttested":true}')).toBeNull();
    expect(parseMemberSignUpState("not-json")).toBeNull();
  });
});
