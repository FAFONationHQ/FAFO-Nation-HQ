# Proposed V1 Data Architecture and FAFO World V2

Status after Shift #4: the approved V1 member/privacy subset is implemented in `prisma/schema.prisma`, and a first SQL migration artifact exists. It was not applied and no database was connected. The broader conceptual entities below remain proposals. FAFO World still displays the same static records, while a tested asynchronous projection adapter and separate V2 database proposal now prepare the future server source.

## Data classification

| Class | Examples | Required boundary |
| --- | --- | --- |
| Public | published profile fields, sanitized deployment DTO, published content/catalog | explicit publication state; no private joins serialized |
| Private customer | email, phone, identity link, cart, order ownership, project contact | authenticated owner or authorized operator only |
| Sensitive operational | payment-provider IDs, fulfillment addresses, quote details, private uploads, moderation evidence | narrow service/operator access, encryption and retention controls |
| Admin-only | roles, audit events, approval notes, internal alerts, webhook records | least privilege, step-up auth, auditable access |

## Broader conceptual entities (not implemented unless noted)

### Identity and privacy

- `User`: stable application identity, status, creation/deletion lifecycle. Email should not be the public identifier.
- `AuthAccount`: provider, provider subject, verified state; unique on provider + subject.
- `Profile`: callsign/display name and optional publishable biography/avatar references.
- `PrivacyConsent`: purpose, version, granted/revoked time, source, and actor. Location consent must be independent.
- `RoleAssignment`: typed role, scope, grant/revoke actor and timestamps; replaces enforcement through a free-form `User.role` string.
- `AuditEvent`: actor, action, target type/id, result, request correlation, timestamp, and carefully minimized metadata.

### Public presence

- `PublicDeployment`: approved city-level location, coordinates, kind, public label, publication/consent states, occurred/published dates, source reference, and audit relationship.
- `CommunityRecognition`: subject profile, type, public copy, provenance, publication state, ordering, and optional revocation.

### Commerce

- `Product`, `ProductVariant`, `Collection`, and join records for merchandising.
- `Cart` and `CartLine`: guest token or user ownership, currency, quantities, and expiry.
- `Order` and `OrderLine`: immutable purchase snapshot, totals, currency, lifecycle, customer ownership, and provider references.
- `Payment`: provider, external identifier, amount/currency, status, attempts, and reconciliation fields; never raw card data.
- `Shipment`: provider, external identifier, carrier/tracking, state, and event times.

### Custom Shop

- `CustomProject`: customer ownership, requirements, workflow state, privacy/publication intent.
- `Quote`: versioned scope, currency/price, expiry, status, acceptance evidence.
- `ProjectAsset`: object-storage key, media type, size, scan state, retention date, access classification.

### Media and placement

- `ContentItem`: type, slug, title, summary/body fields, publication state, dates, rights state, and external links.
- `ArtistCreator`: approved identity/attribution, links, rights/permission notes, publish state.
- `FeaturePlacement`: content/creator, placement key, active interval, priority/sort order; supports manual curation.

### FAFO Cares concepts

Model content or campaigns only after owner/legal/operational policy is approved. Conceptual records need publication state, owner, review state, start/end dates, disclosures, approved destination/provider, audit history, and archival behavior. Do not reuse commerce orders or imply charitable status without policy approval.

## Integrity and index requirements

- Case-insensitive normalized email and callsign uniqueness must match product policy.
- External provider identifiers require provider-scoped unique constraints.
- Slugs should be unique within their content domain.
- Public listing indexes should lead with publication state and published/sort dates.
- Ownership queries need indexes on user/customer IDs plus status/date.
- Orders, payments, shipments, quotes, and webhook deliveries require immutable external/reference uniqueness and idempotency keys.
- Consent queries need subject + purpose + effective/revoked time.
- Audit events need actor/time and target/time indexes; metadata must not become a PII dump.
- Coordinates need validated ranges; publication requires city-level approved values independent of fulfillment addresses.

## Deletion, retention, and audit

- Prefer restriction over cascade when deletion would erase financial, consent, moderation, or audit history.
- Anonymize or detach public/profile data when permissible while retaining legally required transaction records.
- Carts, unsubmitted projects, rejected uploads, verification/recovery tokens, webhook payloads, and logs require explicit expiry.
- Orders/refunds and security/audit records require owner/legal retention schedules.
- Publication and consent changes should remain reconstructable without retaining unnecessary private content.

## Migration risks

The preliminary `User` model mixes identity, private contact, public callsign, and authorization. A production migration must decide how to split these concerns and migrate existing data—if any—without assuming the database is empty. Optional unique callsigns, role conversion, normalized email uniqueness, provider identity linkage, and deletion semantics all require a reviewed data migration and rollback plan. No migration should be generated until the target schema and environment ownership are approved.

# FAFO World V2 Technical Specification

## Current boundary to preserve

`app/fafo-world/deployments.ts` defines safe typed static records with city-level coordinates. `FAFOWorldMap.tsx` consumes them directly and builds popup elements using `textContent`; it does not inject raw HTML. `app/recently-deployed/page.tsx` reuses the gear array. V2 should preserve the visual interaction and one public source of truth while replacing static imports with a sanitized server data contract.

## PublicDeployment state

Recommended independent dimensions:

- publication: `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `UNPUBLISHED`, `REJECTED`, `ARCHIVED`
- consent: `NOT_REQUIRED`, `PENDING`, `GRANTED`, `REVOKED`, `EXPIRED`
- kind: controlled values corresponding to approved public marker styles
- provenance: manual, approved order/fulfillment event, or member opt-in—never inferred on the client

Publication is allowed only when the record has approved public copy, valid coarse coordinates, permitted provenance, and any required consent is currently granted.

## Sanitized public DTO

```ts
type PublicDeploymentDTO = {
  id: string;
  kind: "standard-deployment" | "gold-star-fafo" | "fafo-member-location";
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  publicLabel: string;
  publicDetail?: string;
  occurredAt?: string;
};
```

The public DTO must never contain customer/member name, street address, postal code, email, phone, order number, payment data, private profile ID, private member location, consent evidence, internal notes, or fulfillment identifiers. Use a dedicated mapper with an explicit field allowlist; never serialize a database record directly.

## Repository and rendering flow

1. A server-only repository queries published, currently consented records.
2. A domain service validates publication invariants and maps to the allowlisted DTO.
3. A Server Component or route-level loader obtains the DTO list and aggregates public statistics.
4. The MapLibre client component receives DTOs as props and retains its existing marker/popup rendering.
5. Recently Deployed consumes the same server service with a list-specific projection and stable pagination/order.

Use server-only module enforcement for database repositories. Add contract tests that assert forbidden private fields cannot enter DTOs.

## Caching and revalidation

- Default to cached public reads with an owner-approved revalidation interval.
- Trigger targeted invalidation after publish/unpublish/consent revocation.
- Consent revocation and privacy removal should invalidate immediately and fail closed.
- Define stale-cache behavior and CDN purge expectations before production.
- Do not expose private draft previews through shared public caches.

## Map scale and clustering

Keep current individual markers for the small dataset. Introduce GeoJSON source clustering only after measured marker volume or interaction cost justifies it. Cluster payloads must use the same sanitized DTO boundary. Stable IDs support selection, timeline filtering, and accessible companion lists.

## Timeline support

Add an optional public occurrence date separate from creation/publish time. Timeline filters should operate on public fields only and retain records whose exact day is intentionally omitted. Statistics must use the same filtered public dataset to avoid mismatches.

## Approval, removal, and audit

- Submission/source event creates a non-public draft.
- Authorized reviewer verifies copy, location granularity, provenance, and consent.
- Publishing records actor/time and invalidates public caches.
- Unpublish and consent revocation immediately remove map/list visibility without deleting audit history.
- Corrections create traceable changes; administrative notes remain private.
- Scheduled audit checks can flag expired consent or invalid external provenance but must not auto-publish.

## Recommended phases

1. Approve privacy, provenance, consent, location, and moderator policies.
2. Approve schema and migration plan; add repository/DTO contract tests.
3. Implement read-only database-backed public records in a non-production environment.
4. Switch FAFO World and Recently Deployed to the server DTO while preserving UI.
5. Add authenticated member opt-in and revocation.
6. Add admin review/publish/unpublish with least privilege and audit.
7. Add caching invalidation, timeline, and measured clustering as justified.
