# Security, Testing, Performance, and Repository Readiness

This baseline is grounded in the current repository and future systems proposed elsewhere. It does not report offensive testing, production measurement, or a production security certification.

# Security threat-model baseline

## Current public layer

The current application has a small attack surface because pages are static and there are no API handlers, credentials in client code, forms, authentication, uploads, database queries, or payment endpoints. FAFO World loads a third-party demonstration map style and tiles, which creates availability/privacy/content-policy dependencies. Popup content is built with DOM nodes and `textContent`, avoiding raw HTML injection.

Repository safeguards include ignored `.env*` files, read-only CI repository permission, pinned Next/Prisma versions, and a verification pipeline. No exposed secret value was found in tracked source during the audit; the README contains only an obvious placeholder connection string. This is not secret-scanning coverage.

## Future threat and mitigation map

| Threat | Relevant systems | Required mitigation before release |
| --- | --- | --- |
| Account takeover | auth, admin | managed/maintained identity, secure sessions, verification/recovery hardening, MFA/step-up, rate limits, alerts |
| Broken authorization / IDOR | profiles, orders, projects, admin | server authorization per object/action, scoped permissions, ownership tests, opaque references |
| CSRF | cookie-authenticated mutations | framework-appropriate origin/token defenses, same-site cookies, mutation-only methods |
| XSS / unsafe embeds | profiles, media, map labels, admin | output encoding, no arbitrary HTML, URL/embed allowlists, CSP, safe rich-content model |
| SQL/command injection | repositories, jobs | Prisma parameterization, constrained queries, validation, no command construction from user input |
| Malicious uploads | Custom Shop/media | private quarantine, signature/type/size checks, malware scan, isolated serving, retention |
| Payment/webhook forgery | commerce | provider signature verification, environment/account checks, idempotency, replay window, reconciliation |
| Replay/race/duplicate effects | checkout, webhooks, publishing | unique idempotency keys, transactions, state invariants, event deduplication |
| PII leakage | accounts, orders, projects | data classification, explicit DTO allowlists, redaction, least privilege, safe logs/exports |
| Precise-location leakage | FAFO World | independent opt-in consent, city-level coordinates, no address joins, immediate unpublish |
| Admin privilege abuse | Operations Center | scoped roles, separation of duties, step-up, immutable audit, alerts and periodic review |
| Abuse/spam | registration, profiles, community, forms | layered rate limits, bot friction, verification, moderation/reporting, quotas |
| Content/impersonation harm | callsigns, media, community | naming policy, provenance, rights review, reporting, moderation, appeal/removal |
| Supply-chain compromise | build/dependencies | lockfile, reviewed updates, CI, dependency/security review; no blind auto-remediation |

## Phase mapping

- **Foundation:** data classification, security headers/CSP design, environment separation, authentication and authorization policy, audit event schema.
- **First dynamic slice:** validation, repository boundaries, CSRF/rate limits, negative authorization tests, safe logging, error handling.
- **Uploads/commerce:** quarantine/scanning, webhook verification/idempotency, reconciliation, provider key rotation and incident runbooks.
- **Administration/community:** step-up, least privilege, access auditing, moderation/appeal, anomaly alerting and role review.
- **Production readiness:** independent security/privacy review, secret and dependency scanning decisions, backup/recovery test, incident response and deletion/retention validation.

# Staged testing strategy

## Current dependency-free layer

Current checks are appropriate for compilation and static route integrity:

- ESLint for code rules (currently two accepted image warnings)
- strict TypeScript type checking
- deterministic Node route/link inventory, exact intentional blockers, and stale-exception detection
- Next.js production build/static generation
- `git diff --check`
- manual in-app browser review at representative widths

They do not prove interactions, rendered accessibility, visual fidelity, server behavior, authentication, or business correctness.

## Recommended stages

1. **Now:** keep `npm run verify` as the required baseline; add focused dependency-free assertions to `scripts/check-routes.mjs` only when robust and directly valuable.
2. **Component layer:** after owner approval of a test package, test Header keyboard/menu state, status-page semantics, error/not-found paths, and map data-to-popup rendering.
3. **Server/domain layer:** use unit tests for authorization policies, DTO allowlists, state machines, price calculations, consent/publication invariants, and content validation.
4. **Database integration:** run isolated disposable PostgreSQL tests for constraints, migrations, transactions, ownership, deletion, idempotency, and repository behavior. Never point tests at production.
5. **Authentication:** verify session lifecycle, email enumeration resistance, recovery, CSRF, OAuth linking, role boundaries, revoked/suspended users, and step-up.
6. **Commerce/webhooks:** contract fixtures, signature/replay/idempotency, duplicate/out-of-order events, amount/currency mismatch, partial refunds, provider outage, and reconciliation.
7. **Admin:** permission matrix tests for every view/action, direct URL/object substitution, audit completeness, redaction, and separation of duties.
8. **Accessibility:** automated rules plus keyboard, focus, screen reader, zoom/reflow, reduced motion, contrast, and media alternatives. Automation is supplementary.
9. **End to end:** high-value workflows in isolated preview environments: join/profile privacy, public deployment publish/revoke, guest cart/checkout failure paths, order/fulfillment exceptions, Custom Shop intake/upload, media publish/unpublish.

## Future tooling decisions

No package is installed or selected by this document. Before dynamic work, choose a maintained unit/integration runner compatible with Next/TypeScript. Add a browser E2E tool when interactive flows begin, and an accessibility integration when rendered DOM exists in CI. Selection criteria: Next.js 16 compatibility, Windows/local and Linux CI parity, deterministic isolation, active maintenance, low configuration burden, and useful diagnostics.

# Performance and delivery audit

## Current strengths

- All 51 authored routes are statically generated.
- Most public routes are Server Components with a Header client island.
- FAFO World is isolated as a client map component.
- Layouts use responsive sizing and constrained content widths.
- Browser checks at 320, 375, 768, 1024, and 1440 pixels found no inspected horizontal overflow.
- Reduced-motion handling exists in the branded entry experience.

## Risks and measurement needs

- `app/page.tsx` is a client component and hosts the entry/loading experience, so homepage JavaScript, asset timing, and Core Web Vitals require measured browser/profile testing.
- `app/Header.tsx` ships interactive state and the complete navigation tree to every public route. This is reasonable now but should be measured as the tree grows; future data-driven navigation must preserve accessibility and deterministic route checking.
- MapLibre is a substantial client dependency and its CSS is imported globally from `app/layout.tsx`; the JavaScript is route-local, but bundle/CSS impact should be measured before optimizing.
- FAFO World depends on `https://demotiles.maplibre.org/style.json`; production availability, licensing/usage, privacy, CSP, and performance are owner decisions.
- `app/LoadingScreen.tsx` intentionally retains two raw `<img>` elements because changing them cannot yet guarantee identical timing and layout. Status: **PRESERVED — VISUAL REGRESSION RISK**.
- Source/served raster assets include multi-megabyte hero, crest, logo, and entry images. Do not destructively modify them; define approved web derivatives and responsive delivery in the creative pipeline.
- `next/font/google` provides local build-time font optimization but may require network availability on a fresh build. Confirm CI behavior and consider an approved local-font strategy only if reliability or privacy requirements demand it.
- Popup marker creation is currently small and linear. Add clustering/virtualization only after dataset growth and measurement.
- No real-user monitoring, Lighthouse budget, bundle budget, or production Core Web Vitals baseline exists.

## Safe outcome this shift

No performance-specific code was changed. The only responsive correction reduced the smallest breakpoint heading size in the shared status-page hero after a 320-pixel browser check showed an undesirable long-word wrap. Asset, homepage, Header, map-loading, and font changes require measurement or visual review and were documented instead.

# Repository hygiene audit

## Confirmed safeguards

- `.next`, `node_modules`, build output, environment files, logs, coverage, and Vercel local state are ignored.
- The npm lockfile is tracked.
- CI is verification-only with `contents: read`.
- No TODO/FIXME/HACK/XXX markers were found in the inspected active source/documentation paths.
- No untracked temporary file was present at the audit gate.

## Preserved items requiring future review

- Root `index.html`, `css/style.css`, and `css/animations.css` are legacy material outside the active App Router. They were not deleted because provenance and external use are not established.
- Create Next App SVGs (`public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) remain tracked but are not referenced by current inspected app source. Deletion needs a separately approved hygiene change.
- `.gitkeep`/`.bitkeep` files remain in scaffold and asset directories, including `app/api/`, even where directories now contain files. They are harmless and were not deleted.
- The Heritage Crest exists in both source `assets/` and served `public/assets/` locations; this may be intentional source/delivery separation. Do not deduplicate without an asset-ownership policy.
- `lib.gitkeep` at repository root and `lib/.gitkeep` both exist; ownership is unclear, so both were preserved.
- `next-env.d.ts` is ignored but tracked. This is common in Next.js projects but the ignore/tracking mismatch should be reviewed deliberately rather than mechanically changed.
- Header navigation definitions are centralized but large and embedded in a client component. Restructuring remains deferred.

## Dependency observation

The installed top-level versions at audit time were Next.js 16.2.9, React/React DOM 19.2.4, Prisma/Prisma Client 6.19.2, MapLibre GL 5.24.0 (allowed by `^5.6.1`), and Tailwind CSS 4.3.2 (allowed by `^4`). Nine previously reported npm audit findings remain acknowledged and were not automatically remediated. A separate approved security/dependency review should assess advisories, lockfile resolution, compatibility, and upgrade risk.
