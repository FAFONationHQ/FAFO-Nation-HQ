"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import heroBanner from "../assets/hero/hero-banner.jpg";

const WELCOME_AUDIO =
  "/assets/audio/fafo-nation-welcome-friend.mp3";

const PRIMARY_LOGO =
  "/assets/branding/logos/fafo-nation-primary-logo-master.png";

const DEPLOYMENT_TICKER_ITEMS = [
  "FAFO GEAR DEPLOYED • BRITISH COLUMBIA, CANADA",
  "FAFO GEAR DEPLOYED • ONTARIO, CANADA",
  "FAFO GEAR DEPLOYED • UTAH, USA",
];

const PILLARS = [
  {
    number: "01",
    title: "Community",
    description:
      "Built by people who show up, stand together, and understand that a strong community is earned through loyalty, contribution, and action.",
  },
  {
    number: "02",
    title: "Purpose",
    description:
      "FAFO Nation exists to build something bigger than a name—supporting our community, recognizing those who contribute, and turning shared values into real impact.",
  },
  {
    number: "03",
    title: "Consequences",
    description:
      "Actions matter. Choices matter. FAFO Nation stands for accountability, resilience, and owning the consequences of the path you choose.",
  },
];

const FAFO_WORLD_FILTERS = [
  {
    id: "gear",
    label: "Gear Deployments",
    shortLabel: "Sales",
    marker: "●",
  },
  {
    id: "custom",
    label: "Custom Deployments",
    shortLabel: "Gold Star FAFO",
    marker: "★",
  },
  {
    id: "traffic",
    label: "Live Traffic",
    shortLabel: "Visitor Activity",
    marker: "◉",
  },
  {
    id: "members",
    label: "Deployed Members",
    shortLabel: "Member Locations",
    marker: "◆",
  },
];

export default function Home() {
  const welcomeAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const [welcomeActive, setWelcomeActive] =
    useState(false);

  const [activeWorldFilters, setActiveWorldFilters] =
    useState<string[]>(
      FAFO_WORLD_FILTERS.map((filter) => filter.id),
    );

  const handleWelcome = () => {
    if (welcomeActive) {
      return;
    }

    setWelcomeActive(true);

    const audio =
      welcomeAudioRef.current ??
      new Audio(WELCOME_AUDIO);

    welcomeAudioRef.current = audio;
    audio.currentTime = 0;

    audio.play().catch(() => {
      // Continue if browser audio playback is unavailable.
    });

    window.setTimeout(() => {
      document
        .getElementById("home-content")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 400);

    const unlockButton = () => {
      setWelcomeActive(false);
    };

    audio.addEventListener(
      "ended",
      unlockButton,
      { once: true },
    );

    window.setTimeout(() => {
      setWelcomeActive(false);
    }, 5000);
  };

  const toggleWorldFilter = (filterId: string) => {
    setActiveWorldFilters((currentFilters) =>
      currentFilters.includes(filterId)
        ? currentFilters.filter((id) => id !== filterId)
        : [...currentFilters, filterId],
    );
  };

  const showAllWorldFilters = () => {
    setActiveWorldFilters(
      FAFO_WORLD_FILTERS.map((filter) => filter.id),
    );
  };

  const allWorldFiltersActive =
    activeWorldFilters.length === FAFO_WORLD_FILTERS.length;

  return (
    <>
      <LoadingScreen />

      <main className="min-h-screen bg-black text-white">
        {/* RECENTLY DEPLOYED TOP TICKER */}
        <section
          aria-label="Recently Deployed activity"
          className="relative z-50 flex h-14 w-full overflow-hidden border-b border-red-600/40 bg-black"
        >
          <div className="relative z-20 flex shrink-0 items-center border-r border-red-600/50 bg-black px-4 sm:px-6">
            <span
              aria-hidden="true"
              className="mr-3 h-2 w-2 shrink-0 rounded-full bg-red-600"
            />

            <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] text-red-600 sm:text-xs">
              Recently Deployed
            </span>
          </div>

          <div className="relative flex min-w-0 flex-1 items-center overflow-hidden">
            <div className="fafo-deployment-marquee flex w-max shrink-0 items-center whitespace-nowrap">
              {[
                ...DEPLOYMENT_TICKER_ITEMS,
                ...DEPLOYMENT_TICKER_ITEMS,
              ].map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="flex shrink-0 items-center"
                >
                  <span className="px-6 text-[10px] font-black uppercase tracking-[0.16em] text-[#D4AF37] sm:px-8 sm:text-xs">
                    {item}
                  </span>

                  <span
                    aria-hidden="true"
                    className="text-red-600"
                  >
                    ★
                  </span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* HERO */}
        <section className="relative flex h-[100dvh] min-h-[600px] w-full items-center overflow-hidden">
          <Image
            src={heroBanner}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15" />

          <div className="relative z-10 mx-auto flex w-full max-w-7xl px-5 sm:px-10 lg:px-16">
            <div className="flex w-full max-w-3xl flex-col items-start">
              <div className="relative w-[min(88vw,680px)]">
                <Image
                  src={PRIMARY_LOGO}
                  alt="FAFO Nation"
                  width={1536}
                  height={1024}
                  priority
                  sizes="(max-width: 640px) 88vw, 680px"
                  className="h-auto w-full object-contain"
                />
              </div>

              <p className="mt-3 flex flex-col items-start text-sm font-black uppercase leading-[1.35] tracking-[0.24em] text-white sm:mt-4 sm:text-base lg:text-lg">
                <span className="whitespace-nowrap">
                  More Than a Name
                </span>

                <span className="whitespace-nowrap">
                  A Warning
                </span>
              </p>

              <button
                type="button"
                onClick={handleWelcome}
                disabled={welcomeActive}
                className="mt-7 inline-flex min-h-14 items-center justify-center border border-red-600/80 bg-black/65 px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm transition hover:border-red-500 hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 disabled:cursor-default disabled:opacity-80 sm:px-9 sm:text-sm sm:tracking-[0.18em]"
              >
                Welcome to FAFO, Friend
              </button>
            </div>
          </div>

          <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">
              <span>Explore</span>
              <span className="h-8 w-px bg-gradient-to-b from-white/70 to-transparent" />
            </div>
          </div>
        </section>

        {/* WHAT IS FAFO NATION */}
        <section
          id="home-content"
          aria-labelledby="what-is-fafo-heading"
          className="relative overflow-hidden border-t border-white/10 bg-black px-5 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(127,29,29,0.20)_0%,rgba(0,0,0,0)_68%)]"
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl">
            <div className="max-w-4xl">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600 sm:text-sm">
                The Nation
              </p>

              <h2
                id="what-is-fafo-heading"
                className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl"
              >
                What Is
                <span className="block text-white/35">
                  FAFO Nation?
                </span>
              </h2>

              <div className="mt-8 h-px w-20 bg-red-600 sm:mt-10" />

              <p className="mt-8 max-w-3xl text-base font-medium leading-8 text-white/65 sm:text-lg sm:leading-9">
                FAFO Nation is a community built around accountability,
                resilience, loyalty, and action. It is a place for people who
                believe words mean something, actions have consequences, and
                strong communities are built by those willing to contribute.
              </p>
            </div>

            <div className="mt-16 grid border-t border-white/15 sm:mt-24 lg:grid-cols-3">
              {PILLARS.map((pillar) => (
                <article
                  key={pillar.number}
                  className="group relative border-b border-white/15 py-10 transition-colors duration-300 hover:bg-neutral-950 lg:border-b-0 lg:border-r lg:px-8 lg:py-14 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-[0.24em] text-red-600">
                      {pillar.number}
                    </span>

                    <span
                      aria-hidden="true"
                      className="text-xl text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-red-600"
                    >
                      +
                    </span>
                  </div>                  <h3 className="mt-8 text-2xl font-black uppercase tracking-[-0.02em] text-white sm:text-3xl">
                    {pillar.title}
                  </h3>

                  <p className="mt-5 max-w-md text-sm leading-7 text-white/55 sm:text-base">
                    {pillar.description}
                  </p>

                  <div className="mt-8 h-px w-0 bg-red-600 transition-all duration-500 group-hover:w-full" />
                </article>
              ))}
            </div>

            <div className="mt-20 border-l-2 border-red-600 pl-6 sm:mt-28 sm:pl-8">
              <p className="max-w-4xl text-xl font-black uppercase leading-tight tracking-[-0.02em] text-white sm:text-3xl lg:text-4xl">
                Different backgrounds. Different stories.

                <span className="block text-white/40">
                  One Nation built by those who show up.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* FAFO WORLD */}
        <section
          id="fafo-world"
          aria-labelledby="fafo-world-heading"
          className="relative overflow-hidden border-t border-white/10 bg-neutral-950 px-5 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40"
        >
          <div className="relative z-10 mx-auto w-full max-w-7xl">
            {/* SECTION HEADER */}
            <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600 sm:text-sm">
                  Global Operations
                </p>

                <h2
                  id="fafo-world-heading"
                  className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-white sm:text-7xl lg:text-9xl"
                >
                  FAFO
                  <span className="block text-white/35">
                    World
                  </span>
                </h2>

                <div className="mt-8 h-px w-20 bg-red-600" />

                <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-[#D4AF37] sm:text-base">
                  The Nation, Deployed Worldwide.
                </p>
              </div>

              <p className="max-w-xl text-sm leading-7 text-white/55 sm:text-base">
                Explore the worldwide reach of FAFO Nation. Filter public,
                privacy-safe activity by gear deployments, eligible custom
                deployments, aggregated visitor activity, and members who
                choose to deploy their public profile to FAFO World.
              </p>
            </div>

            {/* MAP INTEL FILTERS */}
            <div className="mt-16 border border-white/15 bg-black sm:mt-20">
              <div className="flex flex-col border-b border-white/15 lg:flex-row lg:items-center lg:justify-between">
                <div className="px-5 py-5 sm:px-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 sm:text-xs">
                    Map Intel / Filters
                  </p>
                </div>

                <button
                  type="button"
                  onClick={showAllWorldFilters}
                  aria-pressed={allWorldFiltersActive}
                  className="border-t border-white/15 px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.22em] text-white/55 transition hover:text-white lg:border-l lg:border-t-0 lg:px-7"
                >
                  All Activity
                  <span className="ml-3 text-[#D4AF37]">
                    {allWorldFiltersActive ? "ACTIVE" : "SHOW ALL"}
                  </span>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4">
                {FAFO_WORLD_FILTERS.map((filter) => {
                  const isActive =
                    activeWorldFilters.includes(filter.id);

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => toggleWorldFilter(filter.id)}
                      aria-pressed={isActive}
                      className={`flex min-h-28 items-center gap-4 border-b border-white/15 px-5 py-6 text-left transition sm:px-7 lg:border-b-0 lg:border-r lg:last:border-r-0 ${
                        isActive
                          ? "bg-neutral-900 text-white"
                          : "bg-black text-white/40 hover:bg-neutral-950 hover:text-white/70"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`text-xl ${
                          filter.id === "custom"
                            ? "text-[#D4AF37]"
                            : filter.id === "gear"
                              ? "text-red-600"
                              : "text-white/55"
                        }`}
                      >
                        {filter.marker}
                      </span>

                      <span>
                        <span className="block text-xs font-black uppercase tracking-[0.14em]">
                          {filter.label}
                        </span>

                        <span className="mt-2 block text-[10px] uppercase tracking-[0.14em] text-white/30">
                          {filter.shortLabel}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MAP STAGING AREA */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
              <div className="relative flex min-h-[460px] items-center justify-center overflow-hidden border border-white/15 bg-black sm:min-h-[560px]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]"
                />

                <div className="relative z-10 max-w-xl px-8 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
                    Global Map System
                  </p>

                  <p className="mt-6 text-3xl font-black uppercase tracking-[-0.03em] text-white sm:text-5xl">
                    Map Deployment
                    <span className="block text-white/35">
                      Incoming
                    </span>
                  </p>

                  <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-white/45">
                    The interactive FAFO World map engine and verified data
                    layers will be connected in the next controlled deployment.
                  </p>
                </div>
              </div>

              {/* LEGEND AND PRIVACY */}
              <aside className="border border-white/15 bg-black">
                <div className="border-b border-white/15 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-white">
                    Map Legend
                  </p>

                  <div className="mt-6 space-y-5">
                    {FAFO_WORLD_FILTERS.map((filter) => (
                      <div
                        key={filter.id}
                        className="flex items-center gap-4"
                      >
                        <span
                          aria-hidden="true"
                          className={`w-5 text-center text-lg ${
                            filter.id === "custom"
                              ? "text-[#D4AF37]"
                              : filter.id === "gear"
                                ? "text-red-600"
                                : "text-white/55"
                          }`}
                        >
                          {filter.marker}
                        </span>

                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                          {filter.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-b border-white/15 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-[#D4AF37]">
                    Deployed Members
                  </p>

                  <p className="mt-4 text-sm leading-7 text-white/50">
                    Members appear only after making an explicit profile choice
                    to deploy to FAFO World. No option is preselected.
                  </p>

                  <p className="mt-4 text-sm leading-7 text-white/50">
                    Members choose country, province/state, or city visibility
                    and may remove themselves from the map later.
                  </p>
                </div>

                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">
                    Privacy Standard
                  </p>

                  <p className="mt-4 text-sm leading-7 text-white/50">
                    No street addresses, automatic GPS publication, customer
                    names, emails, legal names, revenue, profit, margins, or
                    per-order financial information are displayed publicly.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      {/* TICKER ANIMATION */}
      <style jsx global>{`
        @keyframes fafo-deployment-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .fafo-deployment-marquee {
          animation: fafo-deployment-scroll 32s linear infinite;
          will-change: transform;
        }

        .fafo-deployment-marquee:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .fafo-deployment-marquee {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </>
  );
}