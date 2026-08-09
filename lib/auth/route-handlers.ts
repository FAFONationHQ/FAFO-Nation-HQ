import { NextResponse, type NextRequest } from "next/server";

import type { MemberIdentityRepository } from "../domain/persistence/member-repositories.ts";
import { associateVerifiedWorkOsUser, type WorkOsIdentityCandidate } from "./associate-workos-user.ts";
import type { MemberAccessReadiness } from "./config.ts";
import { createMemberSignUpState } from "./member-signup-state.ts";

type RouteConfiguration = {
  readiness: Pick<MemberAccessReadiness, "enabled">;
  redirectUrl(pathname: string): URL;
};

type CallbackOptions = {
  returnPathname: string;
  onSuccess(context: { user: WorkOsIdentityCandidate; state?: string }): Promise<void>;
  onError(): Promise<Response>;
};

export type AuthCallbackAdapter = (
  options: CallbackOptions,
) => (request: NextRequest) => Promise<Response>;

export function createAuthCallbackRoute(dependencies: RouteConfiguration & {
  handleAuth: AuthCallbackAdapter;
  repository: MemberIdentityRepository;
}) {
  return async function authCallback(request: NextRequest): Promise<Response> {
    if (!dependencies.readiness.enabled) {
      return NextResponse.json(
        { error: "Member authentication is not configured in this environment." },
        { status: 503 },
      );
    }

    return dependencies.handleAuth({
      returnPathname: "/account",
      onSuccess: async ({ user, state }) => {
        await associateVerifiedWorkOsUser(user, dependencies.repository, { state });
      },
      onError: async () =>
        NextResponse.redirect(dependencies.redirectUrl("/join?auth=callback-error")),
    })(request);
  };
}

export function createSignInRoute(dependencies: RouteConfiguration & {
  getSignInUrl(options: { returnTo: string }): Promise<string>;
}) {
  return async function signIn(): Promise<Response> {
    if (!dependencies.readiness.enabled) {
      return NextResponse.redirect(dependencies.redirectUrl("/join?auth=configuration-required"));
    }
    return NextResponse.redirect(await dependencies.getSignInUrl({ returnTo: "/join?auth=complete" }));
  };
}

export function createSignUpRoute(dependencies: RouteConfiguration & {
  getSignUpUrl(options: { returnTo: string; state: string }): Promise<string>;
}) {
  return async function signUp(request: NextRequest): Promise<Response> {
    if (!dependencies.readiness.enabled) {
      return NextResponse.redirect(
        dependencies.redirectUrl("/join?auth=configuration-required"),
        303,
      );
    }
    const formData = await request.formData();
    if (formData.get("adultEligibility") !== "confirmed") {
      return NextResponse.redirect(dependencies.redirectUrl("/join?auth=age-required"), 303);
    }
    return NextResponse.redirect(await dependencies.getSignUpUrl({
      returnTo: "/account/profile",
      state: createMemberSignUpState(),
    }), 303);
  };
}

export function createSignOutRoute(dependencies: RouteConfiguration & {
  signOut(options: { returnTo: string }): Promise<void>;
}) {
  return async function signOut(): Promise<Response> {
    if (!dependencies.readiness.enabled) {
      return NextResponse.redirect(dependencies.redirectUrl("/join"), 303);
    }
    await dependencies.signOut({ returnTo: dependencies.redirectUrl("/").toString() });
    return new Response(null, { status: 204 });
  };
}
