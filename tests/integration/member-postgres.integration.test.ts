import { Prisma, PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  associateVerifiedWorkOsUser,
  MissingEligibilityAttestationError,
  UnverifiedWorkOsEmailError,
} from "../../lib/auth/associate-workos-user.ts";
import { createMemberSignUpState } from "../../lib/auth/member-signup-state.ts";
import { CONSENT_PURPOSES } from "../../lib/domain/consent.ts";
import { requestOwnAccountDeletion } from "../../lib/domain/services/member-account-lifecycle.ts";
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

async function expectDatabaseOperationDenied(
  operation: (transaction: Prisma.TransactionClient) => Promise<unknown>,
) {
  let denied = false;
  try {
    await client.$transaction(async (transaction) => {
      try {
        await operation(transaction);
      } catch {
        denied = true;
      }
      throw new ExpectedRollback();
    });
  } catch (error) {
    if (!(error instanceof ExpectedRollback)) throw error;
  }
  expect(denied).toBe(true);
}

describe("isolated local PostgreSQL member persistence", () => {
  beforeAll(async () => {
    const configuredUrl = new URL(process.env.DATABASE_URL ?? "");
    expect(["127.0.0.1", "localhost"]).toContain(configuredUrl.hostname);
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
             COALESCE((
               SELECT has_database_privilege(current_user, oid, 'CONNECT')
               FROM pg_database WHERE datname = 'fafo_dev'
             ), false) AS "devConnect",
             has_schema_privilege(current_user, 'public', 'CREATE') AS "schemaCreate"
    `;
    expect(identity).toMatchObject({
      version: "18.4",
      database: "fafo_test",
      role: "fafo_test_app",
      devConnect: false,
      schemaCreate: false,
    });
    if (process.env.FAFO_INTEGRATION_CI === "true") {
      expect(identity.host).toMatch(/^(?:127\.0\.0\.1|10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.)/);
    } else {
      expect(identity.host).toBe("127.0.0.1");
    }
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

  test("denies migration metadata, DDL, and role management to the application role", async () => {
    await expectDatabaseOperationDenied((transaction) =>
      transaction.$queryRawUnsafe('SELECT id FROM "_prisma_migrations" LIMIT 1'));
    await expectDatabaseOperationDenied((transaction) =>
      transaction.$executeRawUnsafe('CREATE TABLE "forbidden_app_table" (id TEXT)'));
    await expectDatabaseOperationDenied((transaction) =>
      transaction.$executeRawUnsafe('CREATE SCHEMA "forbidden_app_schema"'));
    await expectDatabaseOperationDenied((transaction) =>
      transaction.$executeRawUnsafe('CREATE ROLE forbidden_app_role'));
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

  test("atomically closes every V1 public consent during account deletion", async () => {
    await runRollbackFixture(async (repositories) => {
      const { identities, profiles, consents } = repositories;
      const member = await identities.ensureMemberForVerifiedIdentity({
        provider: "workos",
        providerSubject: `${fixturePrefix}-deletion`,
        verifiedAt: new Date("2026-08-08T23:10:00.000Z"),
      });
      await profiles.savePrivateProfile({
        memberId: member.id,
        callsign: "deletion-member",
        visibility: "PUBLIC",
      });
      for (const purpose of CONSENT_PURPOSES) {
        await consents.append({
          memberId: member.id,
          purpose,
          status: "GRANTED",
          policyVersion: "member-privacy-v1",
          source: "PROFILE_SETTINGS",
          decidedAt: new Date("2026-08-08T23:10:30.000Z"),
        });
      }
      const unitOfWork = { execute: async <T>(
        operation: (scoped: typeof repositories) => Promise<T>,
      ) => operation(repositories) };
      expect((await requestOwnAccountDeletion({
        authenticatedMemberId: member.id,
        requestedMemberId: member.id,
        requestedAt: new Date("2026-08-08T23:11:00.000Z"),
      }, unitOfWork)).status).toBe("DELETION_REQUESTED");
      expect((await profiles.findPrivateProfileByMemberId(member.id))?.visibility).toBe("PRIVATE");
      const history = await consents.listForMember(member.id);
      for (const purpose of CONSENT_PURPOSES) {
        expect(history.filter((decision) => decision.purpose === purpose).map(({ status }) => status))
          .toEqual(["GRANTED", "REVOKED"]);
      }
    });
  });
});
