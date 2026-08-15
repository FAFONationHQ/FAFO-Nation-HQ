/**
 * Public, non-secret application constants. This module is safe to import from
 * both server and client code; secrets and environment-specific credentials do
 * not belong here.
 */
export const APPLICATION_CONFIG = {
  name: "FAFO Nation HQ",
  canonicalOrigin: "https://fafonationhq.com",
  minimumMemberAge: 18,
  launchCountries: ["CA", "US"],
  supportedCurrencies: ["CAD", "USD"],
} as const;

export type LaunchCountry =
  (typeof APPLICATION_CONFIG.launchCountries)[number];

export type SupportedCurrency =
  (typeof APPLICATION_CONFIG.supportedCurrencies)[number];

export function applicationUrl(pathname = "/"): URL {
  return new URL(pathname, APPLICATION_CONFIG.canonicalOrigin);
}
