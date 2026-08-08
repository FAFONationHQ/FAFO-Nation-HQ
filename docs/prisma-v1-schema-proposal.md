# Prisma V1 Schema Proposal — Member and Privacy Slice

Date: 2026-08-08  
Status: approved V1 implemented in schema with SQL migration artifact; migration not applied and no database connected

## Goal and scope

The implemented first migration scope supports a managed-auth identity link, adult-eligibility attestation, a private-by-default member profile, normalized unique callsigns, and append-only purpose-specific consent. It excludes FAFO World, commerce, Custom Shop, Media, Community, roles, and generic audit tables.

The preliminary `User` model was replaced in source. The artifact remains unapplied until an isolated non-production target and its existing-data state are positively identified.

## Implemented schema change set

```prisma
enum MemberStatus {
  ACTIVE
  SUSPENDED
  DELETION_REQUESTED
  ANONYMIZED
}

enum ProfileVisibility {
  PRIVATE
  PUBLIC
}

enum ConsentPurpose {
  PUBLIC_MEMBER_PROFILE
  PUBLIC_MEMBER_LOCATION
  PUBLIC_DEPLOYMENT
  MEMBER_LINKED_DEPLOYMENT
  CUSTOM_SHOP_GALLERY
  MEDIA_MEMBER_SPOTLIGHT
}

enum ConsentDecisionType {
  GRANTED
  REVOKED
}

model Member {
  id                       String       @id @default(cuid())
  status                   MemberStatus @default(ACTIVE)
  ageEligibilityAttestedAt DateTime?
  eligibilityPolicyVersion String?
  createdAt                DateTime     @default(now())
  updatedAt                DateTime     @updatedAt

  identities AuthIdentity[]
  profile    MemberProfile?
  consents   ConsentDecision[]

  @@index([status, createdAt])
}

model AuthIdentity {
  id              String   @id @default(cuid())
  memberId        String
  provider        String
  providerSubject String
  verifiedAt      DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@unique([provider, providerSubject])
  @@index([memberId])
}

model MemberProfile {
  id                 String            @id @default(cuid())
  memberId           String            @unique
  callsign            String            @unique
  displayName         String?
  biography           String?
  avatarUrl           String?
  city                String?
  region              String?
  country             String?
  visibility          ProfileVisibility @default(PRIVATE)
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([visibility, updatedAt])
}

model ConsentDecision {
  id            String              @id @default(cuid())
  memberId      String
  purpose       ConsentPurpose
  decision      ConsentDecisionType
  policyVersion String
  decidedAt     DateTime            @default(now())
  source        String

  member Member @relation(fields: [memberId], references: [id], onDelete: Restrict)

  @@index([memberId, purpose, decidedAt])
}
```

## Invariants and privacy implications

- `AuthIdentity(provider, providerSubject)` is the durable managed-provider link. Password hashes, reset tokens, MFA secrets, and provider credentials never enter the application schema.
- Do not duplicate email in this first migration. The provider remains authoritative for verified sign-in email; add a separate private contact field later only when an approved application workflow requires it.
- Store adult eligibility attestation and policy version, not date of birth, unless a later legal/product requirement proves DOB is necessary.
- `MemberProfile.visibility` defaults to `PRIVATE`. A `PUBLIC` value is insufficient by itself: projection also requires the latest `PUBLIC_MEMBER_PROFILE` decision to be `GRANTED`.
- `callsign` stores only the application-normalized canonical value and is uniquely constrained. Display name is independent and optional. Rename/moderation service code must write an audit event before public rename capability launches.
- City/region/country are private profile data until separate `PUBLIC_MEMBER_LOCATION` consent is active. Street/postal/fulfillment data does not belong in this model.
- Consent is append-only. Do not update a grant into a revoke; insert a new decision. Equal-time conflict handling fails closed to revocation in the domain layer.
- `Restrict` on consent prevents accidental hard deletion that would erase policy history. Account deletion should first revoke visibility, delete provider links/profile where allowed, and anonymize the member under a configurable retention workflow. A later approved retention migration may detach/anonymize expired consent records.

## First migration procedure

1. Select managed auth provider and approve this schema.
2. Confirm the target is an isolated non-production development database and identify whether any `User` rows exist. This cannot be assumed from repository state.
3. If empty, replace the preliminary `User` table with the four proposed models/enums in one reviewed migration.
4. If rows exist, write a separate reviewed data migration: normalize/validate callsigns, detect collisions/reserved terms, create `Member`/`MemberProfile`, and do not invent provider subjects or age attestations. Quarantine rows that cannot migrate safely.
5. Test forward migration, rollback/recovery procedure, unique collisions, default-private creation, grant/revoke ordering, and deletion restrictions against a disposable test database.
6. Only then implement the verified-email callback → `Member`/`AuthIdentity` creation transaction.

## Explicitly deferred schema

- Roles/permission grants and immutable audit events: add with the first privileged/operator slice, before any admin action.
- FAFO World V2 deployments: add after the member/privacy slice proves repository and consent behavior.
- Commerce, refunds, Custom Shop, uploads, Media, Community, monitoring, and provider webhook persistence: separate migrations owned by their vertical slices.

## Operational approval still required

The schema scope was approved and implemented. Applying it still requires isolated database provisioning, migration ownership, review of the SQL artifact, and confirmation of whether any legacy `User` data exists. WorkOS was selected, but credentials and provider-console activation remain external prerequisites.
