import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

import { MEMBER_ACCESS_READINESS, memberAccessRedirectUrl } from "@/lib/auth/config.server";

export async function GET() {
  if (!MEMBER_ACCESS_READINESS.enabled) {
    return NextResponse.redirect(memberAccessRedirectUrl("/join?auth=configuration-required"));
  }
  return NextResponse.redirect(await getSignInUrl({ returnTo: "/join?auth=complete" }));
}
