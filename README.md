# FAFO Nation HQ

FAFO Nation HQ is a Next.js website for the FAFO Nation community. The current application provides branded public information pages, FAFO World, public deployment records, and truthful status pages for planned areas that are not yet operational.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- MapLibre GL
- Prisma 6 with a PostgreSQL datasource

## Requirements

- Node.js 20.9 or newer
- npm

## Setup

Install the locked dependencies:

```bash
npm ci
```

Create a local `.env` file containing a PostgreSQL connection URL when database access is required:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Environment files are ignored by Git. Do not commit credentials.

Generate the Prisma client:

```bash
npm run prisma:generate
```

Start the development server:

```bash
npm run dev
```

The local application is available at `http://localhost:3000` by default.

## Verification

Run individual checks with:

```bash
npm run lint
npm run check:routes
npm run typecheck
npm run build
```

Run Prisma client generation and all verification checks in sequence with:

```bash
npm run verify
```

The route check confirms that every header destination is either implemented or listed as an intentional content blocker. The GitHub Actions verification workflow runs the same combined checks for pushes and pull requests. It does not deploy the application.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) - current application structure and dynamic-system boundaries
- [`docs/website-visual-asset-queue.md`](docs/website-visual-asset-queue.md) - owner/creative handoff for future website imagery
- [`docs/platform-readiness.md`](docs/platform-readiness.md) - implementation order and dynamic-system dependency map
- [`docs/authentication-and-members.md`](docs/authentication-and-members.md) - identity and Member V1 decision package
- [`docs/data-and-fafo-world.md`](docs/data-and-fafo-world.md) - proposed V1 data model and FAFO World V2 specification
- [`docs/commerce-and-custom-shop.md`](docs/commerce-and-custom-shop.md) - commerce and Custom Shop workflow specifications
- [`docs/media-and-operations.md`](docs/media-and-operations.md) - media publishing and future operations architecture
- [`docs/security-testing-performance.md`](docs/security-testing-performance.md) - security, test, performance, and hygiene baseline
- [`docs/owner-decision-register.md`](docs/owner-decision-register.md) - prioritized owner decisions
- [`docs/shift-3-backlog.md`](docs/shift-3-backlog.md) - dependency-aware next-shift queue

## Architecture

- `app/` contains App Router pages, the shared header, loading experience, and global styles.
- `app/components/PublicStatusPage.tsx` provides the shared presentation used by informational "coming later" routes.
- `app/fafo-world/` contains the FAFO World page, interactive MapLibre component, and current static deployment records.
- `assets/` contains source-imported artwork and product imagery.
- `public/assets/` contains directly served branding, UI, and audio assets.
- `lib/prisma.ts` provides a reusable Prisma client singleton.
- `prisma/schema.prisma` contains the initial PostgreSQL schema.

## Implemented routes

- `/` - branded FAFO Nation homepage
- `/join` - public explanation of membership and future account concepts
- `/about`, `/about/our-story`, `/about/sgt-swagger`, and `/about/long-term-vision`
- `/contact` - informational contact-status page without invented contact details
- `/community` and public Community information/status routes
- `/fafo-cares` - informational landing with explicit operational boundaries
- `/media`, `/media/videos`, `/media/live`, and planned-content status routes
- `/custom-shop`, `/custom-shop/how-it-works`, and planned Custom Shop status routes
- `/store` and planned native Store category status routes
- `/fafo-world` - interactive deployment and member-location map
- `/recently-deployed` - list of the existing public gear deployment records

The header currently contains 54 unique internal destinations. Forty-four have route implementations. Ten sensitive FAFO Cares subroutes remain intentionally unimplemented pending approved resources, policies, and operational details.

## Database status

The Prisma schema currently defines an initial `User` model. Prisma Client generation is configured, but the application does not yet query a database. There are no migrations or seed scripts in the repository, and verification does not connect to or modify a database.

## FAFO World data

FAFO World currently reads deployment and member-location records from `app/fafo-world/deployments.ts`. The records and statistics are static and are not connected to orders, fulfillment, member accounts, or Prisma.

Map popups render values as text rather than raw HTML so future dynamic data cannot inject markup.

## Known limitations

- Ten FAFO Cares navigation destinations remain unimplemented because the repository does not contain sufficient approved crisis, medical, assistance, fundraising, campaign, volunteer, or support information.
- Authentication, accounts, commerce, fulfillment, administration, community systems, and media publishing are not implemented.
- Many Community, Custom Shop, Media, and Store routes are informational status pages; they do not provide the operational features described as planned.
- The database client is not wired into application features.
- FAFO World uses static source data and public MapLibre demonstration tiles.
- Automated unit, integration, accessibility, and end-to-end tests have not been added.
- Root-level static HTML and CSS files are legacy material and are not part of the active Next.js route tree.
