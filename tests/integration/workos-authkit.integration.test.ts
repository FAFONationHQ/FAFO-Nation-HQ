import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createMemberSignUpState } from "../../lib/auth/member-signup-state.ts";

const authkitState = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  headers: new Headers(),
  redirects: [] as string[],
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = authkitState.cookies.get(name);
      return value === undefined ? undefined : { name, value };
    },
    getAll: () => [...authkitState.cookies].map(([name, value]) => ({ name, value })),
    set: (name: string, value: string) => {
      authkitState.cookies.set(name, value);
    },
    delete: (input: string | { name: string }) => {
      authkitState.cookies.delete(typeof input === "string" ? input : input.name);
    },
  }),
  headers: async () => authkitState.headers,
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    authkitState.redirects.push(url);
    throw new Error("NEXT_REDIRECT");
  },
}));

const originalEnvironment = {
  WORKOS_API_HOSTNAME: process.env.WORKOS_API_HOSTNAME,
  WORKOS_API_HTTPS: process.env.WORKOS_API_HTTPS,
  WORKOS_API_PORT: process.env.WORKOS_API_PORT,
  WORKOS_API_KEY: process.env.WORKOS_API_KEY,
  WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID,
  WORKOS_COOKIE_PASSWORD: process.env.WORKOS_COOKIE_PASSWORD,
  NEXT_PUBLIC_WORKOS_REDIRECT_URI: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
};

function syntheticJwt(subject: string): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({
    sub: subject,
    sid: "session_synthetic",
    iat: now,
    exp: now + 3600,
  })}.synthetic-signature`;
}

function callbackRequest(state: string) {
  const verifier = [...authkitState.cookies].find(([name]) => name.startsWith("wos-auth-verifier"));
  if (!verifier) throw new Error("Synthetic PKCE verifier cookie was not created.");
  return new NextRequest(
    `http://localhost:3000/auth/callback?code=synthetic-code&state=${encodeURIComponent(state)}`,
    { headers: { cookie: `${verifier[0]}=${verifier[1]}` } },
  );
}

describe("installed AuthKit lifecycle with a synthetic WorkOS boundary", () => {
  beforeEach(() => {
    vi.resetModules();
    authkitState.cookies.clear();
    authkitState.headers = new Headers();
    authkitState.redirects.length = 0;
    Object.assign(process.env, {
      WORKOS_API_HOSTNAME: "127.0.0.1",
      WORKOS_API_HTTPS: "false",
      WORKOS_API_PORT: "3999",
      WORKOS_API_KEY: "sk_test_synthetic_integration_only",
      WORKOS_CLIENT_ID: "client_synthetic_integration_only",
      WORKOS_COOKIE_PASSWORD: "synthetic-cookie-password-32-characters-minimum",
      NEXT_PUBLIC_WORKOS_REDIRECT_URI: "http://localhost:3000/auth/callback",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    for (const [name, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  test("creates PKCE state, exchanges a code, seals a session, resolves it, and signs out", async () => {
    const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" || input instanceof URL
        ? input.toString()
        : input.url;
      const parsed = new URL(url);
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      requests.push({ url: parsed.pathname, body });
      if (parsed.pathname !== "/user_management/authenticate") {
        return new Response("not found", { status: 404 });
      }
      return Response.json({
        access_token: syntheticJwt("user_synthetic"),
        refresh_token: "refresh_synthetic",
        user: {
          object: "user",
          id: "user_synthetic",
          email: "synthetic-authkit@example.test",
          email_verified: true,
          first_name: "Synthetic",
          last_name: "Member",
          created_at: "2026-08-08T20:00:00.000Z",
          updated_at: "2026-08-08T20:00:00.000Z",
        },
      });
    }));

    const authkit = await import("@workos-inc/authkit-nextjs");
    const customState = createMemberSignUpState();
    const signUpUrl = new URL(await authkit.getSignUpUrl({
      returnTo: "/account/profile",
      state: customState,
    }));
    expect(signUpUrl.origin).toBe("http://127.0.0.1:3999");
    expect(signUpUrl.searchParams.get("screen_hint")).toBe("sign-up");
    expect(signUpUrl.searchParams.get("code_challenge")).toBeTruthy();
    const state = signUpUrl.searchParams.get("state");
    expect(state).toBeTruthy();

    let callbackState: string | undefined;
    const response = await authkit.handleAuth({
      returnPathname: "/account",
      onSuccess: async ({ user, state: returnedState }) => {
        expect(user).toMatchObject({ id: "user_synthetic", emailVerified: true });
        callbackState = returnedState;
      },
    })(callbackRequest(state!));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/account/profile");
    expect(callbackState).toBe(customState);
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("/user_management/authenticate");
    expect(requests[0].body).toMatchObject({
      client_id: "client_synthetic_integration_only",
      client_secret: "sk_test_synthetic_integration_only",
      code: "synthetic-code",
      grant_type: "authorization_code",
    });
    expect(typeof requests[0].body.code_verifier).toBe("string");

    const sessionCookie = authkitState.cookies.get("wos-session");
    expect(sessionCookie).toBeTruthy();
    authkitState.headers.set("x-workos-middleware", "true");
    authkitState.headers.set("x-workos-session", sessionCookie!);
    await expect(authkit.withAuth()).resolves.toMatchObject({
      sessionId: "session_synthetic",
      user: { id: "user_synthetic", emailVerified: true },
    });

    await expect(authkit.signOut({ returnTo: "http://localhost:3000/" }))
      .rejects.toThrow("NEXT_REDIRECT");
    expect(authkitState.cookies.has("wos-session")).toBe(false);
    const logout = new URL(authkitState.redirects.at(-1)!);
    expect(logout.origin).toBe("http://127.0.0.1:3999");
    expect(logout.pathname).toBe("/user_management/sessions/logout");
    expect(logout.searchParams.get("session_id")).toBe("session_synthetic");
    expect(logout.searchParams.get("return_to")).toBe("http://localhost:3000/");
  });

  test("rejects a mismatched callback state without exchange or session creation", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const authkit = await import("@workos-inc/authkit-nextjs");
    const signUpUrl = new URL(await authkit.getSignUpUrl({ state: createMemberSignUpState() }));
    const state = signUpUrl.searchParams.get("state")!;
    const request = callbackRequest(`${state}-mismatch`);
    const response = await authkit.handleAuth({
      onError: async () => new Response(null, {
        status: 302,
        headers: { location: "http://localhost:3000/join?auth=callback-error" },
      }),
    })(request);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://localhost:3000/join?auth=callback-error");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(authkitState.cookies.has("wos-session")).toBe(false);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
});
