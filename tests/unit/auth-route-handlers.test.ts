import { NextRequest } from "next/server";
import { describe, expect, test, vi } from "vitest";

import type { AuthCallbackAdapter } from "../../lib/auth/route-handlers.ts";
import {
  createAuthCallbackRoute,
  createSignInRoute,
  createSignOutRoute,
  createSignUpRoute,
} from "../../lib/auth/route-handlers.ts";
import { parseMemberSignUpState } from "../../lib/auth/member-signup-state.ts";
import { InMemoryMemberRepositories } from "../doubles/in-memory-member-repositories.ts";

const enabled = { enabled: true };
const disabled = { enabled: false };
const redirectUrl = (pathname: string) => new URL(pathname, "http://localhost:3000");

function callbackAdapter(context: {
  user: { id: string; emailVerified: boolean };
  state?: string;
}): AuthCallbackAdapter {
  return (options) => async () => {
    try {
      await options.onSuccess(context);
      return new Response(null, {
        status: 302,
        headers: { location: `http://localhost:3000${options.returnPathname}` },
      });
    } catch {
      return options.onError();
    }
  };
}

describe("authentication route handlers", () => {
  test("callback stays inert when authentication is not configured", async () => {
    const handleAuth = vi.fn(callbackAdapter({
      user: { id: "user-disabled", emailVerified: true },
    }));
    const response = await createAuthCallbackRoute({
      readiness: disabled,
      redirectUrl,
      handleAuth,
      repository: new InMemoryMemberRepositories(),
    })(new NextRequest("http://localhost:3000/auth/callback"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Member authentication is not configured in this environment.",
    });
    expect(handleAuth).not.toHaveBeenCalled();
  });

  test("verified callback creates one eligible private member and remains idempotent", async () => {
    const repositories = new InMemoryMemberRepositories();
    const ensureMember = vi.spyOn(repositories, "ensureMemberForVerifiedIdentity");
    const state = JSON.stringify({
      kind: "member-sign-up",
      adultEligibilityAttested: true,
      policyVersion: "member-eligibility-v1",
    });
    const route = createAuthCallbackRoute({
      readiness: enabled,
      redirectUrl,
      handleAuth: callbackAdapter({
        user: { id: "user-callback", emailVerified: true },
        state,
      }),
      repository: repositories,
    });

    const first = await route(new NextRequest("http://localhost:3000/auth/callback"));
    const second = await route(new NextRequest("http://localhost:3000/auth/callback"));
    const member = await repositories.findMemberByIdentity({
      provider: "workos",
      providerSubject: "user-callback",
    });

    expect(first.headers.get("location")).toBe("http://localhost:3000/account");
    expect(second.headers.get("location")).toBe("http://localhost:3000/account");
    expect(ensureMember).toHaveBeenCalledTimes(1);
    expect(member).toMatchObject({ status: "ACTIVE" });
    expect(member?.ageEligibilityAttestedAt).not.toBeNull();
    expect(await repositories.findPrivateProfileByMemberId(member!.id)).toBeNull();
    expect(await repositories.listForMember(member!.id)).toEqual([]);
  });

  test("callback failures disclose no cause and persist no member", async () => {
    for (const context of [
      { user: { id: "user-unverified", emailVerified: false }, state: undefined },
      { user: { id: "user-no-attestation", emailVerified: true }, state: undefined },
    ]) {
      const repositories = new InMemoryMemberRepositories();
      const response = await createAuthCallbackRoute({
        readiness: enabled,
        redirectUrl,
        handleAuth: callbackAdapter(context),
        repository: repositories,
      })(new NextRequest("http://attacker.example/auth/callback"));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/join?auth=callback-error");
      expect(response.headers.get("set-cookie")).toMatch(
        /^wos-session=;.*(?:Expires=Thu, 01 Jan 1970|Max-Age=0)/i,
      );
      expect(await repositories.findMemberByIdentity({
        provider: "workos",
        providerSubject: context.user.id,
      })).toBeNull();
    }
  });

  test("sign-in uses the approved completion path and a trusted returned URL", async () => {
    const getSignInUrl = vi.fn<(options: { returnTo: string }) => Promise<string>>()
      .mockResolvedValue("https://api.workos.com/user_management/authorize");
    const response = await createSignInRoute({
      readiness: enabled,
      redirectUrl,
      getSignInUrl,
    })();
    expect(getSignInUrl).toHaveBeenCalledWith({ returnTo: "/join?auth=complete" });
    expect(response.headers.get("location")).toBe("https://api.workos.com/user_management/authorize");
  });

  test("sign-up requires adult eligibility and passes only validated state", async () => {
    const getSignUpUrl = vi.fn<(
      options: { returnTo: string; state: string },
    ) => Promise<string>>().mockResolvedValue("https://api.workos.com/user_management/authorize");
    const route = createSignUpRoute({ readiness: enabled, redirectUrl, getSignUpUrl });
    const denied = await route(new NextRequest("http://localhost:3000/auth/sign-up", {
      method: "POST",
      body: new URLSearchParams(),
    }));
    expect(denied.status).toBe(303);
    expect(denied.headers.get("location")).toBe("http://localhost:3000/join?auth=age-required");
    expect(getSignUpUrl).not.toHaveBeenCalled();

    const allowed = await route(new NextRequest("http://localhost:3000/auth/sign-up", {
      method: "POST",
      body: new URLSearchParams({ adultEligibility: "confirmed" }),
    }));
    expect(allowed.status).toBe(303);
    expect(getSignUpUrl).toHaveBeenCalledTimes(1);
    const options = getSignUpUrl.mock.calls[0][0];
    expect(options.returnTo).toBe("/account/profile");
    expect(parseMemberSignUpState(options.state)).not.toBeNull();
  });

  test("sign-out uses only the trusted local return URL", async () => {
    const signOut = vi.fn(async () => undefined);
    const response = await createSignOutRoute({ readiness: enabled, redirectUrl, signOut })();
    expect(signOut).toHaveBeenCalledWith({ returnTo: "http://localhost:3000/" });
    expect(response.status).toBe(204);

    const disabledSignOut = vi.fn(async () => undefined);
    const disabledResponse = await createSignOutRoute({
      readiness: disabled,
      redirectUrl,
      signOut: disabledSignOut,
    })();
    expect(disabledResponse.status).toBe(303);
    expect(disabledResponse.headers.get("location")).toBe("http://localhost:3000/join");
    expect(disabledSignOut).not.toHaveBeenCalled();
  });
});
