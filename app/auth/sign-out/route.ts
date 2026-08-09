import { signOut } from "@workos-inc/authkit-nextjs";
import { MEMBER_ACCESS_READINESS, memberAccessRedirectUrl } from "@/lib/auth/config.server";
import { createSignOutRoute } from "@/lib/auth/route-handlers";

export const POST = createSignOutRoute({
  readiness: MEMBER_ACCESS_READINESS,
  redirectUrl: memberAccessRedirectUrl,
  signOut,
});
