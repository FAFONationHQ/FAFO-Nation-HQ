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

const configuredCookieName = process.env.WORKOS_COOKIE_NAME?.trim();
const configuredCookieDomain = process.env.WORKOS_COOKIE_DOMAIN?.trim();

export const MEMBER_SESSION_COOKIE = Object.freeze({
  name: configuredCookieName && /^[A-Za-z0-9_-]{1,100}$/.test(configuredCookieName)
    ? configuredCookieName
    : "wos-session",
  ...(configuredCookieDomain &&
    configuredCookieDomain.length <= 253 &&
    !/\p{Cc}/u.test(configuredCookieDomain)
    ? { domain: configuredCookieDomain }
    : {}),
});

export function memberAccessRedirectUrl(pathname: string): URL {
  return new URL(pathname, MEMBER_ACCESS_REDIRECT_ORIGIN);
}
