# Media Architecture and Operations & Alerts Center

These specifications describe future systems. Current Media routes are static informational/status pages, and no administrative functionality exists.

# Media architecture

## One publishing core, typed presentations

Use a shared `ContentItem` publishing lifecycle with controlled content types for video, live stream, scheduled countdown, game night, interview, veteran story, behind-the-scenes entry, podcast, gallery item, news item, featured-artist feature, and content-wall entry. Each public route can have a purpose-built presentation without creating unrelated publishing systems.

Common fields should include stable ID, type, slug, title, summary, structured/body content, publication state, publish/unpublish times, author/owner, rights state, canonical/external links, attribution, cover asset reference, active/featured/homepage flags where applicable, sort order, and audit timestamps.

Type-specific records or validated payloads should hold fields such as video/embed provider, stream schedule/time zone, episode duration, gallery media, event time, or creator association. Avoid a single unvalidated JSON field as the only schema.

## Publication lifecycle

Recommended states: `DRAFT`, `IN_REVIEW`, `SCHEDULED`, `PUBLISHED`, `UNPUBLISHED`, `ARCHIVED`, and `REJECTED`. Publishing requires required fields, approved rights/permission status, safe links/embeds, reviewed attribution, and an authorized actor. Scheduled content needs explicit time zone and behavior after an event ends.

## Per-route considerations

- **FAFO Media:** curated landing placements, not an unbounded latest-content feed.
- **Videos:** approved provider/embed or owned media metadata, captions/transcript status, duration, thumbnail rights.
- **Live Streams:** platform/channel, scheduled start/end, time zone, live/offline state, fallback link; never infer availability without a trusted source.
- **Countdown:** server-derived target time and client display; accessible non-animated time text and expired-state behavior.
- **Game Nights:** event status, platform, participation policy, schedule, moderation/contact details only when approved.
- **Interviews / Veteran Stories:** subject consent, sensitive-content review, attribution, correction/removal path.
- **Behind the Scenes:** asset rights and privacy review for people/locations/work in progress.
- **Podcasts:** episode metadata, external platforms, transcript status, explicit enclosure strategy only if owned.
- **Gallery:** asset derivatives, alt text, rights, ordering, and optional collection/caption.
- **News:** author, publish/update dates, correction history, canonical slug, structured metadata.
- **Featured Artist:** manually curated feature record with approved artist/creator and selected works/links.
- **Content Wall:** allowlisted external accounts/items, source attribution, moderation and removal; avoid automatically ingesting arbitrary third-party markup.

## Artist/creator and SEO template

An `ArtistCreator` record should hold approved display identity, biography, image/alt text, attribution, external links, permission status, and publication state. A feature associates intentionally selected content and placement.

The reusable public template should supply route metadata, one H1, creator name, approved description, selected/featured work, attribution, rights-safe image, manually curated external links, published/updated dates, and optional structured data only when facts are known. Do not fabricate relationships or copy. `Active`, `Featured`, `Homepage`, effective dates, and `Sort Order` should be explicit editorial controls. Automatic “latest release” replacement is not recommended because it can publish unreviewed or incorrectly licensed material.

## External content safety

- Allowlist embed providers and URL protocols/hosts.
- Prefer provider SDK-free embeds or links where possible; review privacy/cookie impact.
- Never store/render arbitrary iframe or HTML input.
- Apply server-side validation and output escaping.
- Record permission/rights evidence and takedown contact/process.
- Treat transcripts, captions, alt text, and content warnings as publication requirements where applicable.

## Media implementation phases

1. Approve content taxonomy, rights, moderation, retention, correction, and publishing roles.
2. Approve schema and safe rich-content/link/embed representation.
3. Implement server repository and public DTOs with tests.
4. Implement one content type and editorial workflow end to end in a non-production environment.
5. Add route templates, previews, scheduled publishing, cache invalidation, and accessible media requirements.
6. Expand types only after the shared lifecycle is proven.

# Operations & Alerts Center

## Principle

The Center should be a server-authorized, read-only-first operational workspace. It is not a single all-powerful admin role. Each module should expose only the minimum data and actions required, with strong auditability and step-up authentication for high-risk changes.

## Modules

| Module | Initial capabilities | Required foundation |
| --- | --- | --- |
| Member/account review | status, verification/moderation signals, privacy-safe support view | auth, scoped roles, member schema, policy |
| Public deployments | pending review, consent/publication validation, publish/unpublish | data model, consent, map repository, audit |
| Catalog operations | products/variants/collections, publication and mapping validation | catalog schema, commerce roles |
| Order monitoring | payment/fulfillment timeline, mismatches, exceptions | order ledger, provider adapters/webhooks |
| Fulfillment exceptions | failed submission, provider status, tracking problems | fulfillment abstraction, operator policy |
| Custom Shop | intake, assignment, quote/asset/status queues | accounts, project schema, secure uploads |
| Media publishing | drafts, review, schedule, rights and placement | content model, publishing roles |
| FAFO Cares review | approved content only, elevated policy gates | owner/legal/operational policy; remains blocked |
| Moderation | reports, evidence-minimized review, actions/appeals | community policy, roles, retention |
| System alerts | failed webhooks/jobs, stale approvals, security/health signals | event model, observability, runbooks |
| Audit events | filtered immutable activity and export controls | cross-system audit model |

## Permission boundaries

Suggested scoped permissions include `member.read`, `member.moderate`, `deployment.review`, `deployment.publish`, `catalog.edit`, `catalog.publish`, `order.read`, `fulfillment.retry`, `refund.propose`, `refund.execute`, `custom.intake`, `custom.quote`, `media.edit`, `media.publish`, `cares.review`, `role.manage`, and `audit.read`. Assign permissions to roles rather than hard-coding broad role-name checks.

Separate:

- content editing from publishing;
- order support from payment/refund authority;
- refund proposal from execution where staffing allows;
- project creative access from customer/payment data;
- role administration from ordinary operations;
- security/audit access from content operations.

High-risk actions require recent/step-up authentication, explicit confirmation, reason, immutable audit event, and ideally dual approval for role grants or exceptional financial actions.

## Alerts model

An alert needs source, category, severity, deduplication key, first/last seen, state, affected entity, runbook link, assignee, acknowledgement/resolution actor and time. Alerts should reference domain records, not copy unnecessary PII into alert text. Define severity and response expectations before claiming operational availability.

Potential sources include webhook signature/retry failures, payment/order mismatch, fulfillment rejection, upload scan failure, scheduled publication failure, expired consent, repeated authorization denial, unusual role changes, and infrastructure health events.

## Security and privacy

- Enforce every list, detail, and action on the server; defend against object-ID substitution.
- Default to minimized views with field-level redaction and purpose-based access.
- Do not expose secrets, raw payment credentials, unnecessary webhook bodies, or full private uploads in routine views.
- Use pagination, query limits, safe exports, session timeout, CSP/frame protections, and rate limits.
- Audit access to high-sensitivity records as well as mutation.
- Provide break-glass access only with owner-approved controls, expiry, alerting, and review.

## Implementation order

1. Authentication, step-up capability, typed authorization, and audit foundation.
2. Read-only shell with no domain secrets and authorization tests.
3. One low-risk module (for example, public deployment review) with separate publish permission.
4. Domain modules only after their underlying systems exist.
5. Financial, role-management, upload, moderation, and FAFO Cares modules last, after policy and security review.
