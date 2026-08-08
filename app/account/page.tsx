import type { Metadata } from "next";
import Link from "next/link";
import Header from "../Header";
import UnavailableAccount from "./UnavailableAccount";
import { MEMBER_ACCESS_READINESS } from "@/lib/auth/config.server";
import { requireMemberSession } from "@/lib/auth/member-session.server";

export const metadata: Metadata = { title: "Member Account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  if (!MEMBER_ACCESS_READINESS.enabled) return <UnavailableAccount />;
  const { member } = await requireMemberSession();
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-10 lg:px-16">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">Private member area</p>
        <h1 className="mt-5 text-5xl font-black uppercase sm:text-7xl">Member account</h1>
        <p className="mt-6 text-sm leading-7 text-white/65">Member record {member.id}. Private by default; public visibility requires a separate consent decision.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Link href="/account/profile" className="border border-white/15 p-7 text-xl font-black uppercase text-[#F1D36A]">Edit private profile</Link>
          <Link href="/account/privacy" className="border border-white/15 p-7 text-xl font-black uppercase text-[#F1D36A]">Privacy &amp; consent</Link>
        </div>
        <form action="/auth/sign-out" method="post" className="mt-10">
          <button type="submit" className="min-h-12 border border-red-500 px-6 py-3 text-xs font-black uppercase tracking-[0.16em]">Sign out</button>
        </form>
      </section>
    </main>
  );
}
