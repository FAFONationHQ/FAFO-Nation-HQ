import "server-only";

import { withAuth } from "@workos-inc/authkit-nextjs";

import { memberIdentityRepository } from "../domain/persistence/repositories.server.ts";
import { resolveMemberSession } from "./member-session.ts";
export { MemberSessionError } from "./member-session.ts";

export async function requireMemberSession() {
  const { user } = await withAuth({ ensureSignedIn: true });
  return resolveMemberSession(user, memberIdentityRepository);
}
