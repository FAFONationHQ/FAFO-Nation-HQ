import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../Header";

export const metadata: Metadata = {
  title: "Sgt Swagger",
  description: "An introduction to Sgt Swagger, the official FAFO Nation Brand Ambassador.",
};

export default function SgtSwaggerPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(212,175,55,0.13)_0%,rgba(0,0,0,0)_68%)]" />
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600">Brand Ambassador</p>
          <h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-9xl">Sgt <span className="block text-[#D4AF37]">Swagger</span></h1>
          <div className="mt-8 h-px w-24 bg-red-600" />
          <p className="mt-8 max-w-3xl text-base font-medium leading-8 text-white/65 sm:text-lg sm:leading-9">Sgt Swagger is the official FAFO Nation Brand Ambassador, representing the confidence, accountability, resilience, and unmistakable character behind the Nation.</p>
        </div>
      </section>
      <section className="px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-2">
          <article className="border border-white/15 bg-white/[0.02] p-7 sm:p-10"><p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">The Role</p><h2 className="mt-4 text-3xl font-black uppercase">A Symbol of the Nation</h2><p className="mt-5 text-base leading-8 text-white/60">The ambassador role gives FAFO Nation a recognizable public character tied to its existing identity and shared standards.</p></article>
          <article className="border border-[#D4AF37]/30 bg-[#D4AF37]/[0.03] p-7 sm:p-10"><p className="text-xs font-black uppercase tracking-[0.25em] text-[#D4AF37]">Public Profile</p><h2 className="mt-4 text-3xl font-black uppercase">More Coming Later</h2><p className="mt-5 text-base leading-8 text-white/60">A fuller public profile and future appearances will be published only when approved information is ready. No additional biography or schedule is currently available.</p></article>
        </div>
        <div className="mx-auto mt-12 w-full max-w-7xl"><Link href="/about" className="text-xs font-black uppercase tracking-[0.18em] text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600">← Back to About</Link></div>
      </section>
    </main>
  );
}
