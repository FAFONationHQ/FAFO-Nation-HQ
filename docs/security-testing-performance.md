# Security, Testing, and Performance Status

Date: 2026-08-08

## Security outcome

- `npm audit` moved from 9 high findings at shift start to 0 findings. Next/eslint-config-next are pinned to 16.3.0 and Prisma/client to 6.19.3. Patched `brace-expansion` and `js-yaml` transitive versions are narrowly overridden; no `npm audit fix` or forced remediation was used.
- WorkOS configuration fails closed when values are missing, placeholders, malformed, or too short. Secrets stay server-only; no credentials are committed.
- Verified email, sealed adult attestation, active member status, and stored eligibility are required before protected member access.
- Authentication does not imply authorization. Operator decisions require FAFO-owned roles, explicit permission, MFA policy, recent authentication, and auditability.
- Profile, consent, member, deployment, and audit boundaries use explicit inputs/outputs. Public projections omit provider identifiers, email, precise/private location, fulfillment, payment, and secret metadata.
- Consent is default deny, purpose-specific, append-only, and revocable. Public access fails closed after revocation.
- Auth redirects are application-selected; callback failures return a safe join status and expire any partially created session cookie. Signed-out protected requests are rejected by the AuthKit proxy before Server Components execute. No user-controlled open redirect was added.
- Map popup text is created with `textContent`; PMTiles configuration accepts only a same-origin `.pmtiles` path.
- Response headers deny framing and sensitive browser capabilities, disable MIME sniffing/DNS prefetch, set a strict referrer policy, and remove `X-Powered-By`.

Remaining production gates include a production-grade shared rate-limit store and abuse controls, CSP design compatible with Next/MapLibre/WorkOS, persistent operator/audit enforcement, secret scanning, monitoring/alerting, recovery/export completion, backup/restore operations, and independent security/privacy review. The local V1 database integration is proven; the prepared disposable PostgreSQL CI path still needs its first approved GitHub Actions execution.

## Automated testing

- Unit: 87 Vitest tests passed.
- Integration: 8 tests passed: 6 against isolated local PostgreSQL and 2 against the installed AuthKit package with synthetic no-network provider responses.
- Browser E2E: 72 Playwright Chromium tests passed across implemented public routes, auth-unavailable behavior, primary navigation, responsive layouts, and headers.
- Accessibility: 12 representative WCAG A/AA axe scans passed. Manual keyboard, screen-reader, reflow/zoom, reduced-motion, media-alternative, and visual review remain required.
- Route gate: 52 declared public patterns, 55 page implementations, four handlers, three protected routes, ten intentional blockers, 51 sitemap routes, and 63 static links verified.
- Production build: 59 static pages generated; protected/auth/member paths remained dynamic as designed.

CI uses Node 22.11, runs the deterministic verification gate, installs Playwright Chromium, runs browser tests, and defines a guarded disposable PostgreSQL 18.4 integration job with synthetic local-only credentials and least-privilege roles. It has read-only repository permission and no deployment step. The database job has been statically and locally guard-checked but cannot be runtime-proven until an approved GitHub Actions run.

## Accessibility corrections

Objective automated/manual evidence led to contrast adjustments, a non-pointer dismissal path for the LoadingScreen, optimized images with preserved behavior, accessible map marker controls, and a text equivalent for map locations. Automated axe coverage is evidence, not certification.

## Performance review

- Most public pages remain static and server-rendered; dynamic rendering is limited to runtime auth/account/member paths.
- Prisma and WorkOS session code are server-only. MapLibre/PMTiles remain isolated to FAFO World.
- LoadingScreen images now use `next/image` while preserving timing/layout behavior, removing the two prior lint warnings.
- No evidence justified clustering, virtualization, broad client-state refactoring, or asset recompression.

No production RUM, Lighthouse budget, Core Web Vitals baseline, or approved PMTiles archive exists, so production performance is not certified. Map/archive byte size and CDN behavior cannot be measured until coverage, zoom range, format, and licensed data source are chosen.
