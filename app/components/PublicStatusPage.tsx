import Link from "next/link";
import Header from "../Header";

type PublicStatusPageProps = {
  eyebrow: string;
  title: string;
  accentTitle: string;
  introduction: string;
  statusLabel: string;
  statusText: string;
  backHref: string;
  backLabel: string;
};

export default function PublicStatusPage({
  eyebrow,
  title,
  accentTitle,
  introduction,
  statusLabel,
  statusText,
  backHref,
  backLabel,
}: PublicStatusPageProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white">
        <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[540px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(212,175,55,0.13)_0%,rgba(127,29,29,0.08)_38%,rgba(0,0,0,0)_70%)]" />
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600">{eyebrow}</p>
          <h1 className="mt-5 max-w-6xl break-words text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-9xl">{title}{" "}<span className="block text-[#D4AF37]">{accentTitle}</span></h1>
          <div className="mt-8 h-px w-24 bg-red-600" />
          <p className="mt-8 max-w-3xl text-base font-medium leading-8 text-white/65 sm:text-lg sm:leading-9">{introduction}</p>
        </div>
        </section>
        <section className="px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto w-full max-w-5xl border border-[#D4AF37]/30 bg-[#D4AF37]/[0.03] p-7 text-center sm:p-12">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#D4AF37]">{statusLabel}</p>
          <h2 className="mt-5 text-3xl font-black uppercase sm:text-5xl">Information Coming Later</h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/60">{statusText}</p>
          <Link href={backHref} className="mt-9 inline-flex min-h-12 items-center border border-red-600/70 px-7 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37] transition hover:bg-red-700/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600">{backLabel}</Link>
        </div>
        </section>
      </main>
    </>
  );
}
