"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import heroBanner from "../assets/hero/hero-banner.jpg";

const WELCOME_AUDIO =
  "/assets/audio/fafo-nation-welcome-friend.mp3";

const PRIMARY_LOGO =
  "/assets/branding/logos/fafo-nation-primary-logo-master.png";

/*
  RECENTLY DEPLOYED TICKER

  These entries are known FAFO Nation merch order locations.

  No customer names, addresses, emails, revenue,
  profit, margins, or per-order financial information
  are displayed publicly.

  Gold Star FAFO is intentionally not used here.
  It remains reserved for eligible custom gear orders.
*/
const DEPLOYMENT_TICKER_ITEMS = [
  "FAFO GEAR DEPLOYED • BRITISH COLUMBIA, CANADA",
  "FAFO GEAR DEPLOYED • ONTARIO, CANADA",
  "FAFO GEAR DEPLOYED • UTAH, USA",
];

/*
  HOMEPAGE PILLARS
*/
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

export default function Home() {
  const welcomeAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const [welcomeActive, setWelcomeActive] =
    useState(false);

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
      // The welcome interaction should still continue
      // if the browser cannot play the sound.
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

  return (
    <>
      <LoadingScreen />

      <main className="min-h-screen bg-black text-white">
        {/* RECENTLY DEPLOYED TOP TICKER */}
        <section
          aria-label="Recently Deployed activity"
          className="relative z-50 flex h-14 w-full overflow-hidden border-b border-red-600/40 bg-black"
        >
          {/* FIXED LABEL */}
          <div className="relative z-20 flex shrink-0 items-center border-r border-red-600/50 bg-black px-4 sm:px-6">
            <span
              aria-hidden="true"
              className="mr-3 h-2 w-2 shrink-0 rounded-full bg-red-600"
            />

            <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] text-red-600 sm:text-xs">
              Recently Deployed
            </span>
          </div>

          {/* SCROLLING ACTIVITY WINDOW */}
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
          {/* HERO BACKGROUND */}
          <Image
            src={heroBanner}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          {/* CINEMATIC READABILITY LAYERS */}
          <div className="absolute inset-0 bg-black/25" />

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15" />

          {/* HERO CONTENT */}
          <div className="relative z-10 mx-auto flex w-full max-w-7xl px-5 sm:px-10 lg:px-16">
            <div className="flex w-full max-w-3xl flex-col items-start">
              {/* PRIMARY LOGO MASTER */}
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

              {/* TAGLINE */}
              <p className="mt-3 flex            </div>

            {/* PILLARS */}
            <div className="mt-16 grid border-t border-white/15 sm:mt-24 lg:grid-cols-3">
              {PILLARS.map((pillar) => (
                <article
                  key={pillar.number}
                  className="group relative border-b border-white/15 py-10 transition-colors duration-300 hover:bg-white/[0.03] lg:border-b-0 lg:border-r lg:px-8 lg:py-14 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
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
                  </div>

                  <h3 className="mt-8 text-2xl font-black uppercase tracking-[-0.02em] text-white sm:text-3xl">
                    {pillar.title}
                  </h3>

                  <p className="mt-5 max-w-md text-sm leading-7 text-white/55 sm:text-base">
                    {pillar.description}
                  </p>

                  <div className="mt-8 h-px w-0 bg-red-600 transition-all duration-500 group-hover:w-full" />
                </article>
              ))}
            </div>

            {/* CLOSING STATEMENT */}
            <div className="mt-20 border-l-2 border-red-600 pl-6 sm:mt-28 sm:pl-8">
              <p className="max-w-4xl text-xl font-black uppercase leading-tight tracking-[-0.02em] text-white sm:text-3xl lg:text-4xl">
                Different