import { signOut } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

import { MEMBER_ACCESS_READINESS, memberAccessRedirectUrl } from "@/lib/auth/config.server";

export async function POST() {
  if (!MEMBER_ACCESS_READINESS.enabled) {
    return NextResponse.redirect(memberAccessRedirectUrl("/join"), 303);
  }
  await signOut({ returnTo: memberAccessRedirectUrl("/").toString() });
  return new Response(null, { status: 204 });
}
