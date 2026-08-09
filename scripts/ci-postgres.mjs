import { PrismaClient } from "@prisma/client";

const mode = process.argv[2];
const ADMIN_ROLE = "postgres";
const OWNER_ROLE = "fafo_test_owner";
const APP_ROLE = "fafo_test_app";
const DATABASE = "fafo_test";

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required CI PostgreSQL setting: ${name}.`);
  return value;
}

function guardedDatabaseUrl(name, expectedRole) {
  const value = requiredEnvironment(name);
  const parsed = new URL(value);
  if (
    process.env.CI !== "true" ||
    process.env.FAFO_CI_EPHEMERAL_POSTGRES !== "true" ||
    parsed.protocol !== "postgresql:" ||
    parsed.hostname !== "127.0.0.1" ||
    parsed.port !== "5432" ||
    parsed.pathname !== `/${DATABASE}` ||
    decodeURIComponent(parsed.username) !== expectedRole ||
    parsed.password
  ) throw new Error("CI PostgreSQL identity guard failed.");
  return value;
}

function clientFor(url) {
  return new PrismaClient({ datasources: { db: { url } } });
}

async function assertServerIdentity(client, expectedRole) {
  const [identity] = await client.$queryRawUnsafe(`
    SELECT current_setting('server_version') AS version,
           current_database() AS database,
           current_user AS role
  `);
  if (
    identity?.version !== "18.4" ||
    identity?.database !== DATABASE ||
    identity?.role !== expectedRole
  ) throw new Error("CI PostgreSQL server identity check failed.");
}

async function bootstrap() {
  const client = clientFor(guardedDatabaseUrl("FAFO_CI_ADMIN_DATABASE_URL", ADMIN_ROLE));
  try {
    await assertServerIdentity(client, ADMIN_ROLE);
    const conflicts = await client.$queryRawUnsafe(`
      SELECT rolname FROM pg_roles
      WHERE rolname IN ('${OWNER_ROLE}', '${APP_ROLE}')
      ORDER BY rolname
    `);
    if (conflicts.length > 0) throw new Error("CI PostgreSQL target role conflict.");
    await client.$executeRawUnsafe(
      `CREATE ROLE ${OWNER_ROLE} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`,
    );
    await client.$executeRawUnsafe(
      `CREATE ROLE ${APP_ROLE} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`,
    );
    await client.$executeRawUnsafe(`ALTER DATABASE ${DATABASE} OWNER TO ${OWNER_ROLE}`);
    console.log("CI_POSTGRES_BOOTSTRAP=complete");
  } finally {
    await client.$disconnect();
  }
}

async function grants() {
  const client = clientFor(guardedDatabaseUrl("FAFO_CI_OWNER_DATABASE_URL", OWNER_ROLE));
  try {
    await assertServerIdentity(client, OWNER_ROLE);
    const tables = await client.$queryRawUnsafe(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    const actual = tables.map(({ tablename }) => tablename).sort();
    const expected = [
      "AuthIdentity",
      "ConsentDecision",
      "Member",
      "MemberProfile",
      "_prisma_migrations",
    ].sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error("CI PostgreSQL migration table boundary check failed.");
    }

    for (const statement of [
      `REVOKE CONNECT ON DATABASE ${DATABASE} FROM PUBLIC`,
      `GRANT CONNECT ON DATABASE ${DATABASE} TO ${OWNER_ROLE}, ${APP_ROLE}`,
      "REVOKE ALL ON SCHEMA public FROM PUBLIC",
      `GRANT USAGE ON SCHEMA public TO ${APP_ROLE}`,
      `GRANT SELECT, INSERT, UPDATE ON TABLE "Member" TO ${APP_ROLE}`,
      `GRANT SELECT, INSERT ON TABLE "AuthIdentity" TO ${APP_ROLE}`,
      `GRANT SELECT, INSERT, UPDATE ON TABLE "MemberProfile" TO ${APP_ROLE}`,
      `GRANT SELECT, INSERT ON TABLE "ConsentDecision" TO ${APP_ROLE}`,
    ]) await client.$executeRawUnsafe(statement);

    const [role] = await client.$queryRawUnsafe(`
      SELECT rolcanlogin AS login,
             rolsuper AS superuser,
             rolcreatedb AS createdb,
             rolcreaterole AS createrole,
             rolreplication AS replication
      FROM pg_roles WHERE rolname = '${APP_ROLE}'
    `);
    if (
      role?.login !== true ||
      role?.superuser !== false ||
      role?.createdb !== false ||
      role?.createrole !== false ||
      role?.replication !== false
    ) throw new Error("CI PostgreSQL app-role privilege check failed.");
    console.log("CI_POSTGRES_GRANTS=complete");
  } finally {
    await client.$disconnect();
  }
}

if (mode === "bootstrap") await bootstrap();
else if (mode === "grants") await grants();
else throw new Error("Expected CI PostgreSQL mode: bootstrap or grants.");
