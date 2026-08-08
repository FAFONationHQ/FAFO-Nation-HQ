# Managed Authentication Provider Evaluation

Date: 2026-08-08  
Status: WorkOS selected and AuthKit installed; no provider account, credentials, paid service, or production environment accessed

## Repository requirements

- Next.js 16 App Router and React 19
- verified email/password for V1; OAuth optional later
- production MFA for privileged accounts and recent/step-up auth for high-risk actions
- passkey/phishing-resistant path preferred
- server-side authorization using FAFO-owned granular permissions
- Prisma/PostgreSQL stores application member/profile/consent data, not password credentials
- isolated local/test/preview/production data and identity environments
- export/deletion/retention, privacy/data-residency review, and a credible migration path

## Candidate comparison

| Candidate | Fit | Material strengths | Material concerns |
| --- | --- | --- | --- |
| **WorkOS AuthKit** | Strong technical finalist | Official Next.js SDK explicitly documents App Router and Next.js 16 `proxy.ts`; hosted or custom UI; verified email/password, recovery, MFA, passkeys, safe identity linking, server tokens, and separate staging/production environments. AuthKit is currently advertised free up to 1 million MAU; custom domain is listed separately. FAFO permissions can remain in PostgreSQL and be evaluated server-side. | Product heritage is enterprise/B2B; hosted-flow/session conventions and SDK create vendor coupling. Public docs found during this review did not establish Canadian auth-data residency or a complete self-service user export story; obtain written answers/DPA before selection. Production requires billing information even below the free threshold. |
| **Clerk** | Strong UX/developer finalist | Mature Next.js SDK, React components/hooks, email/password, MFA, backup codes, passkeys, account recovery, backend API/webhooks, and dashboard CSV export. Fastest custom FAFO UI path if prebuilt components are acceptable. | Production MFA/passkeys are paid-plan features. Passkeys have domain constraints. SDK/components increase UI and session coupling. Confirm Canadian/data-residency requirements, hashed-credential migration/export terms, and actual retained-user pricing before approval. |
| **Auth0** | Strong compliance/portability finalist | Long-standing standards-based hosted identity, database connection for email/password, passkeys, Universal Login, MFA tiers, Management API/user export, and documented Canada tenant locality. Next.js/server authorization integration is well understood. | Pricing becomes materially higher when production-grade MFA is required; configuration surface and operational complexity are greatest of the finalists. The owner must confirm plan-level MFA/step-up needs and current Next.js 16 SDK behavior in a spike. |
| **Supabase Auth** | Conditional alternative | Email/password, SSR guidance for Next.js, TOTP MFA, open-source GoTrue lineage, direct PostgreSQL ownership/export, Canada AWS region option, and low bundled pricing. | It would add a second database/platform boundary alongside the planned Prisma/PostgreSQL architecture unless FAFO changes infrastructure direction. Current passkey support is documented as experimental. More auth/session UI, RLS, SMTP, and operational policy remains application-owned. Not preferred for this repository’s current managed-identity/provider-separation goal. |

## Current official evidence

- WorkOS: [Next.js SDK](https://workos.com/docs/sdks/authkit-nextjs), [AuthKit overview](https://workos.com/docs/authkit/overview), [environment separation](https://workos.com/docs/authkit/environments), [pricing](https://workos.com/pricing).
- Clerk: [Next.js SDK](https://clerk.com/docs/reference/nextjs/overview), [sign-in/password/MFA/passkey options](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options), [pricing](https://clerk.com/pricing), [user export](https://clerk.com/changelog/2024-10-23-export-users).
- Auth0: [pricing and plan features](https://auth0.com/pricing), [tenant regions including Canada](https://auth0.com/docs/get-started/auth0-overview/create-tenants), [user import/export](https://auth0.com/docs/customize/extensions/user-import-export-extension).
- Supabase: [Next.js Auth quickstart](https://supabase.com/docs/guides/auth/quickstarts/nextjs), [MFA](https://supabase.com/docs/guides/auth/auth-mfa), [experimental passkeys](https://supabase.com/docs/guides/auth/passkeys), [regions](https://supabase.com/docs/guides/platform/regions), [pricing](https://supabase.com/pricing).

Pricing and plan gates are time-sensitive and must be re-verified immediately before contracting.

## Recommendation

Run a no-production-data technical/privacy spike with **WorkOS AuthKit and Clerk as the primary finalists**, and retain **Auth0 as the preferred fallback if contractual Canadian data locality or mature export/compliance controls outweigh cost and integration simplicity**. Do not select Supabase Auth unless the owner also approves changing the broader database/platform direction.

The spike should prove, using isolated vendor staging only:

1. verified email/password registration, recovery, session revocation, and non-enumerating failures;
2. Next.js 16 server-side identity resolution without protecting public/static assets accidentally;
3. mapping provider subject → FAFO `Member` while all callsign/profile/consent/permission data remains in FAFO PostgreSQL;
4. mandatory operator MFA and a recent-auth/step-up signal before permission, publication, or refund operations;
5. local/preview/staging/production isolation and test automation support;
6. complete user export, deletion, webhook retry/signature behavior, audit access, key rotation, and exit procedure;
7. DPA/subprocessors, breach terms, Canadian/US data flows, support/SLA, rate limits, custom-domain cost, and pricing at realistic member counts.

## Owner decision still required

Select the managed authentication provider and acceptable plan only after the spike and privacy/commercial review. This decision package does not authorize accounts, credentials, dependencies, `.env` changes, or authentication implementation.
