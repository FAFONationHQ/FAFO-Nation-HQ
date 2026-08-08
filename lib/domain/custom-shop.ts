import type { Money } from "./commerce.ts";

export const CUSTOM_PROJECT_STATES = [
  "INQUIRY",
  "CONTACT_VERIFIED",
  "REQUIREMENTS_GATHERING",
  "QUOTE_PREPARATION",
  "QUOTE_SENT",
  "CUSTOMER_APPROVED",
  "REVISION_REQUESTED",
  "PRODUCTION",
  "COMPLETED",
  "CANCELLED",
] as const;

export type CustomProjectState = (typeof CUSTOM_PROJECT_STATES)[number];

const TRANSITIONS: Record<CustomProjectState, readonly CustomProjectState[]> = {
  INQUIRY: ["CONTACT_VERIFIED", "CANCELLED"],
  CONTACT_VERIFIED: ["REQUIREMENTS_GATHERING", "CANCELLED"],
  REQUIREMENTS_GATHERING: ["QUOTE_PREPARATION", "CANCELLED"],
  QUOTE_PREPARATION: ["QUOTE_SENT", "REQUIREMENTS_GATHERING", "CANCELLED"],
  QUOTE_SENT: ["CUSTOMER_APPROVED", "REVISION_REQUESTED", "CANCELLED"],
  CUSTOMER_APPROVED: ["PRODUCTION", "CANCELLED"],
  REVISION_REQUESTED: ["REQUIREMENTS_GATHERING", "QUOTE_PREPARATION", "CANCELLED"],
  PRODUCTION: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function customProjectTransitionIsAllowed(
  from: CustomProjectState,
  to: CustomProjectState,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export type GuestFirstInquiry = {
  inquiryId: string;
  contactChannel: "EMAIL";
  privateContactReference: string;
  memberId?: string;
  state: "INQUIRY";
  createdAt: string;
  uploadCapability: "NOT_AVAILABLE";
};

export type QuoteLine = Readonly<{
  description: string;
  quantity: number;
  unitPrice: Money;
}>;

export type VersionedCustomQuote = Readonly<{
  quoteId: string;
  projectId: string;
  version: number;
  lines: readonly QuoteLine[];
  total: Money;
  termsVersion: string;
  createdAt: string;
  expiresAt: string;
}>;

export type QuoteApprovalRecord = Readonly<{
  approvalId: string;
  projectId: string;
  quoteId: string;
  quoteVersion: number;
  termsVersion: string;
  approvedAt: string;
  approvalEvidenceReference: string;
}>;

export type CustomProjectPublicationState = "PRIVATE" | "GALLERY_ELIGIBLE" | "PUBLISHED";

// Gallery publication still requires independent CUSTOM_SHOP_GALLERY consent;
// project approval or completion never implies publication rights.
