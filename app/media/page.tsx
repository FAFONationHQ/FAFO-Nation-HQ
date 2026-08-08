import type { Metadata } from "next";
import Link from "next/link";
import Header from "../Header";

export const metadata: Metadata = {
  title: "Media & Content",
  description: "Explore the current public media destinations and planned content areas for FAFO Nation.",
};

const MEDIA_AREAS = [
  { href: "/media/videos", title: "Videos", detail: "The existing public FAFO Nation video destination." },
  { href: "/media/live", title: "Live Streams", detail: "The existing public streaming destination, with no schedule claimed." },
];

export default function MediaPage() {
  return <main className="min-h-screen bg-black text-white"><Header />
    <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32"><div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[920px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(212,175,55,0.13)_0%,rgba(127,29,29,0.10)_38%,rgba(0,0,0,0)_70%)]" /><div className="relative z-10 mx-auto w-full max-w-7xl"><p className="text-xs font-black uppercase tracking-[0.32em] text-red-600">Media & Content</p><h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-9xl">FAFO <span className="block text-[#D4AF37]">Media</span></h1><div className="mt-8 h-px w-24 bg-red-600" /><p className="mt-8 max-w-3xl text-base font-medium leading-8 text-white/65 sm:text-lg sm:leading-9">FAFO Nation media brings together public video, streaming, community stories, and future original content. Only established public destinations are linked today; additional formats remain planned.</p></div></section>
    <section className="px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32"><div className="mx-auto w-full max-w-7xl"><p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">Available Destinations</p><h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.04em] sm:text-6xl">Watch the Nation</h2><div className="mt-12 grid gap-px border border-white/15 bg-white/15 md:grid-cols-2">{MEDIA_AREAS.map((area) => <Link key={area.href} href={area.href} className="group bg-black p-7 transition hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 sm:p-10"><h3 className="text-2xl font-black uppercase text-[#D4AF37]">{area.title}</h3><p className="mt-4 text-sm leading-7 text-white/55 sm:text-base">{area.detail}</p><span className="mt-8 block text-xs font-black uppercase tracking-[0.18em] text-red-600">Open →</span></Link>)}</div><aside className="mt-8 border border-[#D4AF37]/30 bg-[#D4AF37]/[0.03] p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[0.22em] text-[#D4AF37]">Planned Content</p><p className="mt-4 max-w-4xl text-sm leading-7 text-white/60 sm:text-base">Podcasts, interviews, featured artists, veteran stories, galleries, news, countdowns, game nights, and a content wall remain future public areas. No episodes, partnerships, schedules, or releases are currently claimed.</p></aside></div></section>
  </main>;
}
