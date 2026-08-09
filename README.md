# FAFO Nation HQ

FAFO Nation HQ is a Next.js application for the FAFO Nation community. It includes the public site, FAFO World, a privacy-first member foundation, and truthful placeholders for operational areas that are not yet live.

## Technology and requirements

- Node.js 22.11 or newer and npm
- Next.js 16.3.0, React 19.2.4, strict TypeScript, Tailwind CSS 4
- Prisma / Prisma Client 6.19.3 targeting PostgreSQL
- WorkOS AuthKit 4.3.1 (configuration-gated)
- MapLibre GL 5 with an optional PMTiles 4.4.1 local path
- Vitest 4.1.10, Playwright 1.62.1, and axe 4.12.1

## Local setup

Install the locked dependencies:

```bash
npm ci
```

Copy `.env.development.example` to `.env.local`. Replace placeholders only when exercising the corresponding non-production integration. The required names are:

```dotenv
DATABASE_URL=
WORKOS_CLIENT_ID=
WORKOS_API_KEY=
WORKOS_COOKIE_PASSWORD=
NEXT_PUBLIC_WORKOS_REDIRECT_URI=
NEXT_PUBLIC_FAFO_PMTILES_URL=
```

`NEXT_PUBLIC_FAFO_PMTILES_URL` is optional and accepts only a same-origin path such as `/maps/fafo-world.pmtiles`. All other values are server credentials except the explicitly public redirect URI. Never commit real values.

Generate Prisma Client and start locally:

```bash
npm run prisma:generate
npm run dev
```

The app is available at `http://localhost:3000` by default. Without valid WorkOS and database configuration, `/join` truthfully reports that member access is unavailable; auth endpoints do not fabricate a session. Real local values belong only in ignored environment files.

## Verification

```bash
npm run verify       # generation, lint, routes, unit tests, types, production build
npm run test:e2e     # Chromium route, auth-boundary, security-header, and axe tests
npm run test:a11y    # representative axe checks only
npm audit
```

Automated axe checks supplement rather than replace keyboard, screen-reader, zoom/reflow, motion, and visual review.

## Current implementation

- 51 public sitemap routes, three protected account pages, four auth route handlers, and one dynamic public member-profile route.
- WorkOS sign-in, sign-up, callback, and sign-out foundations with verified-email association, sealed 18+ attestation state, safe configuration gating, and no home-grown passwords.
- Private member profile editing, normalized unique callsigns, separate profile/location consent, append-only consent history, exact public preview, and allowlisted public projection.
- Prisma V1 `Member`, `AuthIdentity`, `MemberProfile`, and `ConsentDecision` schema plus reviewed SQL migration history. It is applied only to isolated local `fafo_dev` and `fafo_test`; the test database has passed destructive rebuild proof.
- Server-only Prisma repositories and in-memory contract doubles. Real local PostgreSQL integration tests exercise identity/member persistence, consent, privacy defaults, and negative least-privilege operations.
- Fail-closed operator authorization contracts, MFA/recent-auth requirements, and an append-only audit repository boundary. Their proposed V2 tables are not in the V1 schema.
- Static FAFO World remains the active source. A tested asynchronous database-projection adapter and migration proposal are ready for a separately approved V2.
- Optional local raster PMTiles protocol integration; the default remains the current demonstration style and no map archive is committed or deployed.
- Baseline response security headers, hidden framework header, public/private DTO checks, and a zero-finding npm audit.

## Database and migration status

`prisma/migrations/20260808113000_member_privacy_v1/migration.sql` is the reviewed V1 migration. It has been applied by dedicated owner roles to isolated local PostgreSQL 18.4 databases `fafo_dev` and `fafo_test`. Least-privilege application grants, repository behavior with synthetic fixtures, and a destructive rebuild of `fafo_test` from migration history have been verified. The guarded CI workflow provisions a separate disposable runner database; it has not yet been executed on GitHub. Never point local tests or CI at production.

## Important limitations

- Local WorkOS Staging and isolated database configuration exist outside Git. One owner-controlled synthetic signup/email verification is still required to prove the real browser lifecycle; recovery and session-expiry lifecycle checks follow.
- No production auth activation, operator portal, roles table, audit table, deployment table, database-backed map switch, or PMTiles archive exists.
- Commerce, payments, fulfillment, arbitrary uploads, native administration, and operational FAFO Cares routes remain unavailable.
- Ten sensitive FAFO Cares destinations remain intentional blockers pending approved content and operations.
- The map still uses typed static records and the public MapLibre demonstration style unless local PMTiles is explicitly configured.
- No deployment, DNS, production service, or external communication is performed by repository verification.

## Documentation

- `docs/architecture.md` — current boundaries and rendering/data flow
- `docs/authentication-and-members.md` — member and authentication status plus design rationale
- `docs/data-and-fafo-world.md` — current data boundary and FAFO World V2 design
- `docs/prisma-v1-schema-proposal.md` — implemented V1 schema and unapplied migration status
- `docs/prisma-v2-audit-proposal.md` — proposed audit/operator persistence only
- `docs/fafo-world-v2-db-proposal.md` — proposed database-backed map persistence only
- `docs/pmtiles-local-prototype.md` — local PMTiles setup and production prerequisites
- `docs/security-testing-performance.md` — current security, testing, and performance status
- `docs/shift-4-aar.md` — Shift #4 after-action report
