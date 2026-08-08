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

No fulfillment address, customer email, payment reference, or provider identity belongs in a public DTO. Location is city-level only. A database source must select private candidate fields server-side and pass them through `projectPublicDeployment`; records fail closed unless verified, published, and appropriately consented.

## Rollout

1. Approve retention, consent ownership, moderation workflow, and source-of-truth rules.
2. Add a reviewed V2 migration and Prisma source with narrow `select` statements.
3. Validate static/database parity with synthetic fixtures in an isolated database.
4. Run the database adapter in shadow comparison mode; do not expose differences publicly.
5. Switch the source only after record-by-record approval and rollback validation.

The seven visible map records remain unchanged during this preparation.
