import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "../Header";

export const metadata: Metadata = {
  title: "About FAFO Nation",
  description:
    "Learn about FAFO Nation, its shared standards, public story, brand ambassador, and long-term vision.",
};

const ABOUT_LINKS = [
  { href: "/about/our-story", title: "Our Story", detail: "How FAFO Nation began and what it stands for." },
  { href: "/about/sgt-swagger", title: "Sgt Swagger", detail: "Meet the official FAFO Nation Brand Ambassador." },
  { href: "/about/long-term-vision", title: "Long-Term Vision", detail: "Explore the proposed direction for future initiatives and programs." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="relative overflow-hidden border-b border-white/10 px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(212,175,55,0.14)_0%,rgba(0,0,0,0)_68%)]" />
        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.45fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600">About</p>
            <h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-9xl">
              FAFO <span className="block text-[#D4AF37]">Nation</span>
            </h1>
            <div className="mt-8 h-px w-24 bg-red-600" />
            <p className="mt-8 max-w-3xl text-base font-medium leading-8 text-white/65 sm:text-lg sm:leading-9">
              Established in 2016, FAFO Nation is a community centered on accountability, resilience, loyalty, camaraderie, and action. Different backgrounds and different stories come together around the shared responsibility to show up and contribute.
            </p>
          </div>
          <Image src="/assets/logos/FAFO Heritage Crest.png" alt="FAFO Nation Heritage Crest" width={520} height={520} priority className="mx-auto h-auto w-full max-w-sm object-contain drop-shadow-[0_0_28px_rgba(212,175,55,0.18)]" />
        </div>
      </section>
      <section className="px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">Explore the Nation</p>
          <h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.04em] sm:text-6xl">Built on Shared Standards</h2>
          <div className="mt-12 grid gap-px border border-white/15 bg-white/15 lg:grid-cols-3">
            {ABOUT_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="group bg-black p-7 transition hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 sm:p-9">
                <h3 className="text-2xl font-black uppercase text-[#D4AF37]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/55 sm:text-base">{item.detail}</p>
                <span className="mt-8 block text-xs font-black uppercase tracking-[0.18em] text-red-600">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
