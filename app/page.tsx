"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import heroBanner from "../assets/hero/hero-banner.jpg";

const WELCOME_AUDIO = "/assets/audio/fafo-nation-welcome-friend.mp3";
const PRIMARY_LOGO =
  "/assets/branding/logos/fafo-nation-primary-logo-master.png";

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
              <p className="mt-3 text-sm font-black uppercase tracking-[0.24em] text-white sm:mt-4 sm:text-base lg:text-lg">
                More Than a Name. A Warning.
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

        {/*
          Temporary scroll destination.

          When we build the next real homepage section,
          this id moves onto that section and this placeholder is removed.
        */}
        <section
          id="home-content"
          aria-label="FAFO Nation homepage content"
          className="min-h-screen bg-black"
        />
      </main>
    </>
  );
}