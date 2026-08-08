# FAFO Nation HQ

FAFO Nation HQ is a Next.js website for the FAFO Nation community. The current application provides the branded homepage and FAFO World, an interactive map of verified gear deployments and public member locations.

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
npm run typecheck
npm run build
```

Run Prisma client generation and all verification checks in sequence with:

```bash
npm run verify
```

The GitHub Actions verification workflow runs the same combined check for pushes and pull requests. It does not deploy the application.

## Architecture

- `app/` contains App Router pages, the shared header, loading experience, and global styles.
- `app/fafo-world/` contains the FAFO World page, interactive MapLibre component, and current static deployment records.
- `assets/` contains source-imported artwork and product imagery.
- `public/assets/` contains directly served branding, UI, and audio assets.
- `lib/prisma.ts` provides a reusable Prisma client singleton.
- `prisma/schema.prisma` contains the initial PostgreSQL schema.

## Implemented routes

- `/` — branded FAFO Nation homepage
- `/fafo-world` — interactive deployment and member-location map

Other destinations currently shown in the navigation are planned but do not yet have route implementations.

## Database status

The Prisma schema currently defines an initial `User` model. Prisma Client generation is configured, but the application does not yet query a database. There are no migrations or seed scripts in the repository, and verification does not connect to or modify a database.

## FAFO World data

FAFO World currently reads deployment and member-location records from `app/fafo-world/deployments.ts`. The records and statistics are static and are not connected to orders, fulfillment, member accounts, or Prisma.

Map popups render values as text rather than raw HTML so future dynamic data cannot inject markup.

## Known limitations

- Only the homepage and FAFO World routes are implemented.
- Most navigation destinations currently return a not-found page.
- Authentication, accounts, commerce, fulfillment, administration, community systems, and media publishing are not implemented.
- The database client is not wired into application features.
- FAFO World uses static source data and public MapLibre demonstration tiles.
- Automated unit, integration, accessibility, and end-to-end tests have not been added.
- Root-level static HTML and CSS files are legacy material and are not part of the active Next.js route tree.
