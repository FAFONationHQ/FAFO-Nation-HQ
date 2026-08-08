# Shift #3 Ready Queue

This queue starts from the verified Shift #2 static baseline. It does not assume owner decisions are approved. Complexity is relative: XS, S, M, L, XL.

## READY WITHOUT OWNER DECISION

These packages remain read-only, documentation, or low-risk public-layer work unless separately approved for implementation.

### R1. Formal public-route audit report generator — M

- Build a deterministic development-only script that reports route source, metadata declaration/re-export, shared status-page use, H1/Header ownership, and exact static links.
- Use built-in Node only; do not turn regex into a TypeScript parser.
- **Verify:** known fixtures/edge cases, `npm run check:routes`, lint, types, build, diff check.

### R2. Route-checker regression fixtures — S

- Extract pure route/link validation functions or add fixture inputs so exact blocker, stale blocker, alias, and broken-link cases can be tested deterministically without new dependencies.
- **Verify:** fixture script exits correctly for pass/fail cases; full verify.

### R3. Header accessibility and behavior audit — M

- Perform keyboard/focus testing for desktop and mobile menus, document findings, and fix only objective defects without restructuring navigation.
- **Verify:** keyboard Escape/outside close/tab behavior at mobile/desktop, lint, types, build, route check.

### R4. Error/not-found browser QA — S

- Exercise route error and not-found presentations at representative widths and with keyboard/screen-reader landmarks; correct only scoped defects.
- **Verify:** forced local error path where safe, unknown route, viewport matrix, full verify.

### R5. Public-page visual QA handoff — S

- Produce representative screenshots/checklist for owner review without changing artwork or approved layouts.
- **Verify:** 320/375/768/1024/1440, no overflow, headings/landmarks, no console errors.

### R6. Asset delivery inventory — M

- Extend the visual queue with referenced/unreferenced status, served path, file dimensions/weight, derivative recommendations, and rights/provenance fields. Do not edit assets.
- **Verify:** paths exist, inventory counts reconcile, documentation diff check.

### R7. LoadingScreen measurement plan — S

- Specify exact browser assertions and capture protocol needed to safely evaluate replacing the two raw images later; do not change the component.
- **Verify:** plan covers asset, timing, dimensions, placement, animation, audio, interaction, and layout shift.

### R8. Legacy/hygiene disposition brief — XS

- Establish provenance questions for root static HTML/CSS, unused Create Next App SVGs, keep files, duplicate crest, and tracked `next-env.d.ts`. Do not delete anything.
- **Verify:** `git ls-files`, reference scan, owner decision list.

### R9. Content-fact owner worksheet — M

- Convert unresolved public content needs into a fillable owner worksheet for Media, Community, Store, Custom Shop, and blocked FAFO Cares routes. Do not invent facts.
- **Verify:** every requested fact maps to a route and avoids claims of current functionality.

### R10. Security/dependency review plan — S

- Capture the nine acknowledged audit findings without remediation, identify direct/transitive ownership, and propose an isolated review/upgrade test matrix.
- **Verify:** read-only audit output, exact installed versions, no package or lockfile change.

## READY AFTER OWNER DECISION

### D1. Canonical SEO metadata routes — S

- **Needs:** approved production HTTPS origin.
- Add correct `robots.ts`, `sitemap.ts`, and canonical strategy using the configured origin.
- **Verify:** all public/blocked route inclusion policy, generated output, lint, types, build, route check.

### D2. Approved web-image derivatives and delivery — L

- **Needs:** selected queue items, approved source masters/crops and artwork authority.
- Create non-destructive web derivatives and integrate only approved placements.
- **Verify:** visual comparison, responsive crops, alt text, dimensions/weight, Core Web Vitals-oriented browser checks, full verify.

### D3. Production map provider configuration — M

- **Needs:** approved style/tile provider, usage/privacy/license and environment policy.
- Move style configuration to an approved public environment boundary with safe failure UX.
- **Verify:** no secret in client/source, CSP plan, loading/failure/keyboard tests, full verify.

### D4. Authentication proof of concept — XL

- **Needs:** decisions 2–10 and an approved dependency/vendor/security package.
- Implement in an isolated non-production environment with one sign-in method, secure session, verification, private dashboard shell, and authorization tests.
- **Verify:** abuse/recovery/session/CSRF tests, no enumeration, privacy defaults, lint/types/build/E2E/security review.

### D5. V1 Prisma schema and first migration package — XL

- **Needs:** approved identity, role, privacy, data classification, retention, environments, and migration ownership.
- Draft/review schema first; generate migration only under new explicit authorization and only against isolated development/test infrastructure.
- **Verify:** migration up/down/forward strategy, constraint and repository tests, data review, no production connection.

### D6. PublicDeployment read repository — L

- **Needs:** approved schema/migration, provenance/consent/publication rules, test database tooling.
- Implement server-only repository and allowlisted public DTO with static UI preserved.
- **Verify:** forbidden-field contract tests, publication/consent cases, static fallback/cutover plan, full verify.

### D7. Media content vertical slice — XL

- **Needs:** approved taxonomy, rights, first content type, editor/publisher roles, test tooling.
- Implement one content type from draft through public rendering; do not build the entire CMS.
- **Verify:** authorization, validation, safe links/embeds, metadata, schedule/cache behavior, accessibility, E2E.

### D8. Catalog read-only vertical slice — XL

- **Needs:** markets/currencies, product source, pricing/inventory policy, schema/migrations.
- Implement published catalog/variant reads without cart or checkout.
- **Verify:** server price source, unpublished filtering, currency snapshots, metadata/accessibility, repository and E2E tests.

### D9. Custom Shop inquiry-only slice — L

- **Needs:** identity requirement, approved intake fields/content policy and communication ownership.
- Implement only the approved non-upload intake boundary; uploads remain blocked unless separately authorized.
- **Verify:** validation, spam/rate-limit, authorization/ownership, privacy, no broken availability claims, E2E.

## BLOCKED BY ARCHITECTURE/DEPENDENCY

### B1. Member profiles and public deployment opt-in — XL

- Blocked by authentication, privacy/consent schema, callsign/moderation, and coarse-location policy.
- **Future verify:** ownership/authorization, default-private state, consent grant/revoke, DTO privacy, deletion/export, E2E.

### B2. Database-backed FAFO World cutover — L

- Blocked by PublicDeployment schema/repository, consent/publication workflow, caching policy, and admin approval.
- **Future verify:** parity with current visuals/data, cache invalidation on revoke, zero private fields, map/list consistency.

### B3. Cart and guest ownership — L

- Blocked by catalog/variants, market/currency and cart lifecycle policy.
- **Future verify:** token security, merge/expiry, server repricing, quantity/availability, concurrency.

### B4. Checkout and payment providers — XL

- Blocked by catalog/cart, provider/business decisions, terms/tax/shipping/refund policies, secrets/environment handling.
- **Future verify:** amount/currency authority, webhook signatures/idempotency/replay, failure/reconciliation, provider sandbox E2E.

### B5. Fulfillment adapters and tracking — XL

- Blocked by order ledger, provider selection/mappings, operational exception policy.
- **Future verify:** idempotent submission, duplicate/out-of-order events, cancellation limits, tracking normalization, operator alerts.

### B6. Secure Custom Shop uploads/quotes/production — XL

- Blocked by accounts, schema, object storage, malware scanning, retention/IP/financial policy, admin roles.
- **Future verify:** quarantine/isolation, scan failures, object authorization, state machine, quote versions/approval, retention.

### B7. Community activity, ranks, recognition, events, and giveaways — XL

- Blocked by member identity/privacy, moderation, eligibility, provenance, program rules, and content ownership.
- **Future verify:** authorization, abuse/moderation, truthful availability, privacy, accessibility, program-specific legal review.

### B8. Operations & Alerts Center — XL

- Blocked by authentication, typed permissions, step-up, audit model, and each managed domain.
- **Future verify:** complete permission matrix, direct-object attacks, field redaction, separation of duties, audit/alert evidence.

### B9. Ten FAFO Cares subroutes — XL / owner-content blocked

- Keep the exact routes listed in `docs/architecture.md` unimplemented until approved resources, operational ownership, jurisdiction, review, and safety content exist.
- **Future verify:** specialist/content review, link/resource validation, accessibility, emergency-language and availability accuracy, exact route-checker exception removal.

## Suggested 2× execution order

Primary queue: R1–R8, checkpointing verified batches. Reserve queue: R9–R10 plus owner-approved D packages only if their prerequisites and explicit change authorization are present. Otherwise deepen specifications and test fixtures; do not begin B packages merely to consume time.
