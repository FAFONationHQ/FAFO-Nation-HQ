-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETION_REQUESTED', 'ANONYMIZED');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ConsentPurpose" AS ENUM ('PUBLIC_MEMBER_PROFILE', 'PUBLIC_MEMBER_LOCATION', 'PUBLIC_DEPLOYMENT', 'MEMBER_LINKED_DEPLOYMENT', 'CUSTOM_SHOP_GALLERY', 'MEDIA_MEMBER_SPOTLIGHT');

-- CreateEnum
CREATE TYPE "ConsentDecisionType" AS ENUM ('GRANTED', 'REVOKED');

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "ageEligibilityAttestedAt" TIMESTAMP(3),
    "eligibilityPolicyVersion" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Member_age_eligibility_pair_check" CHECK (
      ("ageEligibilityAttestedAt" IS NULL) = ("eligibilityPolicyVersion" IS NULL)
    )
);

-- CreateTable
CREATE TABLE "AuthIdentity" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "providerSubject" VARCHAR(255) NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AuthIdentity_provider_not_blank_check" CHECK (length(trim("provider")) > 0),
    CONSTRAINT "AuthIdentity_subject_not_blank_check" CHECK (length(trim("providerSubject")) > 0)
);

-- CreateTable
CREATE TABLE "MemberProfile" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "callsign" VARCHAR(24) NOT NULL,
    "displayName" VARCHAR(60),
    "biography" VARCHAR(500),
    "avatarUrl" VARCHAR(2048),
    "city" VARCHAR(100),
    "region" VARCHAR(100),
    "country" VARCHAR(100),
    "visibility" "ProfileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberProfile_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MemberProfile_callsign_format_check" CHECK (
      length("callsign") BETWEEN 3 AND 24
      AND "callsign" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
    CONSTRAINT "MemberProfile_location_triplet_check" CHECK (
      ("city" IS NULL AND "region" IS NULL AND "country" IS NULL)
      OR
      (
        "city" IS NOT NULL
        AND "region" IS NOT NULL
        AND "country" IS NOT NULL
        AND length(trim("city")) > 0
        AND length(trim("region")) > 0
        AND length(trim("country")) > 0
      )
    )
);

-- CreateTable
CREATE TABLE "ConsentDecision" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "purpose" "ConsentPurpose" NOT NULL,
    "decision" "ConsentDecisionType" NOT NULL,
    "policyVersion" VARCHAR(100) NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" VARCHAR(50) NOT NULL,

    CONSTRAINT "ConsentDecision_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ConsentDecision_policy_not_blank_check" CHECK (length(trim("policyVersion")) > 0),
    CONSTRAINT "ConsentDecision_source_not_blank_check" CHECK (length(trim("source")) > 0)
);

-- CreateIndex
CREATE INDEX "Member_status_createdAt_idx" ON "Member"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AuthIdentity_memberId_idx" ON "AuthIdentity"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_provider_providerSubject_key" ON "AuthIdentity"("provider", "providerSubject");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_publicId_key" ON "MemberProfile"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_memberId_key" ON "MemberProfile"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_callsign_key" ON "MemberProfile"("callsign");

-- CreateIndex
CREATE INDEX "MemberProfile_visibility_updatedAt_idx" ON "MemberProfile"("visibility", "updatedAt");

-- CreateIndex
CREATE INDEX "ConsentDecision_memberId_purpose_decidedAt_id_idx" ON "ConsentDecision"("memberId", "purpose", "decidedAt", "id");

-- AddForeignKey
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberProfile" ADD CONSTRAINT "MemberProfile_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentDecision" ADD CONSTRAINT "ConsentDecision_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
