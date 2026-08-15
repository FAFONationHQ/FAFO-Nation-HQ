import { APPLICATION_CONFIG } from "../config/application.ts";

export const CALLSIGN_MIN_LENGTH = 3;
export const CALLSIGN_MAX_LENGTH = 24;
export const DISPLAY_NAME_MAX_LENGTH = 60;
export const BIOGRAPHY_MAX_LENGTH = 500;

const RESERVED_CALLSIGNS = new Set([
  "admin",
  "administrator",
  "billing",
  "fafo",
  "fafo-nation",
  "moderator",
  "official",
  "owner",
  "payments",
  "root",
  "security",
  "staff",
  "support",
  "system",
]);

const PROTECTED_CALLSIGN_PATTERNS = [
  /^fafo-(admin|official|staff|support)$/,
  /^(admin|moderator|owner|staff)-fafo$/,
];

export type CallsignValidationIssue =
  | "REQUIRED"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "INVALID_CHARACTERS"
  | "INVALID_HYPHEN_PLACEMENT"
  | "RESERVED_OR_PROTECTED";

export type CallsignValidationResult =
  | { valid: true; callsign: string }
  | { valid: false; normalized: string; issues: CallsignValidationIssue[] };

export function normalizeCallsign(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function callsignIsReserved(value: string): boolean {
  const normalized = normalizeCallsign(value);
  return (
    RESERVED_CALLSIGNS.has(normalized) ||
    PROTECTED_CALLSIGN_PATTERNS.some((pattern) => pattern.test(normalized))
  );
}

export function validateCallsign(value: string): CallsignValidationResult {
  const normalized = normalizeCallsign(value);
  const issues: CallsignValidationIssue[] = [];

  if (!normalized) issues.push("REQUIRED");
  if (normalized && normalized.length < CALLSIGN_MIN_LENGTH) issues.push("TOO_SHORT");
  if (normalized.length > CALLSIGN_MAX_LENGTH) issues.push("TOO_LONG");
  if (normalized && !/^[a-z0-9-]+$/.test(normalized)) issues.push("INVALID_CHARACTERS");
  if (/^-|-$/.test(normalized)) issues.push("INVALID_HYPHEN_PLACEMENT");
  if (callsignIsReserved(normalized)) issues.push("RESERVED_OR_PROTECTED");

  return issues.length === 0
    ? { valid: true, callsign: normalized }
    : { valid: false, normalized, issues };
}

export type TextValidationResult =
  | { valid: true; value: string | null }
  | { valid: false; issue: "TOO_LONG" | "CONTROL_CHARACTER" };

export function validateOptionalDisplayName(value: string | null | undefined): TextValidationResult {
  const normalized = value?.normalize("NFKC").trim() ?? "";
  if (!normalized) return { valid: true, value: null };
  if (normalized.length > DISPLAY_NAME_MAX_LENGTH) return { valid: false, issue: "TOO_LONG" };
  if (/\p{Cc}/u.test(normalized)) return { valid: false, issue: "CONTROL_CHARACTER" };
  return { valid: true, value: normalized };
}

export function isEligibleForMemberAccount(
  birthDate: Date,
  asOf: Date = new Date(),
): boolean {
  if (Number.isNaN(birthDate.getTime()) || Number.isNaN(asOf.getTime()) || birthDate > asOf) {
    return false;
  }

  let age = asOf.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayHasOccurred =
    asOf.getUTCMonth() > birthDate.getUTCMonth() ||
    (asOf.getUTCMonth() === birthDate.getUTCMonth() &&
      asOf.getUTCDate() >= birthDate.getUTCDate());

  if (!birthdayHasOccurred) age -= 1;
  return age >= APPLICATION_CONFIG.minimumMemberAge;
}

export type AuthenticationIdentity = {
  provider: string;
  providerSubject: string;
  verifiedEmail: boolean;
};

export type PrivatePostalAddress = {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
};

export type PrivateAccountData = {
  memberId: string;
  email: string;
  phone?: string;
  authenticationIdentity: AuthenticationIdentity;
  postalAddresses: readonly PrivatePostalAddress[];
  paymentCustomerReferences: Readonly<Record<string, string>>;
  privatePreferences: Readonly<Record<string, boolean | string>>;
  privateServiceInformation?: Readonly<Record<string, string>>;
};

export type CityLevelLocation = {
  city: string;
  region: string;
  country: string;
};

export type MemberProfileVisibility = "PRIVATE" | "PUBLIC";

export type MemberProfile = {
  memberId: string;
  publicId: string;
  callsign: string;
  displayName?: string;
  biography?: string;
  avatarUrl?: string;
  cityLevelLocation?: CityLevelLocation;
  visibility: MemberProfileVisibility;
};

// Persistence must enforce normalized callsign uniqueness and record audited
// moderation/rename operations. These local helpers intentionally do not claim
// authoritative uniqueness without a database.
