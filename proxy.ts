import { authkitProxy } from "@workos-inc/authkit-nextjs";
import { NextResponse, type NextMiddleware } from "next/server";

import { MEMBER_ACCESS_READINESS } from "@/lib/auth/config.server";
import { createAuthkitProxyConfiguration } from "@/lib/auth/proxy-policy";

const passthrough: NextMiddleware = () => NextResponse.next();

export default MEMBER_ACCESS_READINESS.enabled
  ? authkitProxy(createAuthkitProxyConfiguration())
  : passthrough;

export const config = {
  matcher: ["/auth/:path*", "/account/:path*"],
};
