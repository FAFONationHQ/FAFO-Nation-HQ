import Link from "next/link";
import Header from "../Header";

export default function UnavailableAccount() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="mx-auto w-full max-w-4xl px-5 py-24 sm:px-10 lg:px-16">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">Member preview</p>
        <h1 className="mt-5 text-4xl font-black uppercase sm:text-6xl">Private account access is not enabled here</h1>
        <p className="mt-7 max-w-2xl text-base leading-8 text-white/70">
          These protected routes require approved WorkOS credentials and an isolated migrated database. This environment has neither, so no session or member data is simulated.
        </p>
        <Link href="/join" className="mt-9 inline-flex min-h-12 items-center border border-red-500 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#F1D36A]">Return to membership</Link>
      </section>
    </main>
  );
}
