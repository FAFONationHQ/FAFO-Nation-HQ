import type { Metadata } from "next";
import Header from "../../Header";
import UnavailableAccount from "../UnavailableAccount";
import { saveProfileAction } from "../actions";
import { MEMBER_ACCESS_READINESS } from "@/lib/auth/config.server";
import { requireMemberSession } from "@/lib/auth/member-session.server";
import { memberProfileRepository } from "@/lib/domain/persistence/repositories.server";

export const metadata: Metadata = { title: "Private Member Profile", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  if (!MEMBER_ACCESS_READINESS.enabled) return <UnavailableAccount />;
  const { member } = await requireMemberSession();
  const profile = await memberProfileRepository.findPrivateProfileByMemberId(member.id);
  const inputClass = "mt-2 min-h-12 w-full border border-white/20 bg-black px-4 py-3 text-white";
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-10">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">Private member data</p>
        <h1 className="mt-5 text-4xl font-black uppercase sm:text-6xl">Profile</h1>
        <p className="mt-6 text-sm leading-7 text-white/65">Nothing here is public unless you separately enable profile visibility and consent.</p>
        <form action={saveProfileAction} className="mt-10 space-y-6">
          <label className="block text-sm font-bold">Callsign <input name="callsign" required minLength={3} maxLength={24} defaultValue={profile?.callsign} className={inputClass} /></label>
          <label className="block text-sm font-bold">Display name <input name="displayName" maxLength={60} defaultValue={profile?.displayName} className={inputClass} /></label>
          <label className="block text-sm font-bold">Biography <textarea name="biography" maxLength={500} defaultValue={profile?.biography} rows={5} className={inputClass} /></label>
          <fieldset className="border border-white/15 p-5"><legend className="px-2 text-sm font-black uppercase">Optional city-level location</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm">City <input name="city" maxLength={100} defaultValue={profile?.cityLevelLocation?.city} className={inputClass} /></label>
              <label className="text-sm">Region <input name="region" maxLength={100} defaultValue={profile?.cityLevelLocation?.region} className={inputClass} /></label>
              <label className="text-sm">Country <input name="country" maxLength={100} defaultValue={profile?.cityLevelLocation?.country} className={inputClass} /></label>
            </div>
          </fieldset>
          <button type="submit" className="min-h-12 border border-red-500 px-7 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#F1D36A]">Save private profile</button>
        </form>
      </section>
    </main>
  );
}
