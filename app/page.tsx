"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import LoadingScreen from "./LoadingScreen";
import heroBanner from "../assets/hero/hero-banner.jpg";

const WELCOME_AUDIO =
  "/assets/audio/fafo-nation-welcome-friend.mp3";

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

/*
  DEMONSTRATION ACTIVITY ONLY.

  Replace this array with verified live activity when the
  Recently Deployed data pipeline is connected.

  Never expose:
  - Customer names
  - Street addresses
  - Email addresses
  - Order totals
  - Revenue
  - Profit
  - Margins
  - Per-order financial information
*/
const DEPLOYMENT_ACTIVITY = [
  {
    id: "deployment-001",
    type: "Gear Deployment",
    location: "British Columbia, Canada",
    message: "FAFO Gear deployed",
  },
  {
    id: "deployment-002",
    type: "World Map",
    location: "Texas, USA",
    message: "New supporter joined the FAFO World Map",
  },
  {
    id: "deployment-003",
    type: "Gear Deployment",
    location: "Ontario, Canada",
    message: "FAFO Gear deployed",
  },
  {
    id: "deployment-004",
    type: "World Map",
    location: "Alberta, Canada",
    message: "New supporter joined the FAFO World Map",
  },
  {
    id: "deployment-005",
    type: "Gear Deployment",
    location: "Washington, USA",
    message: "FAFO Gear deployed",
  },
];

const DEPLOYMENT_ROTATION_MS = 4500;

/*
  VERIFIED FAFO GEAR SALES REGIONS

  These locations are used by the homepage hero ticker.
  Only verified general geographic regions are displayed.

  Never expose customer names, addresses, order values,
  revenue, profit, margins, or per-order financial data.
*/
const VERIFIED_GEAR_DEPLOYMENTS = [
  "British Columbia, Canada",
  "Ontario, Canada",
  "Alberta, Canada",
  "Washington, USA",
  "California, USA",
  "Utah, USA",
];

export default function Home() {
  const welcomeAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const [welcomeActive, setWelcomeActive] =
    useState(false);

  const [activeDeployment, setActiveDeployment] =
    useState(0);

  const [
    deploymentRotationEnabled,
    setDeploymentRotationEnabled,
  ] = useState(true);

  /*
    DETECT REDUCED MOTION PREFERENCE
  */
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const updateMotionPreference = () => {
      setDeploymentRotationEnabled(!mediaQuery.matches);
    };

    updateMotionPreference();

    mediaQuery.addEventListener(
      "change",
      updateMotionPreference,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMotionPreference,
      );
    };
  }, []);

  /*
    AUTOMATIC RECENTLY DEPLOYED ROTATION
  */
  useEffect(() => {
    if (!deploymentRotationEnabled) {
      return;
    }

    let rotationTimer: number | undefined;

    const startRotation = () => {
      window.clearInterval(rotationTimer);

      if (document.hidden) {
        return;
      }

      rotationTimer = window.setInterval(() => {
        setActiveDeployment(
          (current) =>
            (current + 1) %
            DEPLOYMENT_ACTIVITY.length,
        );
      }, DEPLOYMENT_ROTATION_MS);
    };

    const stopRotation = () => {
      window.clearInterval(rotationTimer);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRotation();
        return;
      }

      startRotation();
    };

    startRotation();

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      stopRotation();

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [deploymentRotationEnabled]);

  /*
    HERO WELCOME INTERACTION
  */
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
      // Continue the welcome interaction if audio
      // playback is unavailable.
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

  const currentDeployment =
    DEPLOYMENT_ACTIVITY[activeDeployment];

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

          {/* VERIFIED FAFO GEAR DEPLOYMENT TICKER */}
          <div
            aria-label="Recent FAFO Gear deployments"
            className="absolute left-0 top-0 z-20 w-full overflow-hidden border-b border-white/10 bg-black/75 backdrop-blur-sm"
          >
            <div className="flex min-h-9 items-center">

              <div className="relative z-10 flex min-h-9 shrink-0 items-center gap-2 border-r border-red-600/40 bg-black px-4 sm:px-6">

                <span
                  aria-hidden="true"
                  className="relative flex h-2 w-2"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-60 motion-reduce:animate-none" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
                </span>

                <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.22em] text-red-600 sm:text-[10px]">
                  Recently Deployed
                </span>

              </div>

              <div className="min-w-0 flex-1 overflow-hidden">

                <div className="fafo-deployment-ticker flex w-max items-center">

                  {VERIFIED_GEAR_DEPLOYMENTS.map(
                    (location) => (
                      <span
                        key={location}
                        className="flex min-h-9 shrink-0 items-center whitespace-nowrap px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#D4AF37] sm:px-7 sm:text-[10px]"
                      >
                        FAFO Gear

                        <span
                          aria-hidden="true"
                          className="mx-3 text-red-600"
                        >
                          →
                        </span>

                        {location}

                        <span
                          aria-hidden="true"
                          className="ml-5 text-white/20 sm:ml-7"
                        >
                          //
                        </span>
                      </span>
                    ),
                  )}

                </div>

              </div>

            </div>
          </div>

          {/* HERO CONTENT */}
          <div className="relative z-10 mx-auto flex w-full max-w-7xl px-5 sm:px-10 lg:px-16">

            <div className="flex w-full max-w-3xl flex-col items-start">

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

          {/* BACKGROUND ATMOSPHERE */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(127,29,29,0.20)_0%,rgba(0,0,0,0)_68%)]"
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl">

            {/* SECTION INTRO */}
            <div className="max-w-4xl">

              <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600 sm:text-sm">
                The Nation
              </p