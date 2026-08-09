import { Prisma, PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  associateVerifiedWorkOsUser,
  MissingEligibilityAttestationError,
  UnverifiedWorkOsEmailError,
} from "../../lib/auth/associate-workos-user.ts";
import { createMemberSignUpState } from "../../lib/auth/member-signup-state.ts";
import {
  createPrismaMemberRepositorySet,
  PrismaMemberRepositoryUnitOfWork,
} from "../../lib/domain/persistence/prisma-member-repositories.server.ts";
import { PersistenceConflictError } from "../../lib/domain/persistence/member-repositories.ts";

const client = new PrismaClient();
const fixturePrefix = `shift5-synthetic-${Date.now()}-${process.pid}`;

class ExpectedRollback extends Error {}

async function runRollbackFixture(
  operation: (
    repositories: ReturnType<typeof createPrismaMemberRepositorySet>,
    transaction: Prisma.TransactionClient,
  ) => Promise<void>,
) {
  let operationCompleted = false;
  try {
    await client.$transaction(async (transaction) => {
      await operation(createPrismaMemberRepositorySet(transaction), transaction);
      operationCompleted = true;
      throw new ExpectedRollback();
    });
  } catch (error) {
    if (!(error instanceof ExpectedRollback)) throw error;
  }
  expect(operationCompleted).toBe(true);
}

describe("isolated local PostgreSQL member persistence", () => {
  beforeAll(async () => {
    const [identity] = await client.$queryRaw<
      Array<{
        version: string;
        host: string;
        database: string;
        role: string;
        devConnect: boolean;
        schemaCreate: boolean;
      }>
    >`
      SELECT current_setting('server_version') AS version,
             host(inet_server_addr()) AS host,
             current_database() AS database,
             current_user AS role,
             has_database_privilege(current_user, 'fafo_dev', 'CONNECT') AS "devConnect",
             has_schema_privilege(current_user, 'public', 'CREATE') AS "schemaCreate"
    `;
    expect(identity).toEqual({
      version: "18.4",
      host: "127.0.0.1",
      database: "fafo_test",
      role: "fafo_test_app",
      devConnect: false,
      schemaCreate: false,
    });
  });

  afterAll(async () => {
    await client.$disconnect();
  });

  test("normalizes callsigns and duplicate constraints inside a rollback fixture", async () => {
    await runRollbackFixture(async ({ identities, profiles }) => {
      const first = await identities.ensureMemberForVerifiedIdentity({
        provider: "workos",
        providerSubject: `${fixturePrefix}-first`,
        verifiedAt: new Date("2026-08-08T23:00:00.000Z"),
      });
      const second = await identities.ensureMemberForVerifiedIdentity({
        provider: "workos",
        providerSubject: `${fixturePrefix}-second`,
        verifiedAt: new Date("2026-08-08T23:00:01.000Z"),
      });
      expect((await profiles.savePrivateProfile({
        memberId: first.id,
        callsign: " Shift_Five ",
      })).callsign).toBe("shift-five");
      await expect(profiles.savePrivateProfile({
        memberId: second.id,
        callsign: "SHIFT-FIVE",
      })).rejects.toBeInstanceOf(PersistenceConflictError);
    });
  });

  test("persists a verified WorkOS callback once with private and consent-free defaults", async () => {
    await runRollbackFixture(async ({ identities, profiles, consents }, transaction) => {
      const providerSubject = `${fixturePrefix}-callback`;
      const callback = {
        id: providerSubject,
        emailVerified: true,
      };
      const state = createMemberSignUpState();
      const first = await associateVerifiedWorkOsUser(callback, identities, {
        observedAt: new Date("2026-08-08T23:02:00.000Z"),
        state,
      });
      const repeated = await associateVerifiedWorkOsUser(callback, identities, {
        observedAt: new Date("2026-08-08T23:02:01.000Z"),
        state,
      });

      expect(repeated.id).toBe(first.id);
      expect(first).toMatchObject({
        status: "ACTIVE",
        eligibilityPolicyVersion: "member-eligibility-v1",
      });
      expect(await profiles.findPrivateProfileByMemberId(first.id)).toBeNull();
      expect(await consents.listForMember(first.id)).toEqual([]);
      expect(await transaction.member.count({ where: { id: first.id } })).toBe(1);
      expect(await transaction.authIdentity.count({
        where: { provider: "workos", providerSubject },
      })).toBe(1);
      expect(await transaction.memberProfile.count({ where: { memberId: first.id } })).toBe(0);
      expect(await transaction.consentDecision.count({ where: { memberId: first.id } })).toBe(0);
    });
  });

  test("rejects unverified or unattested callbacks without database writes", async () => {
    await runRollbackFixture(async ({ identities }, transaction) => {
      const unverifiedSubject = `${fixturePrefix}-unverified`;
      const unattestedSubject = `${fixturePrefix}-unattested`;
      await expect(associateVerifiedWorkOsUser({
        id: unverifiedSubject,
        emailVerified: false,
      }, identities, { state: createMemberSignUpState() })).rejects.toBeInstanceOf(
        UnverifiedWorkOsEmailError,
      );
      await expect(associateVerifiedWorkOsUser({
        id: unattestedSubject,
        emailVerified: true,
      }, identities)).rejects.toBeInstanceOf(MissingEligibilityAttestationError);
      expect(await transaction.authIdentity.count({
        where: { providerSubject: { in: [unverifiedSubject, unattestedSubject] } },
      })).toBe(0);
    });
  });

  test("rolls back repository writes when a transaction operation fails", async () => {
    const providerSubject = `${fixturePrefix}-rollback`;
    const unitOfWork = new PrismaMemberRepositoryUnitOfWork(client);
    await expect(unitOfWork.execute(async ({ identities }) => {
      await identities.ensureMemberForVerifiedIdentity({
        provider: "workos",
        providerSubject,
        verifiedAt: new Date("2026-08-08T23:05:00.000Z"),
      });
      throw new ExpectedRollback("synthetic transaction failure");
    })).rejects.toMatchObject({ name: "PersistenceOperationError" });

    expect(await client.authIdentity.findUnique({
      where: { provider_providerSubject: { provider: "workos", providerSubject } },
    })).toBeNull();
  });

  test("applies account deletion state without leaving synthetic fixtures", async () => {
    await runRollbackFixture(async ({ identities }) => {
      const member = await identities.ensureMemberForVerifiedIdentity({
        provider: "workos",
        providerSubject: `${fixturePrefix}-deletion`,
        verifiedAt: new Date("2026-08-08T23:10:00.000Z"),
      });
      expect((await identities.requestDeletion(
        member.id,
        new Date("2026-08-08T23:11:00.000Z"),
      )).status).toBe("DELETION_REQUESTED");
    });
  });
});
