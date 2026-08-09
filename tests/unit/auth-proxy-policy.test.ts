import { describe, expect, test } from "vitest";

import {
  AUTHKIT_UNAUTHENTICATED_PATHS,
  createAuthkitProxyConfiguration,
} from "../../lib/auth/proxy-policy.ts";

describe("AuthKit proxy policy", () => {
  test("protects matched account routes before Server Components execute", () => {
    const configuration = createAuthkitProxyConfiguration();

    expect(configuration.middlewareAuth).toEqual({
      enabled: true,
      unauthenticatedPaths: [...AUTHKIT_UNAUTHENTICATED_PATHS],
    });
    expect(configuration.middlewareAuth.unauthenticatedPaths).not.toContain("/account");
    expect(configuration.middlewareAuth.unauthenticatedPaths).not.toContain("/account/:path*");
  });

  test("keeps only the four authentication handlers reachable while signed out", () => {
    expect(AUTHKIT_UNAUTHENTICATED_PATHS).toEqual([
      "/auth/callback",
      "/auth/sign-in",
      "/auth/sign-out",
      "/auth/sign-up",
    ]);
    expect(createAuthkitProxyConfiguration().signUpPaths).toEqual(["/auth/sign-up"]);
  });

  test("returns fresh mutable path arrays for the installed AuthKit proxy", () => {
    const first = createAuthkitProxyConfiguration();
    const second = createAuthkitProxyConfiguration();

    first.middlewareAuth.unauthenticatedPaths.pop();
    expect(second.middlewareAuth.unauthenticatedPaths).toEqual([...AUTHKIT_UNAUTHENTICATED_PATHS]);
  });
});
