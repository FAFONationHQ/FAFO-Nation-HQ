"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireMemberSession } from "@/lib/auth/member-session.server";
import { changePublicConsent } from "@/lib/domain/services/member-privacy";
import {
  consentDecisionRepository,
  memberProfileRepository,
} from "@/lib/domain/persistence/repositories.server";
import { PersistenceConflictError, PersistenceValidationError } from "@/lib/domain/persistence/member-repositories";

function optionalText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function saveProfileAction(formData: FormData) {
  const { member } = await requireMemberSession();
  const existing = await memberProfileRepository.findPrivateProfileByMemberId(member.id);
  const callsign = optionalText(formData, "callsign");
  if (!callsign) redirect("/account/profile?error=invalid");
  const city = optionalText(formData, "city");
  const region = optionalText(formData, "region");
  const country = optionalText(formData, "country");
  if ([city, region, country].some(Boolean) && ![city, region, country].every(Boolean)) {
    redirect("/account/profile?error=location");
  }
  try {
    await memberProfileRepository.savePrivateProfile({
      memberId: member.id,
      callsign,
      displayName: optionalText(formData, "displayName"),
      biography: optionalText(formData, "biography"),
      cityLevelLocation: city && region && country ? { city, region, country } : undefined,
      visibility: existing?.visibility ?? "PRIVATE",
    });
  } catch (error) {
    if (error instanceof PersistenceConflictError) redirect("/account/profile?error=callsign-taken");
    if (error instanceof PersistenceValidationError) redirect("/account/profile?error=invalid");
    throw error;
  }
  revalidatePath("/account/profile");
  redirect("/account/profile?saved=1");
}

export async function updateConsentAction(formData: FormData) {
  const { member } = await requireMemberSession();
  const purpose = formData.get("purpose");
  const status = formData.get("status");
  if (
    (purpose !== "PUBLIC_MEMBER_PROFILE" && purpose !== "PUBLIC_MEMBER_LOCATION") ||
    (status !== "GRANTED" && status !== "REVOKED")
  ) redirect("/account/privacy?error=invalid");
  try {
    await changePublicConsent(
      { memberId: member.id, purpose, status },
      memberProfileRepository,
      consentDecisionRepository,
    );
  } catch (error) {
    if (error instanceof PersistenceValidationError) redirect("/account/privacy?error=profile-required");
    throw error;
  }
  revalidatePath("/account/privacy");
  redirect("/account/privacy?saved=1");
}
