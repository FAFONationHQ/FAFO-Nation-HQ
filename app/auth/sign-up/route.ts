import { getSignUpUrl } from "@workos-inc/authkit-nextjs";
import { NextResponse, type NextRequest } from "next/server";

import { MEMBER_ACCESS_READINESS, memberAccessRedirectUrl } from "@/lib/auth/config.server";
import { createMemberSignUpState } from "@/lib/auth/member-signup-state";

export async function POST(request: NextRequest) {
  if (!MEMBER_ACCESS_READINESS.enabled) {
    return NextResponse.redirect(memberAccessRedirectUrl("/join?auth=configuration-required"), 303);
  }
  const formData = await request.formData();
  if (formData.get("adultEligibility") !== "confirmed") {
    return NextResponse.redirect(memberAccessRedirectUrl("/join?auth=age-required"), 303);
  }
  return NextResponse.redirect(await getSignUpUrl({
    returnTo: "/account/profile",
    state: createMemberSignUpState(),
  }), 303);
}
