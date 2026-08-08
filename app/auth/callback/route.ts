import { handleAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse, type NextRequest } from "next/server";

import { associateVerifiedWorkOsUser } from "@/lib/auth/associate-workos-user";
import { MEMBER_ACCESS_READINESS, memberAccessRedirectUrl } from "@/lib/auth/config.server";
import { memberIdentityRepository } from "@/lib/domain/persistence/repositories.server";

export async function GET(request: NextRequest) {
  if (!MEMBER_ACCESS_READINESS.enabled) {
    return NextResponse.json(
      { error: "Member authentication is not configured in this environment." },
      { status: 503 },
    );
  }

  return handleAuth({
    returnPathname: "/account",
    onSuccess: async ({ user, state }) => {
      await associateVerifiedWorkOsUser(user, memberIdentityRepository, { state });
    },
    onError: async () =>
      NextResponse.redirect(memberAccessRedirectUrl("/join?auth=callback-error")),
  })(request);
}
