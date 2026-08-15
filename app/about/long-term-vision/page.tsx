import type { Metadata } from "next";
import Header from "../../Header";

export const metadata: Metadata = {
  title: "Long-Term Vision",
  description: "Explore the proposed long-term direction for FAFO Nation initiatives, programs, chapters, and community impact.",
};

const VISION_AREAS = [
  { title: "Community Programs", detail: "Future programs may create more ways for members to participate, contribute, and recognize meaningful service." },
  { title: "Local Chapters", detail: "The long-term vision includes the possibility of chapters that carry shared FAFO Nation standards into local communities." },
  { title: "FAFO Foundation", detail: "A FAFO Foundation remains a proposed future concept. No foundation, funding program, or application process is currently represented as operational." },
];

export default function LongTermVisionPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32"><div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(212,175,55,0.14)_0%,rgba(0,0,0,0)_68%)]" /><div className="relative z-10 mx-auto w-full max-w-7xl"><p className="text-xs font-black uppercase tracking-[0.32em] text-red-600">Future Direction</p><h1 className="mt-5 max-w-6xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-9xl">Long-Term <span className="block text-[#D4AF37]">Vision</span></h1><div className="mt-8 h-px w-24 bg-red-600" /><p className="mt-8 max-w-3xl text-base font-medium leading-8 text-white/65 sm:text-lg sm:leading-9">FAFO Nation’s long-term direction is to build beyond a name while remaining grounded in community, purpose, accountability, and meaningful action.</p></div></section>
      <section className="px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32"><div className="mx-auto w-full max-w-7xl"><p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">Proposed Concepts</p><h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.04em] sm:text-6xl">Direction, Not Promises</h2><div className="mt-12 grid gap-px border border-white/15 bg-white/15 lg:grid-cols-3">{VISION_AREAS.map((area) => <article key={area.title} className="bg-black p-7 sm:p-9"><h3 className="text-2xl font-black uppercase text-[#D4AF37]">{area.title}</h3><p className="mt-5 text-sm leading-7 text-white/55 sm:text-base">{area.detail}</p></article>)}</div><aside className="mt-8 border border-red-600/35 bg-red-950/10 p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">Current Status</p><p className="mt-4 max-w-4xl text-sm leading-7 text-white/60 sm:text-base">These are proposed directions only. The repository contains no operational chapter system, foundation, applications, funding commitments, or program launch dates.</p></aside></div></section>
    </main>
  );
}
