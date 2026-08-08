import { signOut } from "@workos-inc/authkit-nextjs";
import { NextResponse, type NextRequest } from "next/server";

import { MEMBER_ACCESS_READINESS } from "@/lib/auth/config.server";

export async function POST(request: NextRequest) {
  if (!MEMBER_ACCESS_READINESS.enabled) {
    return NextResponse.redirect(new URL("/join", request.url), 303);
  }
  await signOut({ returnTo: new URL("/", request.url).toString() });
  return new Response(null, { status: 204 });
}
