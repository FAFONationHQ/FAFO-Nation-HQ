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

function validatedRedirectUrl(value: string | undefined): URL | null {
  if (!value?.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    const localHostname = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    if (
      parsed.pathname !== WORKOS_CALLBACK_PATH ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && localHostname))
    ) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function resolveMemberAccessRedirectOrigin(
  environment: Pick<MemberAccessEnvironment, "NEXT_PUBLIC_WORKOS_REDIRECT_URI">,
  fallbackOrigin: string,
): string {
  return validatedRedirectUrl(environment.NEXT_PUBLIC_WORKOS_REDIRECT_URI)?.origin ?? fallbackOrigin;
}

export function evaluateMemberAccessEnvironment(environment: MemberAccessEnvironment): MemberAccessReadiness {
  const missing = REQUIRED_KEYS.filter((key) => !environment[key]?.trim());
  const invalid: string[] = [];
  const cookiePassword = environment.WORKOS_COOKIE_PASSWORD?.trim();
  if (cookiePassword && cookiePassword.length < 32) invalid.push("WORKOS_COOKIE_PASSWORD must be at least 32 characters");

  const placeholderKeys = REQUIRED_KEYS.filter((key) => /replace_me|\.invalid/i.test(environment[key] ?? ""));
  if (placeholderKeys.length > 0) invalid.push("placeholder values must be replaced");

  const clientId = environment.WORKOS_CLIENT_ID?.trim();
  if (clientId && !clientId.startsWith("client_")) invalid.push("WORKOS_CLIENT_ID must begin with client_");
  const apiKey = environment.WORKOS_API_KEY?.trim();
  if (apiKey && !apiKey.startsWith("sk_")) invalid.push("WORKOS_API_KEY must begin with sk_");

  const redirect = environment.NEXT_PUBLIC_WORKOS_REDIRECT_URI?.trim();
  if (redirect && !validatedRedirectUrl(redirect)) {
    invalid.push(`NEXT_PUBLIC_WORKOS_REDIRECT_URI must be an approved absolute ${WORKOS_CALLBACK_PATH} URL`);
  }

  return { enabled: missing.length === 0 && invalid.length === 0, missing, invalid };
}
