import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { MEMBER_ACCESS_READINESS, memberAccessRedirectUrl } from "@/lib/auth/config.server";
import { createSignInRoute } from "@/lib/auth/route-handlers";

export const GET = createSignInRoute({
  readiness: MEMBER_ACCESS_READINESS,
  redirectUrl: memberAccessRedirectUrl,
  getSignInUrl,
});
