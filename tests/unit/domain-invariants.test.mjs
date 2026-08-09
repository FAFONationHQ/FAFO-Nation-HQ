import assert from "node:assert/strict";
import { test } from "vitest";

import { apiFailure } from "../../lib/api/contracts.ts";
import { createAuditEvent } from "../../lib/domain/audit.ts";
import { authorize, hasEveryPermission, permissionsForRoles } from "../../lib/domain/authorization.ts";
import {
  addMoney,
  createMoney,
  fulfillmentTransitionIsAllowed,
  orderTransitionIsAllowed,
  paymentTransitionIsAllowed,
  refundTransitionIsAllowed,
} from "../../lib/domain/commerce.ts";
import { hasActiveConsent, latestConsentDecision } from "../../lib/domain/consent.ts";
import { customProjectTransitionIsAllowed } from "../../lib/domain/custom-shop.ts";
import {
  callsignIsReserved,
  isEligibleForMemberAccount,
  normalizeCallsign,
  validateCallsign,
  validateOptionalDisplayName,
} from "../../lib/domain/member.ts";
import { defaultMediaPlacement, mediaIsHomepageEligible } from "../../lib/domain/media.ts";
import { projectPublicMemberProfile } from "../../lib/domain/public-member.ts";
import { projectPublicDeployment } from "../../lib/fafo-world/domain.ts";
import { staticFafoWorldRepository } from "../../lib/fafo-world/static-repository.ts";

test("callsigns normalize deterministically", () => {
  assert.equal(normalizeCallsign("  Maple__Guard  "), "maple-guard");
  assert.deepEqual(validateCallsign("Maple Guard"), { valid: true, callsign: "maple-guard" });
});

test("reserved, malformed, and unsafe callsigns are rejected", () => {
  assert.equal(callsignIsReserved("FAFO Admin"), true);
  assert.equal(validateCallsign("admin").valid, false);
  assert.equal(validateCallsign("two words!").valid, false);
  assert.equal(validateOptionalDisplayName("name\u0000").valid, false);
});

test("member eligibility enforces the exact 18+ boundary", () => {
  const asOf = new Date("2026-08-08T12:00:00.000Z");
  assert.equal(isEligibleForMemberAccount(new Date("2008-08-08T00:00:00.000Z"), asOf), true);
  assert.equal(isEligibleForMemberAccount(new Date("2008-08-09T00:00:00.000Z"), asOf), false);
});

test("authorization is default deny and roles aggregate explicit permissions", () => {
  assert.equal(authorize(null, "deployment.publish").allowed, false);
  const member = { subjectId: "member-1", permissions: permissionsForRoles(["MEMBER"]) };
  assert.equal(authorize(member, "member.profile.write-self").allowed, true);
  assert.equal(authorize(member, "refund.execute").allowed, false);
  assert.deepEqual(permissionsForRoles(["NOT_A_ROLE"]), []);
  const owner = { subjectId: "owner-1", permissions: permissionsForRoles(["OWNER_OPERATOR"]) };
  assert.equal(hasEveryPermission(owner, ["deployment.publish", "refund.execute", "cares.publish"]), true);
});

const baseConsent = [{
  purpose: "PUBLIC_MEMBER_PROFILE",
  status: "GRANTED",
  decidedAt: "2026-08-01T00:00:00.000Z",
  policyVersion: "privacy-v1",
}];

test("consent is purpose-specific and revocation wins", () => {
  assert.equal(hasActiveConsent(baseConsent, "PUBLIC_MEMBER_PROFILE"), true);
  assert.equal(hasActiveConsent(baseConsent, "PUBLIC_MEMBER_LOCATION"), false);
  const revoked = [...baseConsent, {
    purpose: "PUBLIC_MEMBER_PROFILE",
    status: "REVOKED",
    decidedAt: "2026-08-02T00:00:00.000Z",
    policyVersion: "privacy-v1",
  }];
  assert.equal(hasActiveConsent(revoked, "PUBLIC_MEMBER_PROFILE"), false);
  assert.equal(latestConsentDecision(revoked, "PUBLIC_MEMBER_PROFILE")?.status, "REVOKED");
  assert.equal(latestConsentDecision(
    [baseConsent[0], { ...baseConsent[0], status: "REVOKED" }],
    "PUBLIC_MEMBER_PROFILE",
  )?.status, "REVOKED");
});

const memberProfile = {
  memberId: "private-member-id",
  publicId: "public-member-1",
  callsign: "maple-guard",
  displayName: "Maple Guard",
  biography: "Community member.",
  cityLevelLocation: { city: "Victoria", region: "British Columbia", country: "Canada" },
  visibility: "PUBLIC",
};

test("public member projection is allow-listed and location needs separate consent", () => {
  const withoutLocation = projectPublicMemberProfile(memberProfile, baseConsent);
  assert.deepEqual(Object.keys(withoutLocation).sort(), ["biography", "callsign", "displayName", "publicId"]);
  assert.equal("memberId" in withoutLocation, false);
  assert.equal("location" in withoutLocation, false);
  const withLocation = projectPublicMemberProfile(memberProfile, [...baseConsent, {
    purpose: "PUBLIC_MEMBER_LOCATION",
    status: "GRANTED",
    decidedAt: "2026-08-01T00:00:00.000Z",
    policyVersion: "privacy-v1",
  }]);
  assert.equal(withLocation.location.city, "Victoria");
  assert.equal(projectPublicMemberProfile(
    { ...memberProfile, avatarUrl: "javascript:alert(1)" },
    baseConsent,
  ).avatarUrl, undefined);
});

const deploymentRecord = {
  id: "deployment-1",
  location: {
    city: "Victoria",
    region: "British Columbia",
    country: "Canada",
    latitude: 48.4284,
    longitude: -123.3656,
  },
  category: "STANDARD_GEAR",
  publicLabel: "FAFO Gear Deployed",
  verificationState: "VERIFIED",
  publicationState: "PUBLISHED",
  publicDeploymentConsent: "GRANTED",
  timeline: {
    createdAt: "2026-08-08T20:00:00.000Z",
    updatedAt: "2026-08-08T20:00:00.000Z",
    publishedAt: "2026-08-08T20:00:00.000Z",
  },
  privateFulfillment: {
    customerName: "Private Person",
    email: "private@example.invalid",
    streetAddress: "Private",
    orderNumber: "ORDER-1",
    paymentReference: "PAYMENT-1",
  },
};

test("public deployments are sanitized and default closed", () => {
  const projected = projectPublicDeployment(deploymentRecord);
  assert.equal(projected.markerType, "standard-deployment");
  const serialized = JSON.stringify(projected);
  for (const privateValue of ["Private Person", "private@example.invalid", "ORDER-1", "PAYMENT-1"]) {
    assert.equal(serialized.includes(privateValue), false);
  }
  assert.equal(projectPublicDeployment({ ...deploymentRecord, publicationState: "DRAFT" }), null);
  assert.equal(projectPublicDeployment({
    ...deploymentRecord,
    location: { ...deploymentRecord.location, latitude: 1000 },
  }), null);
});

test("static FAFO World adapter preserves record identity and statistics", () => {
  assert.deepEqual(staticFafoWorldRepository.listGearDeployments().map(({ id }) => id), [
    "gear-vancouver-bc-001",
    "gear-chemainus-bc-001",
    "gear-cedar-city-ut-001",
    "gear-cedar-city-ut-002",
    "gear-calgary-ab-001",
    "gear-toronto-on-001",
  ]);
  assert.deepEqual(staticFafoWorldRepository.statistics(), {
    gearDeployments: 6,
    standardDeployments: 3,
    goldStarDeployments: 3,
    memberLocations: 1,
    countriesReached: 2,
  });
});

test("money rejects invalid values and prevents cross-currency arithmetic", () => {
  assert.equal(createMoney(10.5, "CAD"), null);
  assert.equal(createMoney(-1, "CAD"), null);
  assert.deepEqual(addMoney(createMoney(100, "CAD"), createMoney(25, "CAD")), {
    minorUnits: 125,
    currency: "CAD",
  });
  assert.equal(addMoney(createMoney(100, "CAD"), createMoney(100, "USD")), null);
  assert.equal(addMoney({ minorUnits: -100, currency: "CAD" }, createMoney(100, "CAD")), null);
});

test("commerce lifecycles allow listed transitions only", () => {
  assert.equal(orderTransitionIsAllowed("DRAFT", "PENDING_PAYMENT"), true);
  assert.equal(orderTransitionIsAllowed("DRAFT", "COMPLETED"), false);
  assert.equal(paymentTransitionIsAllowed("CAPTURED", "REFUNDED"), true);
  assert.equal(fulfillmentTransitionIsAllowed("DELIVERED", "PENDING"), false);
  assert.equal(refundTransitionIsAllowed("REQUESTED", "APPROVED"), true);
});

test("Custom Shop workflow is guest-first and transitions default closed", () => {
  assert.equal(customProjectTransitionIsAllowed("INQUIRY", "CONTACT_VERIFIED"), true);
  assert.equal(customProjectTransitionIsAllowed("INQUIRY", "PRODUCTION"), false);
  assert.equal(customProjectTransitionIsAllowed("COMPLETED", "INQUIRY"), false);
});

test("Media homepage placement is manual and rights-gated", () => {
  assert.deepEqual(defaultMediaPlacement(), { active: false, featured: false, homepage: false });
  assert.equal(mediaIsHomepageEligible({
    id: "media-1",
    slug: "example",
    title: "Example",
    contentType: "VIDEO",
    publicationStatus: "PUBLISHED",
    manuallyCurated: true,
    active: true,
    featured: false,
    homepage: false,
    sortOrder: 0,
    rightsState: "APPROVED",
    externalLinks: [],
  }), false);
});

test("audit metadata is minimized and secret-like fields are excluded", () => {
  const event = createAuditEvent({
    eventId: "event-1",
    actor: { kind: "OPERATOR", actorId: "operator-1" },
    action: "PERMISSION_CHANGED",
    target: { type: "PERMISSION", targetId: "grant-1" },
    occurredAt: "2026-08-08T00:00:00.000Z",
    requestId: "request-1",
    outcome: "SUCCEEDED",
    metadata: {
      permission: "deployment.publish",
      change: "GRANTED",
      password: "must-not-appear",
      arbitraryPayload: { private: true },
      reasonCode: Number.POSITIVE_INFINITY,
    },
  });
  assert.deepEqual(event.metadata, { permission: "deployment.publish", change: "GRANTED" });
});

test("public API failures expose only fixed safe messages", () => {
  assert.deepEqual(apiFailure("INTERNAL_ERROR", "request-1"), {
    ok: false,
    error: { code: "INTERNAL_ERROR", message: "The request could not be completed." },
    requestId: "request-1",
  });
});
