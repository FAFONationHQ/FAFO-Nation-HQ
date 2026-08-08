# Owner Decision Register

Highest-priority decisions appear first. “Default” is a recommendation, not authorization.

## BLOCKING NEXT IMPLEMENTATION

### 1. What is the first dynamic vertical slice?

- **Why:** determines schema, tests, and security work.
- **Affects:** accounts, FAFO World, commerce, media, Custom Shop.
- **Default:** identity/privacy foundation, then a read-only public-deployment repository.
- **Alternatives:** catalog first; media publishing first.
- **If deferred:** dynamic implementation should not begin.

### 2. Managed or self-managed authentication?

- **Why:** changes credential risk, schema, sessions, recovery, cost, and operations.
- **Affects:** `/join`, accounts, profiles, admin, all private workflows.
- **Default:** managed standards-based identity; application owns profile/consent data.
- **Alternatives:** maintained self-managed library; custom credentials (not recommended).
- **If deferred:** no accounts or protected administration.

### 3. Which V1 sign-in methods?

- **Why:** changes verification, recovery, account linking, copy, and testing.
- **Affects:** registration/login/recovery and account support.
- **Default:** one verified email method first; add OAuth only when selected.
- **Alternatives:** email/password; email link/code; selected OAuth; staged combination.
- **If deferred:** authentication UX and schema remain unsettled.

### 4. What are V1 roles and grant rules?

- **Why:** a string `User.role` is not sufficient authorization.
- **Affects:** every admin, publishing, support, commerce, and moderation action.
- **Default:** scoped least-privilege permissions; audited grants; separate publishing/financial authority.
- **Alternatives:** smaller role set with strict server mapping.
- **If deferred:** protected operational work is blocked.

### 5. Is public identity/location always opt-in?

- **Why:** public profiles and map locations create privacy risk.
- **Affects:** member profiles, `/fafo-world`, `/recently-deployed`.
- **Default:** unpublished by default; separate revocable consent; city-level only.
- **Alternatives:** profiles without locations; owner-curated deployments only.
- **If deferred:** member publishing and database-backed map must wait.

### 6. What data environments and migration ownership apply?

- **Why:** prevents preview/test access to production and unsafe schema rollout.
- **Affects:** Prisma, CI, previews, all dynamic systems.
- **Default:** isolated local/test/preview/production databases; reviewed forward/rollback procedure.
- **Alternatives:** owner-approved reduced environment model with equivalent isolation.
- **If deferred:** do not create migrations or connect app features.

## SECURITY/PRIVACY

### 7. What deletion, export, and retention policy applies?

- **Why:** profiles, transactions, uploads, consent, and audits have conflicting lifecycles.
- **Affects:** accounts, commerce, Custom Shop, moderation, operations.
- **Default:** delete/anonymize optional profile data; retain only required transaction/security records under written schedules.
- **Alternatives:** jurisdiction-specific schedules after legal review.
- **If deferred:** schema and workflows risk costly redesign.

### 8. What age eligibility and consent rules apply?

- **Why:** accounts, community, uploads, and public profiles may involve minors.
- **Affects:** join/member/community/Custom Shop.
- **Default:** do not launch until eligibility and handling are explicitly approved.
- **Alternatives:** adult-only launch; verified guardian process after review.
- **If deferred:** public account creation remains blocked.

### 9. What operator MFA/step-up standard is required?

- **Why:** role, refund, publishing, and private-data actions are high impact.
- **Affects:** Operations Center and identity provider selection.
- **Default:** phishing-resistant option where supported; recent step-up for high-risk actions.
- **Alternatives:** TOTP/recovery-code baseline with upgrade path.
- **If deferred:** high-risk admin actions should not launch.

### 10. What callsign/moderation policy applies?

- **Why:** uniqueness, impersonation, abuse, renames, suspension, and appeals need rules.
- **Affects:** profiles, community, public recognition.
- **Default:** normalized unique callsigns, reserved terms, report/review/appeal, limited audited renames.
- **Alternatives:** non-unique display names plus separate handles.
- **If deferred:** public callsigns remain unavailable.

### 11. What upload/storage policy applies?

- **Why:** user files introduce malware, privacy, IP, cost, and retention risks.
- **Affects:** Custom Shop and future Media submissions.
- **Default:** private regional storage, quarantined signed uploads, strict limits, malware scan, expiry.
- **Alternatives:** no uploads in V1; approved third-party intake.
- **If deferred:** submission/upload functionality remains blocked.

## BUSINESS POLICY

### 12. Which commerce markets and currencies launch first?

- **Why:** determines pricing, tax, duties, shipping, terms, and refunds.
- **Affects:** `/store`, catalog, cart, checkout, fulfillment.
- **Default:** explicitly limited launch markets with approved per-currency prices.
- **Alternatives:** single-country/single-currency pilot; broader reviewed rollout.
- **If deferred:** native checkout cannot be truthfully activated.

### 13. Which payment and fulfillment providers, and which source of truth?

- **Why:** changes adapters, webhooks, reconciliation, credentials, and operations.
- **Affects:** checkout, orders, Printify/Printful, tracking.
- **Default:** application order ledger; one payment and one fulfillment path first.
- **Alternatives:** staged second provider; manual fulfillment path.
- **If deferred:** provider integration and order schema remain provisional.

### 14. What returns, refunds, cancellations, fraud, and shipping-exception policies apply?

- **Why:** state machines and customer copy must reflect real obligations.
- **Affects:** store, checkout, account orders, Operations Center.
- **Default:** written rules before checkout; audited exceptions and partial-refund handling.
- **Alternatives:** market/product-specific policies.
- **If deferred:** transactional launch is blocked.

### 15. What Custom Shop commercial and content policy applies?

- **Why:** intake, quotes, IP, revisions, deposits, cancellation, and production need rules.
- **Affects:** `/custom-shop/*`, uploads, quotes, gallery.
- **Default:** authenticated intake, approved categories, versioned quotes/approvals, separate gallery consent.
- **Alternatives:** inquiry-only V1; no-upload intake.
- **If deferred:** keep current informational pages only.

### 16. What makes a deployment “verified” and publishable?

- **Why:** current labels use “verified”; future data needs defensible provenance.
- **Affects:** FAFO World and Recently Deployed.
- **Default:** documented source, city-level location, approved label, reviewer, and consent where applicable.
- **Alternatives:** owner-curated records only; remove verification claim in a separately approved copy change.
- **If deferred:** do not automate deployment publication.

## CONTENT REQUIRED

### 17. Who owns Media rights and publishing review?

- **Why:** artists, stories, embeds, images, and attribution require permission.
- **Affects:** all `/media/*` routes and homepage placements.
- **Default:** manual curation with recorded rights/attribution and explicit publisher role.
- **Alternatives:** link-only editorial model; narrower first content type.
- **If deferred:** Media remains informational/status content.

### 18. What approved FAFO Cares content and operating model exists?

- **Why:** sensitive assistance/crisis/charity claims cannot be invented.
- **Affects:** the ten intentional blocker routes and Store Cares claims.
- **Default:** keep all ten blocked until approved resources, ownership, review, jurisdiction, and emergency disclaimers exist.
- **Alternatives:** narrower approved informational scope after specialist review.
- **If deferred:** blockers remain correct.

### 19. What public profile, recognition, and veteran/service-verification facts may be shown?

- **Why:** identity, consent, safety, and sensitive status require careful provenance.
- **Affects:** Community, spotlights, recognition, deployed members.
- **Default:** explicit opt-in, minimum public data, documented verification meaning, correction/removal.
- **Alternatives:** owner-curated non-profile content first.
- **If deferred:** operational Community features wait.

## VISUAL QA

### 20. Is the Shift #2 responsive public-page baseline approved?

- **Why:** code/browser checks cannot replace brand-owner visual approval.
- **Affects:** shared status pages across Community, Media, Store, and Custom Shop.
- **Default:** review representative 320px, mobile, tablet, and desktop captures before release.
- **Alternatives:** approve current baseline; request scoped follow-up.
- **If deferred:** code is verified, but production visual acceptance remains open.

### 21. Which P0/P1 visual assets enter creative production?

- **Why:** several landing pages need purpose-built imagery and mobile crops.
- **Affects:** routes listed in `docs/website-visual-asset-queue.md`.
- **Default:** approve the three P0 requirements first, then P1 in route-impact order.
- **Alternatives:** remaster existing candidates; intentionally retain no-image designs.
- **If deferred:** layouts remain functional but visually incomplete where documented.

## IMPORTANT BUT NOT BLOCKING

### 22. Should a canonical hostname be configured for sitemap/robots/canonical metadata?

- **Why:** absolute sitemap and canonical URLs must not be guessed.
- **Affects:** global SEO and deployment configuration.
- **Default:** provide one production HTTPS origin through approved configuration, then generate static metadata routes.
- **Alternatives:** omit until domain is final.
- **If deferred:** current route metadata remains valid; sitemap/canonicals remain absent.

### 23. What production map style/tile service is approved?

- **Why:** current demo tiles carry availability, privacy, licensing, CSP, and performance risk.
- **Affects:** `/fafo-world`.
- **Default:** approve a production-suitable service/style and usage policy before launch.
- **Alternatives:** self-hosted/managed provider; retain demo only for non-production testing if terms allow.
- **If deferred:** production readiness of the map remains unresolved.

### 24. Which future test and accessibility tools are approved?

- **Why:** dynamic and interactive systems exceed current compile/static checks.
- **Affects:** CI and every future implementation.
- **Default:** select maintained unit/integration and browser E2E tooling before the first dynamic slice.
- **Alternatives:** staged selection aligned to the first feature.
- **If deferred:** specifications can proceed; dynamic release confidence cannot.

## FUTURE

### 25. What observability, incident, backup, and recovery targets apply?

- **Why:** transactional/private systems need detection and recovery objectives.
- **Affects:** database, auth, payments, fulfillment, admin, publishing.
- **Default:** define alert ownership, retention, backup/restore tests, RPO/RTO, incident and key-rotation runbooks before production data.
- **Alternatives:** staged service-level targets by system criticality.
- **If deferred:** do not call dynamic systems production-ready.
