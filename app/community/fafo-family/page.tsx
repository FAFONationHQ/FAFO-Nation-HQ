import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../Header";

export const metadata: Metadata = { title: "FAFO Family", description: "Learn about the shared standards and different stories that form the FAFO Nation community." };

const STANDARDS = [
  { title: "Accountability", detail: "Words, choices, and actions carry responsibility." },
  { title: "Resilience", detail: "Challenges are met by continuing to show up and move forward." },
  { title: "Loyalty", detail: "Strong communities are built through trust, contribution, and mutual support." },
  { title: "Action", detail: "Community becomes real when people participate and contribute." },
];

export default function FafoFamilyPage() {
  return <main className="min-h-screen bg-black text-white"><Header /><section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32"><div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[540px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(127,29,29,0.18)_0%,rgba(0,0,0,0)_68%)]" /><div className="relative z-10 mx-auto w-full max-w-7xl"><p className="text-xs font-black uppercase tracking-[0.32em] text-red-600">Community</p><h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-9xl">FAFO <span className="block text-[#D4AF37]">Family</span></h1><div className="mt-8 h-px w-24 bg-red-600" /><p className="mt-8 max-w-3xl text-base font-medium leading-8 text-white/65 sm:text-lg sm:leading-9">Different backgrounds. Different stories. One Nation built by those who show up. FAFO Family describes the people behind the name and the standards they choose to share.</p></div></section><section className="px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32"><div className="mx-auto w-full max-w-7xl"><div className="grid gap-px border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-4">{STANDARDS.map((item) => <article key={item.title} className="bg-black p-7 sm:p-8"><h2 className="text-xl font-black uppercase text-[#D4AF37]">{item.title}</h2><p className="mt-4 text-sm leading-7 text-white/55">{item.detail}</p></article>)}</div><div className="mt-12 border-l-2 border-red-600 pl-6 sm:pl-8"><p className="max-w-4xl text-lg leading-9 text-white/65">Public member profiles are not available yet. Participation and visibility will remain future, member-controlled capabilities rather than assumptions made from private information.</p><Link href="/join" className="mt-8 inline-flex min-h-12 items-center border border-red-600/70 px-7 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37] transition hover:bg-red-700/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600">What It Means to Join</Link></div></div></section></main>;
}
