import { describe, expect, test } from "vitest";

import { ProjectingPublicDeploymentRepository } from "../../lib/fafo-world/database-adapter.ts";
import type { PrivateDeploymentRecord } from "../../lib/fafo-world/domain.ts";
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
});
