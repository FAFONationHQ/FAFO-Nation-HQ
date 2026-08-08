# Dynamic Platform Readiness

This document is an implementation-order map, not a description of live functionality. The current site is a statically rendered public application. It has no application database queries, API route handlers, authentication, checkout, administrative interface, or production integrations.

## Repository baseline

- Next.js 16 App Router, React 19, strict TypeScript, and Tailwind CSS 4
- Prisma CLI and client pinned to 6.19.2, with PostgreSQL configured through `DATABASE_URL`
- one preliminary `User` model; no migrations, seed data, repositories, or application queries
- `lib/prisma.ts` supplies a reusable client singleton but is not imported by a page or service
- `app/api/` contains only `.gitkeep`
- FAFO World reads typed static records from `app/fafo-world/deployments.ts`
- all current authored pages are statically generated
- CI verifies generation, lint, route integrity, types, and production build without deployment

## Recommended dependency order

```text
Approved owner policy decisions
  -> provider selection + authentication implementation
  -> data classification + V1 schema design
  -> migrations and server repository boundary
     -> member accounts + privacy controls
        -> opt-in public member locations
     -> public deployment publishing -> database-backed FAFO World
     -> catalog -> cart -> checkout -> order ledger -> fulfillment
     -> Custom Shop project workflow + secure uploads
     -> Media publishing + Community systems
  -> operations/admin authorization
     -> approval, moderation, publishing, commerce, and alert modules
```

Authentication policy and data classification are the first blocking decisions. Schema migrations should follow both, because identity ownership, consent, deletion, and role design change nearly every dynamic entity.

## System readiness matrix

| System | Current state | Can begin independently | Blocking foundations |
| --- | --- | --- | --- |
| Authentication | Not implemented | Decision brief and threat model only | provider/session decisions, email policy, authorization roles |
| Member profiles | Public concept only | UX/content specification | authentication, profile/privacy schema |
| Privacy/visibility | Not implemented | policy and data classification | owner consent rules, authentication |
| Database-backed FAFO World | Static typed prototype | repository/DTO specification | migrations, publication/consent model, admin approval |
| Public deployment publishing | Static public records | editorial and state-machine design | data model, provenance, admin authorization |
| Catalog | Static status pages and product artwork | information architecture | product/variant model, business source of truth |
| Checkout | Not implemented | provider-neutral flow design | catalog/pricing, cart, auth choice, payment decisions |
| Fulfillment | Not implemented | provider abstraction design | order ledger, provider decisions, webhook processing |
| Custom Shop | Informational pages | workflow/state design | identity policy, data model, secure object storage |
| Media | Informational pages | content schema and templates | rights policy, publishing model, admin authorization |
| Community | Informational pages | moderation/recognition policy | member identity, privacy, authorization, moderation |
| Operations/Admin | Not implemented | module/permission specification | authentication, role model, every managed domain |

## Server and client boundaries

Keep database and credentials in server-only modules. Server Components should load public data through repositories and pass narrow serializable DTOs to client islands. Client code must never import Prisma, payment credentials, private account records, fulfillment records, or raw administrative entities.

FAFO World should remain a client rendering island, but its data should move from module constants to a sanitized server DTO. Header and LoadingScreen remain client components for interaction. Most public pages should remain Server Components and statically generated or revalidated where appropriate.

## Environments and delivery

The only repository environment reference is `DATABASE_URL`; no application feature currently consumes it. Before dynamic work, define separate local, preview, and production data ownership and migration procedures. Preview builds must not automatically point at production data. CI's placeholder database URL supports Prisma generation only and does not establish a database service.

## Implementation gates

1. Keep the approved decisions in `docs/owner-decision-register.md` encoded in testable domain policy.
2. Select and approve the managed authentication provider and testing dependencies.
3. Review and approve the proposed data model before creating the first migration.
4. Add server-only repository/service boundaries and automated tests.
5. Implement one vertical slice in a non-production environment.
6. Add authorization, audit, rate-limit, and operational failure handling before administrative or transactional release.
7. Complete privacy, security, accessibility, and recovery review before public activation.

## Explicitly out of scope at this baseline

No recommendation in this document authorizes schema changes, migrations, database connections, vendor selection, credentials, authentication, payments, uploads, production configuration, or deployment.
