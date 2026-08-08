import type { Metadata } from "next";
import Header from "../../Header";
import UnavailableAccount from "../UnavailableAccount";
import { updateConsentAction } from "../actions";
import { MEMBER_ACCESS_READINESS } from "@/lib/auth/config.server";
import { requireMemberSession } from "@/lib/auth/member-session.server";
import { consentDecisionRepository, memberProfileRepository } from "@/lib/domain/persistence/repositories.server";
import { latestConsentDecision } from "@/lib/domain/consent";

export const metadata: Metadata = { title: "Member Privacy & Consent", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountPrivacyPage() {
  if (!MEMBER_ACCESS_READINESS.enabled) return <UnavailableAccount />;
  const { member } = await requireMemberSession();
  const [profile, decisions] = await Promise.all([
    memberProfileRepository.findPrivateProfileByMemberId(member.id),
    consentDecisionRepository.listForMember(member.id),
  ]);
  return (
    <main className="min-h-screen bg-black text-white"><Header />
      <section className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-10">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">Member controlled</p>
        <h1 className="mt-5 text-4xl font-black uppercase sm:text-6xl">Privacy &amp; consent</h1>
        <p className="mt-6 text-sm leading-7 text-white/65">Every change appends a decision. Revoking public profile visibility closes the profile before the decision is recorded.</p>
        {!profile && <p className="mt-8 border border-[#D4AF37]/35 p-5 text-[#F1D36A]">Create your private profile before changing public visibility.</p>}
        <div className="mt-10 space-y-5">
          {(["PUBLIC_MEMBER_PROFILE", "PUBLIC_MEMBER_LOCATION"] as const).map((purpose) => {
            const current = latestConsentDecision(decisions, purpose)?.status ?? "NOT_GRANTED";
            return <article key={purpose} className="border border-white/15 p-6">
              <h2 className="text-xl font-black uppercase">{purpose === "PUBLIC_MEMBER_PROFILE" ? "Public profile" : "City-level public location"}</h2>
              <p className="mt-3 text-sm text-white/65">Current decision: {current}</p>
              <div className="mt-5 flex gap-3">
                <form action={updateConsentAction}><input type="hidden" name="purpose" value={purpose} /><input type="hidden" name="status" value="GRANTED" /><button disabled={!profile} className="min-h-11 border border-red-500 px-5 text-xs font-black uppercase disabled:opacity-40">Grant</button></form>
                <form action={updateConsentAction}><input type="hidden" name="purpose" value={purpose} /><input type="hidden" name="status" value="REVOKED" /><button disabled={!profile} className="min-h-11 border border-white/25 px-5 text-xs font-black uppercase disabled:opacity-40">Revoke</button></form>
              </div>
            </article>;
          })}
        </div>
      </section>
    </main>
  );
}
