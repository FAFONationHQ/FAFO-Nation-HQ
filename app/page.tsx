"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import heroBanner from "../assets/hero/hero-banner.jpg";

const WELCOME_AUDIO = "/assets/audio/fafo-nation-welcome-friend.mp3";
const PRIMARY_LOGO =
  "/assets/branding/logos/fafo-nation-primary-logo-master.png";

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
  const welcomeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [welcomeActive, setWelcomeActive] = useState(false);

  const handleWelcome = () => {
    if (welcomeActive) {
      return;
    }

    setWelcomeActive(true);

    const audio =
      welcomeAudioRef.current ?? new Audio(WELCOME_AUDIO);

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

    audio.addEventListener("ended", unlockButton, { once: true });

    window.setTimeout(() => {
      setWelcomeActive(false);
    }, 5000);
  };

  return (
    <>
      <LoadingScreen />

      <main className="min-h-screen bg-black text-white">
        {/* HERO */}
        <section className="relative flex min-h-[600px] h-[100dvh] w-full items-center overflow-hidden">
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
              <p className="mt-3 flex flex-col items-start text-sm font-black uppercase leading-[1.35] tracking-[0.24em] text-white sm:mt-4 sm:text-base lg:text-lg">
                <span className="whitespace-nowrap">
                  More Than a Name
                </span>

                <span className="whitespace-nowrap">
                  A Warning
                </span>
              </p>

              {/* SINGLE HERO ACTION */}
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

          <div className="relative z-