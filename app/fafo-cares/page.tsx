import type { Metadata } from "next";
import Link from "next/link";
import Header from "../Header";

export const metadata: Metadata = {
  title: "FAFO Cares",
  description: "Learn about the community-support purpose and current public status of FAFO Cares.",
};

const CARES_PRINCIPLES = [
  { title: "Community", detail: "Support begins with people showing up for one another and treating real needs with respect." },
  { title: "Purpose", detail: "FAFO Cares is intended to connect community action with meaningful causes and responsible fundraising." },
  { title: "Accountability", detail: "Future campaigns and resources must be published with clear, approved information rather than unsupported promises." },
];

export default function FafoCaresPage() {
  return <main className="min-h-screen bg-black text-white"><Header />
    <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32"><div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[920px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(220,38,38,0.18)_0%,rgba(127,29,29,0.10)_36%,rgba(0,0,0,0)_70%)]" /><div className="relative z-10 mx-auto w-full max-w-7xl"><p className="text-xs font-black uppercase tracking-[0.32em] text-red-500">Community Support</p><h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-9xl">FAFO <span className="block text-[#D4AF37]">Cares</span></h1><div className="mt-8 h-px w-24 bg-red-600" /><p className="mt-8 max-w-3xl text-base font-medium leading-8 text-white/65 sm:text-lg sm:leading-9">FAFO Cares represents the Nation’s commitment to supporting community through fundraising and meaningful causes. Public programs, campaigns, and assistance workflows require approved operational details before they can be presented as active.</p></div></section>
    <section className="px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32"><div className="mx-auto w-full max-w-7xl"><div className="grid gap-px border border-white/15 bg-white/15 lg:grid-cols-3">{CARES_PRINCIPLES.map((item) => <article key={item.title} className="bg-black p-7 sm:p-9"><h2 className="text-2xl font-black uppercase text-[#D4AF37]">{item.title}</h2><p className="mt-5 text-sm leading-7 text-white/55 sm:text-base">{item.detail}</p></article>)}</div><aside className="mt-8 border border-red-600/40 bg-red-950/10 p-7 sm:p-9"><p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">Important Current Status</p><h2 className="mt-4 text-2xl font-black uppercase sm:text-3xl">Informational Only</h2><p className="mt-5 max-w-4xl text-sm leading-7 text-white/60 sm:text-base">The website does not currently provide emergency services, crisis intervention, medical guidance, aid eligibility, applications, donation processing, or funding promises. Approved resources and operational programs will be published only when their details are ready.</p></aside><div className="mt-10"><Link href="/" className="inline-flex min-h-12 items-center border border-red-600/70 px-7 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37] transition hover:bg-red-700/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600">Return Home</Link></div></div></section>
  </main>;
}
