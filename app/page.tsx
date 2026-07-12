"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Header from "./Header";
import LoadingScreen from "./LoadingScreen";
import heroBanner from "../assets/hero/hero-banner.jpg";

const WELCOME_AUDIO =
  "/assets/audio/fafo-nation-welcome-friend.mp3";

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

    audio.addEventListener("ended", unlockButton, {
      once: true,
    });

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
          className="relative z-50 flex h-10 w-full overflow-hidden border-b border-red-600/40 bg-black sm:h-11"
        >
          {/* FIXED TICKER LABEL */}
          <div className="relative z-20 flex shrink-0 items-center border-r border-red-600/50 bg-black px-3 sm:px-5">
            <span
              aria-hidden="true"
              className="mr-2 h-2 w-2 shrink-0 rounded-full bg-red-600"
            />

            <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.18em] text-red-600 sm:text-xs">
              Recently Deployed
            </span>
          </div>

          {/* SCROLLING TICKER ACTIVITY */}
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
                  <span className="px-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#D4AF37] sm:px-7 sm:text-xs">
                    {item}
                  </span>

                  <span
                    aria-hidden="true"
                    className="text-base"
                  >
                    🍁
                  </span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* SITE HEADER / NAVIGATION */}
        <Header />

        {/* HERO */}
        <section className="relative flex min-h-[calc(100dvh-92px)] w-full items-center overflow-hidden">
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
              {/* LOCKED TWO-LINE TAGLINE */}
              <div className="font-black uppercase text-[#D4AF37]">
                <p className="whitespace-nowrap text-sm leading-none tracking-[0.18em] sm:text-base sm:tracking-[0.24em] lg:text-lg">
                  MORE THAN A NAME
                </p>

                <p className="mt-2 whitespace-nowrap text-[1.225rem] leading-none tracking-[0.18em] sm:text-[1.4rem] sm:tracking-[0.24em] lg:text-[1.575rem]">
                  A WARNING...
                </p>
              </div>

              {/* SINGLE HERO ACTION */}
              <button
                type="button"
                onClick={handleWelcome}
                disabled={welcomeActive}
                className="fafo-welcome-cta mt-7 inline-flex min-h-14 items-center justify-center border border-red-600 bg-black/65 px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_0_14px_rgba(220,38,38,0.85)] backdrop-blur-sm transition hover:border-red-500 hover:bg-red-700/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 disabled:cursor-default disabled:opacity-80 sm:px-9 sm:text-sm sm:tracking-[0.18em]"
              >
                Welcome to FAFO, Friend
              </button>
            </div>
          </div>

          {/* SCROLL INDICATOR */}
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
          {/* SUBTLE BACKGROUND ATMOSPHERE */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(127,29,29,0.20)_0%,rgba(0,0,0,0)_68%)]"
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl">
            {/* SECTION INTRO */}
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

             