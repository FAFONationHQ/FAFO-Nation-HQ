import { getSignUpUrl } from "@workos-inc/authkit-nextjs";
import { MEMBER_ACCESS_READINESS, memberAccessRedirectUrl } from "@/lib/auth/config.server";
import { createSignUpRoute } from "@/lib/auth/route-handlers";

export const POST = createSignUpRoute({
  readiness: MEMBER_ACCESS_READINESS,
  redirectUrl: memberAccessRedirectUrl,
  getSignUpUrl,
});
