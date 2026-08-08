# FAFO Nation Application Architecture

This document describes the repository after Dynamic Platform Breakthrough Shift #4. Planned or externally blocked capabilities are labeled explicitly.

## Runtime stack

- Next.js 16.3.0 App Router and React 19.2.4
- strict TypeScript 5.9 and Tailwind CSS 4
- Prisma / Prisma Client 6.19.3 targeting PostgreSQL
- WorkOS AuthKit 4.3.1 and WorkOS Node 10.9.0
- MapLibre GL 5.24.0 and PMTiles 4.4.1
- Vitest, Playwright Chromium, and axe automation
- Node.js 22.11 minimum; verification-only GitHub Actions

## Route and rendering boundary

The public sitemap contains 51 static routes. `/join` is dynamic so authentication readiness is evaluated at request time. `/account`, `/account/profile`, and `/account/privacy` are protected dynamic pages; `/members/[callsign]` is a dynamic public projection. Four `/auth/*` handlers implement sign-in, sign-up, callback, and sign-out. Ten sensitive FAFO Cares destinations remain intentional blockers.

Most public pages remain Server Components or static output. Client code is limited to interactive islands such as Header, LoadingScreen, member forms, and FAFO World. MapLibre and PMTiles remain route-local rather than entering the shared application shell.

## Authentication and member flow

`proxy.ts` enables AuthKit only when the complete environment passes validation. Missing or placeholder configuration leaves public pages usable and auth endpoints truthful/inert. WorkOS owns credentials and sessions. Callback association accepts only verified WorkOS users and a sealed 18+ attestation state; authentication never grants FAFO operator authority.

Protected pages call a server-only member-session boundary that requires verified email, an associated active member, and stored eligibility attestation. Profile and consent mutations run through server actions, repositories, centralized callsign validation, and purpose-specific consent services. Public member output is rebuilt through an explicit allowlist and fails closed after revocation.

## Persistence boundary

Prisma V1 contains only `Member`, `AuthIdentity`, `MemberProfile`, and append-only `ConsentDecision` plus supporting enums and indexes. Provider credentials, email duplication, roles, audit, FAFO World, commerce, media, and uploads are excluded. Server-only adapters select and map explicit DTOs; Prisma records are not passed to client components.

The first SQL migration exists as a reviewable artifact but was not applied. No database was available that could safely be identified as isolated and disposable. In-memory repositories provide deterministic unit/integration coverage without simulating a live database.

## Authorization and audit boundary

FAFO authorization remains independent from WorkOS. Permission sets and role aggregation default deny. The operator boundary additionally requires a recognized FAFO role, the action permission, recent authentication, configured MFA policy, and an audit requirement on successful privileged decisions. No operator UI or persistent role grants exist.

Audit event construction minimizes metadata by action and rejects secret-like keys. Persistence exposes `append` only. Audit and role tables are deferred to the reviewed V2 proposal; V1 was not silently expanded.

## FAFO World boundary

The active visual dataset remains the same seven typed static public records. Popups use DOM `textContent`, the page includes an equivalent text location index, and no fulfillment/customer data reaches the map.

An asynchronous database-preparation adapter now accepts private candidates, runs every record through the fail-closed public projection, and returns a sanitized snapshot and statistics. A future Prisma source can sit behind this adapter after the V2 migration is approved. The static adapter remains the active fallback.

The default basemap remains the MapLibre demonstration style. An optional same-origin raster PMTiles path registers the official protocol integration locally; invalid/external paths fall back to the demonstration style. No archive, object storage, CDN, or production switch was added.

## Security and operational boundary

Baseline headers disable MIME sniffing, framing, browser geolocation/camera/microphone, DNS prefetch, and the framework identification header. WorkOS handles PKCE/CSRF/session mechanics according to its installed integration; app routes do not accept user-controlled post-auth redirects. Public DTOs, authorization, consent, and callback errors have negative tests.

This is not a production security certification. Rate limiting, operator persistence, database enforcement, secret scanning, CSP design compatible with Next/MapLibre, monitoring, recovery, deletion/export operations, incident response, and external review remain pre-launch work.

## Verification architecture

`npm run verify` performs Prisma generation, lint, route-manifest/sitemap integrity, 43 Vitest tests, strict type checking, and a production build. Playwright separately runs 62 Chromium tests: all public routes, credential-free auth behavior, baseline response headers, primary navigation, and eight representative axe scans. CI runs the deterministic gate plus Chromium browser job without deployment.
