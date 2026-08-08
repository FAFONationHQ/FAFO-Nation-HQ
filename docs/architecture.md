# FAFO Nation Application Architecture

This document describes the application as it exists. Planned systems are identified explicitly and must not be interpreted as implemented.

## Runtime stack

- Next.js 16 App Router
- React 19
- TypeScript 5 in strict mode
- Tailwind CSS 4 through PostCSS
- MapLibre GL 5
- Prisma 6 client targeting PostgreSQL
- npm lockfile and GitHub Actions verification

## App Router structure

The repository currently contains 51 authored `page.tsx` routes. Public route families include:

- homepage and `/join`
- About and Contact
- Community
- FAFO Cares landing
- Media
- Custom Shop
- Store
- FAFO World and Recently Deployed

All public content routes are statically rendered by the current production build. No route reads application data from a database.

## Public page architecture

### Bespoke pages

Major landing and narrative pages define their own server-rendered layout using the existing Header, FAFO typography, black background, red/gold emphasis, bordered information cards, and responsive Tailwind utilities.

Examples:

- `app/join/page.tsx`
- `app/about/page.tsx`
- `app/community/page.tsx`
- `app/media/page.tsx`
- `app/custom-shop/page.tsx`
- `app/store/page.tsx`
- `app/recently-deployed/page.tsx`

### Shared status pages

`app/components/PublicStatusPage.tsx` renders the demonstrated common pattern for planned but unavailable public areas. It provides:

- shared Header and main landmark
- branded responsive hero
- one primary heading
- truthful availability panel
- valid internal return link

Twenty-eight routes use this component. Route files retain their own metadata and exact content so availability claims remain explicit and reviewable.

### Existing specialized systems

- `app/page.tsx` is the branded client homepage and loading-entry host.
- `app/LoadingScreen.tsx` owns entry timing, audio, imagery, and animation behavior.
- `app/Header.tsx` owns the complete desktop and mobile navigation definition.
- `app/fafo-world/FAFOWorldMap.tsx` owns client-side MapLibre behavior.

These specialized systems are not forced into the status-page component architecture.

## Public-route audit baseline

The Shift #2 code audit covered all 51 page source files.

- Root metadata is supplied by `app/layout.tsx`.
- Meaningful public routes have route-specific metadata, including FAFO World.
- The homepage now contains a visually hidden primary heading.
- Template routes inherit their Header and primary heading from `PublicStatusPage`.
- Alias routes for Community recognition and events re-export the corresponding approved page and metadata.
- All exact static internal links are covered by route verification.
- Ten sensitive FAFO Cares links remain explicit intentional blockers.

Browser-level visual and assistive-technology testing is still required before production release.

## Route integrity

`scripts/check-routes.mjs` uses built-in Node.js modules only. It:

1. Extracts exact static internal `href` literals from Header and authored `app` TypeScript.
2. Discovers implemented App Router `page.tsx` routes.
3. Fails for unexpected missing Header routes.
4. Fails for broken static internal links elsewhere in authored pages.
5. Allows only the ten exact approved FAFO Cares blockers.
6. Fails when a blocker exception becomes stale.

Limitations:

- Computed and runtime-generated links are not parsed.
- The checker is intentionally not a JavaScript/TypeScript parser.
- External links are outside its scope.

## FAFO World data boundary

Current public map data lives in `app/fafo-world/deployments.ts` as typed static arrays:

- `GEAR_DEPLOYMENTS`
- `MEMBER_LOCATIONS`
- derived `FAFO_WORLD_STATS`

The map receives no customer, payment, address, account, or order data. Locations use city-level coordinates. Recently Deployed imports the same public gear array and does not create a second source of truth.

Future database work must preserve a separate sanitized public-deployment boundary. Private fulfillment data must never be passed directly to the map.

## Prisma status

Present:

- Prisma CLI and client pinned to 6.19.2
- PostgreSQL datasource declaration
- initial `User` model
- reusable development-safe client singleton
- client generation in `npm run verify`

Not present:

- migrations
- seed data
- application queries
- repository/data-access layer
- database-backed routes
- operational database verification

No current page imports `lib/prisma.ts`.

## API, authentication, and authorization status

- `app/api/` contains no implemented route handlers.
- Authentication is not implemented.
- Sessions, verification, recovery, OAuth, and registration are not implemented.
- No protected routes or server authorization layer exist.
- The schema's string `role` field is not an authorization system.

Dynamic or administrative functionality must wait for an approved authentication and authorization architecture.

## Commerce and operational status

The application does not implement:

- native catalog data
- cart or checkout
- payments
- orders or fulfillment
- customer submissions
- Custom Shop uploads or quotes
- media publishing
- community accounts/activity
- FAFO Cares applications or donations
- administration

Store and operational pages are truthful static information/status pages. The only storefront action is the existing repository-supported external Printify link.

## Verification pipeline

`npm run verify` runs, in order:

1. Prisma client generation
2. ESLint
3. static route integrity
4. TypeScript type-check
5. Next.js production build

GitHub Actions runs the same command for pushes and pull requests with read-only repository permission. It does not deploy.

Current accepted warnings:

- two raw `<img>` warnings in `LoadingScreen.tsx`

They remain because changing the rendering component requires browser-level confirmation of identical loading layout and timing.

## Known blockers

Ten FAFO Cares subroutes remain unavailable because the repository does not contain approved crisis, medical, veteran, fundraising, emergency-fund, campaign, volunteer, or spotlight information. These are exact exceptions in route verification and must not be broadened.

## Intentionally deferred systems

- authentication and member accounts
- Prisma migrations and application data access
- database-backed FAFO World
- native commerce and payments
- fulfillment-provider integration
- Custom Shop workflows and uploads
- media CMS
- Community operational features
- FAFO Cares sensitive workflows
- Operations and Admin Center

Each requires explicit architecture, security, privacy, data, and owner decisions before implementation.
