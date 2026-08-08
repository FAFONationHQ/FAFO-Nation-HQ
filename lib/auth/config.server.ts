import "server-only";

import { evaluateMemberAccessEnvironment } from "./config.ts";

export const MEMBER_ACCESS_READINESS = evaluateMemberAccessEnvironment({
  WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID,
  WORKOS_API_KEY: process.env.WORKOS_API_KEY,
  WORKOS_COOKIE_PASSWORD: process.env.WORKOS_COOKIE_PASSWORD,
  NEXT_PUBLIC_WORKOS_REDIRECT_URI: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
  DATABASE_URL: process.env.DATABASE_URL,
});
