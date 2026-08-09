export const AUTHKIT_UNAUTHENTICATED_PATHS = [
  "/auth/callback",
  "/auth/sign-in",
  "/auth/sign-out",
  "/auth/sign-up",
] as const;

export function createAuthkitProxyConfiguration() {
  return {
    signUpPaths: ["/auth/sign-up"],
    middlewareAuth: {
      enabled: true,
      unauthenticatedPaths: [...AUTHKIT_UNAUTHENTICATED_PATHS],
    },
  };
}
