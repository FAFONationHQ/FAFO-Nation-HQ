import { describe, expect, test } from "vitest";

import {
  comparePublicDeploymentSnapshots,
  ProjectingPublicDeploymentRepository,
} from "../../lib/fafo-world/database-adapter.ts";
import { validateDeploymentRecord, type PrivateDeploymentRecord } from "../../lib/fafo-world/domain.ts";
import { publishDeployment, reviewDeployment } from "../../lib/fafo-world/workflow.ts";
import { InMemoryDeploymentCandidateSource } from "../doubles/in-memory-deployment-source.ts";

const approved: PrivateDeploymentRecord = {
  id: "deployment-1",
  category: "STANDARD_GEAR",
  publicLabel: "FAFO Gear Deployed",
  location: {
    city: "Vancouver",
    region: "British Columbia",
    country: "Canada",
    latitude: 49.2827,
    longitude: -123.1207,
  },
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
    email: "private@example.test",
    streetAddress: "Never public",
    orderNumber: "order-secret",
  },
};

describe("database-prepared FAFO World adapter", () => {
  test("validates provenance and rejects malformed public records", () => {
    expect(validateDeploymentRecord({
      ...approved,
      provenance: {
        source: "STATIC_IMPORT",
        sourceReference: "shift-five-synthetic",
        recordedAt: "2026-08-08T20:00:00.000Z",
      },
    })).toEqual({ valid: true });
    expect(validateDeploymentRecord({
      ...approved,
      location: { ...approved.location, latitude: 200 },
    })).toMatchObject({ valid: false, reasons: ["INVALID_PUBLIC_LOCATION"] });
  });

  test("requires explicit operator permission, verification, and consent to publish", () => {
    const reviewAuthorization = {
      allowed: true as const,
      memberId: "reviewer-1",
      roles: ["DEPLOYMENT_REVIEWER" as const],
      permission: "deployment.review" as const,
      auditRequired: true as const,
    };
    const publishAuthorization = {
      allowed: true as const,
      memberId: "publisher-1",
      roles: ["DEPLOYMENT_PUBLISHER" as const],
      permission: "deployment.publish" as const,
      auditRequired: true as const,
    };
    const draft = { ...approved, verificationState: "PENDING" as const, publicationState: "DRAFT" as const };
    const verified = reviewDeployment(draft, "APPROVE", reviewAuthorization, new Date("2026-08-08T21:00:00Z"));
    expect(publishDeployment(
      verified,
      publishAuthorization,
      new Date("2026-08-08T21:01:00Z"),
    )).toMatchObject({ verificationState: "VERIFIED", publicationState: "PUBLISHED" });
    expect(() => publishDeployment(
      { ...verified, publicDeploymentConsent: "REVOKED" },
      publishAuthorization,
    )).toThrow("Deployment workflow transition denied.");
  });

  test("projects only publishable, consented records through the public allow-list", async () => {
    const repository = new ProjectingPublicDeploymentRepository(
      new InMemoryDeploymentCandidateSource([
        approved,
        { ...approved, id: "draft", publicationState: "DRAFT" },
        { ...approved, id: "revoked", publicDeploymentConsent: "REVOKED" },
      ]),
    );
    const snapshot = await repository.loadSnapshot();

    expect(snapshot.all).toHaveLength(1);
    expect(snapshot.statistics).toMatchObject({
      gearDeployments: 1,
      standardDeployments: 1,
      memberLocations: 0,
      countriesReached: 1,
    });
    expect(JSON.stringify(snapshot)).not.toMatch(/Private Person|private@example|street|order-secret/i);
  });

  test("member-linked location remains closed without separate association consent", async () => {
    const repository = new ProjectingPublicDeploymentRepository(
      new InMemoryDeploymentCandidateSource([{
        ...approved,
        id: "member-location",
        category: "MEMBER_LOCATION",
        memberAssociation: { publicCallsign: "maple-guard", consent: "NOT_GRANTED" },
      }]),
    );
    expect((await repository.loadSnapshot()).all).toEqual([]);
  });

  test("reports static/database snapshot parity without exposing private candidates", async () => {
    const snapshot = await new ProjectingPublicDeploymentRepository(
      new InMemoryDeploymentCandidateSource([approved]),
    ).loadSnapshot();
    expect(comparePublicDeploymentSnapshots(snapshot, structuredClone(snapshot))).toEqual({ matches: true });
    const changed = structuredClone(snapshot);
    changed.all[0].publicLabel = "Changed";
    expect(comparePublicDeploymentSnapshots(snapshot, changed)).toEqual({
      matches: false,
      differingIds: ["deployment-1"],
      statisticsMatch: true,
    });
  });
});
