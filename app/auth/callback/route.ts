import { handleAuth } from "@workos-inc/authkit-nextjs";
import { MEMBER_ACCESS_READINESS, memberAccessRedirectUrl } from "@/lib/auth/config.server";
import { createAuthCallbackRoute } from "@/lib/auth/route-handlers";
import { memberIdentityRepository } from "@/lib/domain/persistence/repositories.server";

export const GET = createAuthCallbackRoute({
  readiness: MEMBER_ACCESS_READINESS,
  redirectUrl: memberAccessRedirectUrl,
  handleAuth: (options) => handleAuth(options),
  repository: memberIdentityRepository,
});
