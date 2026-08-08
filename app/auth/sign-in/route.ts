import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { NextResponse, type NextRequest } from "next/server";

import { MEMBER_ACCESS_READINESS } from "@/lib/auth/config.server";

export async function GET(request: NextRequest) {
  if (!MEMBER_ACCESS_READINESS.enabled) {
    return NextResponse.redirect(new URL("/join?auth=configuration-required", request.url));
  }
  return NextResponse.redirect(await getSignInUrl({ returnTo: "/join?auth=complete" }));
}
