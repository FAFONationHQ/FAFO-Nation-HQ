import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../Header";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Learn how FAFO Nation began and the standards that continue to shape the community.",
};

export default function OurStoryPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[540px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(127,29,29,0.18)_0%,rgba(0,0,0,0)_68%)]" />
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600">About FAFO Nation</p>
          <h1 className="mt-5 max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-9xl">Our <span className="text-[#D4AF37]">Story</span></h1>
          <div className="mt-8 h-px w-24 bg-red-600" />
          <p className="mt-8 max-w-3xl text-base font-medium leading-8 text-white/65 sm:text-lg sm:leading-9">Established in 2016, FAFO Nation grew around community, accountability, camaraderie, streaming, and merchandise. The name became a shared warning and a shared standard: words matter, actions matter, and choices have consequences.</p>
        </div>
      </section>
      <section className="px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.7fr_1fr] lg:gap-20">
          <div><p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">More Than a Name</p><h2 className="mt-4 text-4xl font-black uppercase leading-none tracking-[-0.04em] sm:text-6xl">A Community Built by Those Who Show Up</h2></div>
          <div className="border-l-2 border-red-600 pl-6 sm:pl-8">
            <p className="text-base leading-8 text-white/65 sm:text-lg sm:leading-9">FAFO Nation brings together people with different backgrounds and different stories around accountability, resilience, loyalty, and action. Membership is not treated as a label alone. The standard is participation, contribution, and responsibility.</p>
            <p className="mt-6 text-base leading-8 text-white/55 sm:text-lg sm:leading-9">The public website is still growing. Its current pages establish the Nation’s identity, record public gear deployments, and explain the direction of future community participation without presenting planned systems as finished.</p>
            <Link href="/join" className="mt-10 inline-flex min-h-12 items-center border border-red-600/70 px-7 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37] transition hover:bg-red-700/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600">What It Means to Join</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
