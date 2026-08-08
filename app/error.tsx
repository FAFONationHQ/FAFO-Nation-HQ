"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 py-20 text-white">
      <section className="w-full max-w-3xl border border-white/15 bg-white/[0.02] px-6 py-16 text-center sm:px-12 sm:py-20">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600">
          FAFO Nation HQ
        </p>
        <h1 className="mt-5 text-5xl font-black uppercase leading-none tracking-[-0.04em] text-white sm:text-7xl">
          Something Went Wrong
        </h1>
        <div className="mx-auto mt-8 h-px w-24 bg-red-600" />
        <p className="mx-auto mt-8 max-w-xl text-base leading-8 text-white/60">
          This page could not be loaded. Try again or return to FAFO Nation HQ.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center border border-red-600/70 px-7 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37] shadow-[0_0_12px_rgba(220,38,38,0.45)] transition hover:bg-red-700/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center border border-white/20 px-7 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-white/40 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
