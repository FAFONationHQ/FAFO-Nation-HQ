export const WORKOS_CALLBACK_PATH = "/auth/callback";

const REQUIRED_KEYS = [
  "WORKOS_CLIENT_ID",
  "WORKOS_API_KEY",
  "WORKOS_COOKIE_PASSWORD",
  "NEXT_PUBLIC_WORKOS_REDIRECT_URI",
  "DATABASE_URL",
] as const;

export type MemberAccessEnvironment = Partial<Record<(typeof REQUIRED_KEYS)[number], string | undefined>>;
export type MemberAccessReadiness = {
  enabled: boolean;
  missing: readonly (typeof REQUIRED_KEYS)[number][];
  invalid: readonly string[];
};

export function evaluateMemberAccessEnvironment(environment: MemberAccessEnvironment): MemberAccessReadiness {
  const missing = REQUIRED_KEYS.filter((key) => !environment[key]?.trim());
  const invalid: string[] = [];
  const cookiePassword = environment.WORKOS_COOKIE_PASSWORD?.trim();
  if (cookiePassword && cookiePassword.length < 32) invalid.push("WORKOS_COOKIE_PASSWORD must be at least 32 characters");

  const placeholderKeys = REQUIRED_KEYS.filter((key) => /replace_me|\.invalid/i.test(environment[key] ?? ""));
  if (placeholderKeys.length > 0) invalid.push("placeholder values must be replaced");

  const redirect = environment.NEXT_PUBLIC_WORKOS_REDIRECT_URI?.trim();
  if (redirect) {
    try {
      const parsed = new URL(redirect);
      if (!["http:", "https:"].includes(parsed.protocol) || parsed.pathname !== WORKOS_CALLBACK_PATH) {
        invalid.push(`NEXT_PUBLIC_WORKOS_REDIRECT_URI must use ${WORKOS_CALLBACK_PATH}`);
      }
    } catch {
      invalid.push("NEXT_PUBLIC_WORKOS_REDIRECT_URI must be an absolute URL");
    }
  }

  return { enabled: missing.length === 0 && invalid.length === 0, missing, invalid };
}
