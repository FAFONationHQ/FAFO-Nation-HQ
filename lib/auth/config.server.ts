import "server-only";

import { APPLICATION_CONFIG } from "../config/application.ts";
import {
  evaluateMemberAccessEnvironment,
  resolveMemberAccessRedirectOrigin,
} from "./config.ts";

const memberAccessEnvironment = {
  WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID,
  WORKOS_API_KEY: process.env.WORKOS_API_KEY,
  WORKOS_COOKIE_PASSWORD: process.env.WORKOS_COOKIE_PASSWORD,
  NEXT_PUBLIC_WORKOS_REDIRECT_URI: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
  DATABASE_URL: process.env.DATABASE_URL,
};

export const MEMBER_ACCESS_READINESS = evaluateMemberAccessEnvironment(memberAccessEnvironment);
export const MEMBER_ACCESS_REDIRECT_ORIGIN = resolveMemberAccessRedirectOrigin(
  memberAccessEnvironment,
  APPLICATION_CONFIG.canonicalOrigin,
);

export function memberAccessRedirectUrl(pathname: string): URL {
  return new URL(pathname, MEMBER_ACCESS_REDIRECT_ORIGIN);
}
