import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../Header";
import { MEMBER_ACCESS_READINESS } from "@/lib/auth/config.server";
import { memberProfileRepository } from "@/lib/domain/persistence/repositories.server";
import { findConsentControlledPublicMember } from "@/lib/domain/services/public-member-profile";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ callsign: string }> };

async function loadProfile(params: PageProps["params"]) {
  if (!MEMBER_ACCESS_READINESS.enabled) return null;
  const { callsign } = await params;
  return findConsentControlledPublicMember(callsign, memberProfileRepository);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await loadProfile(params);
  if (!profile) return { title: "Member Not Found", robots: { index: false, follow: false } };
  return {
    title: profile.displayName ?? profile.callsign,
    description: profile.biography ?? `Public FAFO Nation profile for ${profile.callsign}.`,
  };
}

export default async function PublicMemberPage({ params }: PageProps) {
  const profile = await loadProfile(params);
  if (!profile) notFound();
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <article className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-10 lg:px-16">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">Public member profile</p>
        <h1 className="mt-5 text-5xl font-black uppercase text-[#F1D36A] sm:text-7xl">{profile.callsign}</h1>
        {profile.displayName && <p className="mt-5 text-2xl font-bold">{profile.displayName}</p>}
        {profile.biography && <p className="mt-8 max-w-2xl text-base leading-8 text-white/75">{profile.biography}</p>}
        {profile.location && (
          <p className="mt-8 border-l-2 border-red-500 pl-5 text-sm text-white/70">
            {profile.location.city}, {profile.location.region}, {profile.location.country}
          </p>
        )}
        <p className="mt-12 text-xs leading-6 text-white/50">Only member-approved profile fields appear here. Email, provider identity, member ID, eligibility, and private account data are never part of this view.</p>
      </article>
    </main>
  );
}
