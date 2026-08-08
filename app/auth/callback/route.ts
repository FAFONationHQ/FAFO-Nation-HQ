import { handleAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse, type NextRequest } from "next/server";

import { associateVerifiedWorkOsUser } from "@/lib/auth/associate-workos-user";
import { MEMBER_ACCESS_READINESS } from "@/lib/auth/config.server";
import { memberIdentityRepository } from "@/lib/domain/persistence/repositories.server";

export async function GET(request: NextRequest) {
  if (!MEMBER_ACCESS_READINESS.enabled) {
    return NextResponse.json(
      { error: "Member authentication is not configured in this environment." },
      { status: 503 },
    );
  }

  return handleAuth({
    returnPathname: "/join?auth=complete",
    onSuccess: async ({ user }) => {
      await associateVerifiedWorkOsUser(user, memberIdentityRepository);
    },
    onError: async ({ request: callbackRequest }) =>
      NextResponse.redirect(new URL("/join?auth=callback-error", callbackRequest.url)),
  })(request);
}
