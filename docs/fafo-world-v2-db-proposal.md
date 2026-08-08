# FAFO World V2 Database Proposal

Date: 2026-08-08
Status: proposal only; V1 schema unchanged, no migration created or applied

## Objective

Move public deployment records behind the prepared asynchronous source while keeping the current static adapter as the production fallback until data ownership, moderation, consent, and migration approval are complete.

## Minimal entities

- `Deployment`: category, city/region/country, coordinates, verification state, publication state, public label, created/updated/published timestamps, and a non-sensitive internal source reference.
- `DeploymentConsentDecision`: append-only purpose/status/policy/source/timestamp history for public deployment publication.
- Optional `MemberDeploymentAssociation`: member ID, deployment ID, public role/callsign projection flags, and independent append-only association consent.
- `DeploymentReview`: reviewer ID, decision, reason code, and timestamp; operator permission and audit event required.

## Implementation-ready workflow boundary

- Candidate records are validated before review and fail closed on malformed IDs, labels, coordinates, timestamps, or provenance.
- Review requires `deployment.review`; publication requires the separate `deployment.publish` permission.
- Publication requires verified state, explicit deployment consent, and a publication timestamp.
- Member-location publication additionally requires independent member-association consent.
- Rejection or consent withdrawal closes publication without deleting review or consent history.
- Provenance records only a source category, non-sensitive source reference, and timestamp. It never becomes a public DTO field.
- Timeline reads use a bounded cursor/limit contract and still pass every candidate through the public projection.
- Static/database shadow comparison checks public records by stable ID plus aggregate statistics before any source switch.

No fulfillment address, customer email, payment reference, or provider identity belongs in a public DTO. Location is city-level only. A database source must select private candidate fields server-side and pass them through `projectPublicDeployment`; records fail closed unless verified, published, and appropriately consented.

## Rollout

1. Approve retention, consent ownership, moderation workflow, and source-of-truth rules.
2. Add a reviewed V2 migration and Prisma source with narrow `select` statements.
3. Validate static/database parity with synthetic fixtures in an isolated database.
4. Run the database adapter in shadow comparison mode; do not expose differences publicly.
5. Switch the source only after record-by-record approval and rollback validation.

The seven visible map records remain unchanged during this preparation.

## Decisions still required before migration approval

- Source-of-truth ownership for fulfillment-derived deployments.
- Review reason-code vocabulary and correction workflow.
- Consent and review retention schedules.
- Coordinate precision/storage policy before city-level public projection.
- Operator assignment and rollback approval for switching away from the static source.
