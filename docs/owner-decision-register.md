# Owner Decision Register

All 25 decisions from the platform-readiness review were resolved by the owner before Day Shift #3. This register records the approved policy and distinguishes it from details that remain deliberately deferred. “Approved” authorizes provider-independent foundations; it does not authorize external services, production access, credentials, dependencies, database work, deployment, or artwork changes.

## Identity and authentication

### 1. What is the first dynamic vertical slice?

**Status: APPROVED.** Begin with the member identity/privacy foundation. Follow with database-backed FAFO World when its dependencies are approved and available.

### 2. Managed or self-managed authentication?

**Status: APPROVED WITH CONDITIONS.** Use managed authentication. FAFO owns application profiles, preferences, and consent. Do not build password cryptography from scratch. Provider selection and installation remain a deferred implementation detail.

### 3. Which V1 sign-in methods?

**Status: APPROVED WITH CONDITIONS.** Target verified email/password for V1. OAuth may be added later. No authentication provider or working sign-in is authorized by this decision alone.

### 4. What are V1 roles and grant rules?

**Status: APPROVED.** Use least-privilege, auditable authorization. Publishing, financial, moderation, and other sensitive authorities must be separable. Any owner/operator role aggregates explicit permissions instead of bypassing authorization checks.

### 5. Is public identity/location always opt-in?

**Status: APPROVED.** Member identity is private by default. Public participation is opt-in. Public location requires separate, revocable, purpose-specific consent and is limited to city-level geography. Member association with a deployment requires its own opt-in.

### 6. What data environments and migration ownership apply?

**Status: APPROVED WITH CONDITIONS.** Local, test, preview, and production data environments must be isolated. Migration execution and environment access remain deferred implementation details requiring an approved operational procedure.

## Security and privacy

### 7. What deletion, export, and retention policy applies?

**Status: APPROVED WITH CONDITIONS.** Architecture must support account deletion, export, and policy-driven retention. Retention schedules must be configurable and must not encode arbitrary legal assumptions. Final jurisdiction-specific schedules remain a pre-launch policy task.

### 8. What age eligibility and consent rules apply?

**Status: APPROVED.** V1 member accounts are limited to people aged 18 or older.

### 9. What operator MFA/step-up standard is required?

**Status: APPROVED WITH CONDITIONS.** Privileged/operator accounts require MFA when authentication reaches production. High-risk actions must support recent or step-up authentication. Exact mechanisms depend on provider selection.

### 10. What callsign/moderation policy applies?

**Status: APPROVED.** Callsigns are normalized and unique; display name is separate and optional. Reserved/protected terms, audited renames, moderation, and correction mechanisms are required. Persistence remains responsible for authoritative uniqueness enforcement.

### 11. What upload/storage policy applies?

**Status: DEFERRED IMPLEMENTATION DETAIL.** The secure target is private/quarantined storage with controlled access, validation, scanning, and retention. Arbitrary member uploads remain deferred until the Custom Shop requires them.

## Commerce and business policy

### 12. Which commerce markets and currencies launch first?

**Status: APPROVED.** Native V1 commerce targets Canada and the United States, supporting CAD and USD. Domain architecture should remain internationally extensible.

### 13. Which payment and fulfillment providers, and which source of truth?

**Status: APPROVED WITH CONDITIONS.** FAFO’s internal order ledger is the source of truth. Payment staging order is Stripe then PayPal; fulfillment staging order is Printify then Printful. Integrations must sit behind provider abstractions. Provider access, credentials, and installation remain separately gated.

### 14. What returns, refunds, cancellations, fraud, and shipping-exception policies apply?

**Status: PRE-LAUNCH CONTENT GATE.** Order, refund, cancellation, and exception architecture may proceed independently. Final customer-facing policy wording must be approved before transactional launch.

### 15. What Custom Shop commercial and content policy applies?

**Status: APPROVED WITH CONDITIONS.** Custom Shop is guest-first; initial inquiry must not require an account. Member association may be optional later. Versioned quotes and approval records are appropriate. Secure uploads remain deferred. Gallery/publication consent is separate and opt-in. Commercial terms remain a pre-launch content gate.

### 16. What makes a deployment “verified” and publishable?

**Status: APPROVED WITH CONDITIONS.** Verification requires internal evidence plus authorized operator approval. Public deployment data is sanitized and city-level. Member/callsign association requires separate consent. Exact evidence standards and operating procedure remain a pre-launch policy task.

## Content and publishing

### 17. Who owns Media rights and publishing review?

**Status: APPROVED.** Media is manually curated, permission/rights-aware, and attribution-aware. Publishing authority is controlled. New releases do not automatically replace curated FAFO selections.

### 18. What approved FAFO Cares content and operating model exists?

**Status: PRE-LAUNCH CONTENT GATE.** The ten sensitive FAFO Cares routes remain intentionally blocked pending a dedicated operating/content package with approved resources, ownership, review, jurisdiction, and appropriate emergency language.

### 19. What public profile, recognition, and veteran/service-verification facts may be shown?

**Status: APPROVED WITH CONDITIONS.** Public profiles are opt-in and minimal. Military, veteran, or service status must never be inferred or automatically exposed. Any future verified-service label requires explicit standards, provenance, and consent.

## Visual and brand governance

### 20. Is the Shift #2 responsive public-page baseline approved?

**Status: APPROVED WITH CONDITIONS.** The responsive implementation is the technical baseline. Final visual and brand acceptance remains with the owner.

### 21. Which P0/P1 visual assets enter creative production?

**Status: DEFERRED IMPLEMENTATION DETAIL.** Website artwork remains owner/creative controlled. Engineering may integrate only approved artwork and must not autonomously generate, replace, rename, or delete it.

## Infrastructure and production readiness

### 22. What is the canonical production origin?

**Status: APPROVED.** The canonical origin is `https://fafonationhq.com`. This permits static canonical/SEO infrastructure but does not authorize deployment, DNS, hosting, or production configuration changes.

### 23. What production map style/tile architecture is approved?

**Status: APPROVED WITH DEFERRED IMPLEMENTATION DETAIL.** Retain MapLibre. Self-hosted production map infrastructure is preferred where practical to reduce recurring provider cost. Tile, style, storage, CDN, cache, update, and licensing architecture requires a technical/cost evaluation before implementation.

### 24. Which future test and accessibility tools are approved?

**Status: APPROVED WITH DEFERRED IMPLEMENTATION DETAIL.** Unit/integration, browser E2E, and accessibility automation are required. Tool selection remains subject to an approval package; no new testing dependency is authorized during Day Shift #3.

### 25. What observability, incident, backup, and recovery targets apply?

**Status: APPROVED WITH CONDITIONS.** Monitoring, alerts, backups, tested restoration, incident response, auditability, and key rotation are production-readiness requirements. Recovery objectives, ownership, retention, and service-specific procedures remain deferred implementation details and pre-launch gates.

## Current implementation boundary

These decisions authorize pure domain contracts, safe local verification, static SEO, and implementation-ready proposals. They do not authorize real authentication, database connections or migrations, payment/fulfillment integrations, uploads, production map infrastructure, external provider calls, deployment, secrets, `.env` changes, dependency changes, or FAFO Cares content.
