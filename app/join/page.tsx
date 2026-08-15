import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "../Header";

export const metadata: Metadata = {
  title: "Join the Nation",
  description:
    "Learn what it means to join FAFO Nation and how future member access will support participation, recognition, and community.",
};

const MEMBERSHIP_PRINCIPLES = [
  {
    number: "01",
    title: "Show Up",
    description:
      "Strong communities are built by people who participate. Joining the Nation begins with being present, dependable, and willing to take part.",
  },
  {
    number: "02",
    title: "Contribute",
    description:
      "Membership is more than a name or profile. It is a commitment to bring something positive to the community through effort, ideas, support, or action.",
  },
  {
    number: "03",
    title: "Stand Together",
    description:
      "FAFO Nation brings together people with different backgrounds and different stories around shared values: loyalty, respect, accountability, and resilience.",
  },
];

const ACCOUNT_CONCEPTS = [
  {
    title: "Identity",
    description: "A member-controlled FAFO Nation profile and callsign.",
  },
  {
    title: "Participation",
    description:
      "A foundation for future community activity, events, challenges, and contributions.",
  },
  {
    title: "Recognition",
    description:
      "A place for future ranks, achievements, service recognition, and member spotlights.",
  },
];

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <section className="relative overflow-hidden border-b border-white/10 px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[620px] w-[980px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(212,175,55,0.14)_0%,rgba(127,29,29,0.10)_38%,rgba(0,0,0,0)_70%)]"
        />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.65fr] lg:gap-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600 sm:text-sm">
              The Nation
            </p>
            <h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-7xl lg:text-9xl">
              Join the
              <span className="block text-[#D4AF37]">Nation</span>
            </h1>
            <div className="mt-8 h-px w-24 bg-red-600" />
            <p className="mt-8 max-w-3xl text-base font-medium leading-8 text-white/65 sm:text-lg sm:leading-9">
              FAFO Nation is built by people who show up, contribute,
              stand together, and understand that actions have
              consequences. Joining the Nation means becoming part of a
              community grounded in accountability, resilience, loyalty,
              and action.
            </p>

            <div className="mt-10 max-w-2xl border border-red-600/40 bg-red-950/10 p-6 sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D4AF37]">
                Member Accounts — Coming Later
              </p>
              <p className="mt-4 text-sm leading-7 text-white/55 sm:text-base">
                Public member registration is not available yet. This page
                introduces what FAFO Nation membership is intended to
                represent while the account system is being prepared.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute inset-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-3xl sm:h-80 sm:w-80"
            />
            <Image
              src="/assets/logos/FAFO Heritage Crest.png"
              alt="FAFO Nation Heritage Crest"
              width={720}
              height={720}
              priority
              className="relative mx-auto h-auto w-full max-w-[420px] object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.18)]"
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="joining-means-heading"
        className="border-b border-white/10 px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600 sm:text-sm">
              Shared Standards
            </p>
            <h2
              id="joining-means-heading"
              className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl"
            >
              What It Means
              <span className="block text-white/60">to Join</span>
            </h2>
          </div>

          <div className="mt-14 grid border-t border-white/15 sm:mt-20 lg:grid-cols-3">
            {MEMBERSHIP_PRINCIPLES.map((principle) => (
              <article
                key={principle.number}
                className="group border-b border-white/15 py-10 transition-colors duration-300 hover:bg-white/[0.02] lg:border-b-0 lg:border-r lg:px-8 lg:py-14 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <p className="text-xs font-black tracking-[0.24em] text-red-600">
                  {principle.number}
                </p>
                <h3 className="mt-8 text-2xl font-black uppercase tracking-[-0.02em] text-white sm:text-3xl">
                  {principle.title}
                </h3>
                <p className="mt-5 max-w-md text-sm leading-7 text-white/55 sm:text-base">
                  {principle.description}
                </p>
                <div className="mt-8 h-px w-0 bg-red-600 transition-all duration-500 group-hover:w-full" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-1/2 h-[480px] w-[620px] -translate-y-1/2 bg-[radial-gradient(circle,rgba(127,29,29,0.15)_0%,rgba(0,0,0,0)_68%)]"
        />
        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.7fr_1fr] lg:items-start lg:gap-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600 sm:text-sm">
              One Nation
            </p>
            <h2 className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl">
              Different Backgrounds.
              <span className="block text-[#D4AF37]">Shared Values.</span>
            </h2>
          </div>

          <div className="border-l-2 border-red-600 pl-6 sm:pl-8">
            <p className="text-base leading-8 text-white/65 sm:text-lg sm:leading-9">
              FAFO Nation is for people who believe words should mean
              something, choices carry responsibility, and community is
              earned through contribution. Where you come from matters less
              than how you show up and what you choose to build with others.
            </p>
            <p className="mt-6 text-base leading-8 text-white/55 sm:text-lg sm:leading-9">
              Membership is intended to recognize participation without
              requiring members to expose private personal information or
              publicize their location.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="future-access-heading"
        className="border-b border-white/10 px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600 sm:text-sm">
              Member Access
            </p>
            <h2
              id="future-access-heading"
              className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl"
            >
              A Foundation for
              <span className="block text-white/60">Future Participation</span>
            </h2>
            <p className="mt-8 max-w-3xl text-base leading-8 text-white/65 sm:text-lg sm:leading-9">
              Future FAFO Nation member accounts are intended to provide a
              secure home for member identity, participation, recognition,
              and account-controlled public visibility.
            </p>
          </div>

          <div className="mt-14 grid gap-px border border-white/15 bg-white/15 sm:mt-20 lg:grid-cols-3">
            {ACCOUNT_CONCEPTS.map((concept) => (
              <article key={concept.title} className="bg-black p-7 sm:p-9">
                <h3 className="text-xl font-black uppercase tracking-[-0.02em] text-[#D4AF37] sm:text-2xl">
                  {concept.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/55 sm:text-base">
                  {concept.description}
                </p>
              </article>
            ))}
          </div>

          <aside className="mt-8 border border-[#D4AF37]/30 bg-[#D4AF37]/[0.04] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D4AF37]">
              Planned Concept
            </p>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-white/55 sm:text-base">
              These account capabilities are planned concepts, not currently
              available features. Final functionality and access details will
              be published when the member system is ready.
            </p>
          </aside>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto w-full max-w-5xl border border-red-600/35 bg-[radial-gradient(circle_at_top,rgba(127,29,29,0.18),rgba(0,0,0,0)_60%)] px-6 py-14 text-center shadow-[0_0_36px_rgba(220,38,38,0.08)] sm:px-12 sm:py-20">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600">
            Member Account Access — Coming Later
          </p>
          <h2 className="mt-5 text-4xl font-black uppercase leading-none tracking-[-0.04em] text-white sm:text-6xl">
            Ready to Stand
            <span className="block text-[#D4AF37]">With the Nation?</span>
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
            Member account creation is not open yet. Until then, explore
            where FAFO Nation has already been deployed or return to
            headquarters.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/fafo-world"
              className="inline-flex min-h-12 items-center justify-center border border-red-600/70 px-7 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37] shadow-[0_0_12px_rgba(220,38,38,0.45)] transition hover:bg-red-700/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600"
            >
              Explore FAFO World
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center border border-white/20 px-7 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-white/40 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Return Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
