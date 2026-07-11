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
      // Continue interaction if playback is unavailable.
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

{/* END SECTION 1 OF 3 */}{/* START SECTION 2 OF 3 */}

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

                Different backgrounds. Different stories.

                <span className="block text-white/40">
                  One Nation built by those who show up.
                </span>

              </p>

            </div>

          </div>

        </section>

        {/* RECENTLY DEPLOYED */}
        <section
          aria-labelledby="recently-deployed-heading"
          className="relative overflow-hidden border-t border-white/10 bg-[#050505] px-5 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-36"
        >

          {/* BACKGROUND GRID */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px]"
          />

          {/* RED ATMOSPHERE */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-[500px] w-[700px] bg-[radial-gradient(circle_at_top_right,rgba(127,29,29,0.18),transparent_65%)]"
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl">

            {/* SECTION HEADER */}
            <div className="flex flex-col gap-8 border-b border-white/15 pb-10 md:flex-row md:items-end md:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <span
                    aria-hidden="true"
                    className="relative flex h-2.5 w-2.5"
                  >
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-60 motion-reduce:animate-none" />

                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                  </span>

                  <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600 sm:text-sm">
                    Nation Activity
                  </p>

                </div>

                <h2
                  id="recently-deployed-heading"
                  className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl"
                >
                  Recently
                  <span className="block text-white/35">
                    Deployed
                  </span>
                </h2>

              </div>

              <p className="max-w-xl text-sm leading-7 text-white/50 sm:text-base">
                FAFO Nation is growing beyond borders. Gear deployments and
                World Map activity represent supporters showing up from across
                the Nation.
              </p>

            </div>

            {/* ACTIVE DEPLOYMENT */}
            <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">

              <div
                aria-live="polite"
                aria-atomic="true"
                className="relative flex min-h-[330px] flex-col justify-between overflow-hidden border border-white/15 bg-black/60 p-6 sm:min-h-[380px] sm:p-10 lg:p-12"
              >

                {/* TOP STATUS */}
                <div className="flex flex-wrap items-center justify-between gap-5">

                  <span className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600 sm:text-xs">
                    {currentDeployment.type}
                  </span>

                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 sm:text-xs">
                    Deployment Logged
                  </span>

                </div>

                {/* MAIN ACTIVITY */}
                <div className="my-14">

                  <p className="text-3xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                    {currentDeployment.message}
                  </p>

                  <div className="mt-7 flex items-center gap-4">

                    <span
                      aria-hidden="true"
                      className="h-px w-10 bg-red-600"
                    />

                    <p className="text-sm font-black uppercase tracking-[0.16em] text-white/55 sm:text-base">
                      {currentDeployment.location}
                    </p>

                  </div>

                </div>

{/* END SECTION 2 OF 3 */}{/* START SECTION 3 OF 3 */}

                {/* ACTIVITY INDEX */}
                <div className="flex items-end justify-between gap-6">

                  <p className="max-w-lg text-xs leading-6 text-white/35 sm:text-sm">
                    Public activity displays general regional information only.
                    Personal customer and financial information is never shown.
                  </p>

                  <span className="text-xs font-black tabular-nums tracking-[0.18em] text-white/25">
                    {String(activeDeployment + 1).padStart(2, "0")}
                    {" / "}
                    {String(DEPLOYMENT_ACTIVITY.length).padStart(2, "0")}
                  </span>

                </div>

                {/* DECORATIVE CORNERS */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-10 w-px bg-red-600"
                />

                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-px w-10 bg-red-600"
                />

                <span
                  aria-hidden="true"
                  className="absolute bottom-0 right-0 h-10 w-px bg-red-600"
                />

                <span
                  aria-hidden="true"
                  className="absolute bottom-0 right-0 h-px w-10 bg-red-600"
                />

              </div>

              {/* DEPLOYMENT SELECTOR */}
              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35 sm:text-xs">
                  Activity Log
                </p>

                <div className="mt-5 border-t border-white/15">

                  {DEPLOYMENT_ACTIVITY.map(
                    (deployment, index) => {

                      const isActive =
                        index === activeDeployment;

                      return (
                        <button
                          key={deployment.id}
                          type="button"
                          onClick={() =>
                            setActiveDeployment(index)
                          }
                          aria-label={`Show activity from ${deployment.location}`}
                          aria-pressed={isActive}
                          className={`group flex w-full items-center gap-4 border-b px-1 py-5 text-left transition ${
                            isActive
                              ? "border-red-600/60"
                              : "border-white/10 hover:border-white/25"
                          }`}
                        >

                          <span
                            className={`text-[10px] font-black tabular-nums tracking-[0.2em] transition ${
                              isActive
                                ? "text-red-600"
                                : "text-white/25 group-hover:text-white/50"
                            }`}
                          >
                            {String(index + 1).padStart(
                              2,
                              "0",
                            )}
                          </span>

                          <span className="min-w-0 flex-1">

                            <span
                              className={`block truncate text-xs font-black uppercase tracking-[0.12em] transition sm:text-sm ${
                                isActive
                                  ? "text-white"
                                  : "text-white/45 group-hover:text-white/70"
                              }`}
                            >
                              {deployment.location}
                            </span>

                            <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-white/25">
                              {deployment.type}
                            </span>

                          </span>

                          <span
                            aria-hidden="true"
                            className={`text-sm transition ${
                              isActive
                                ? "translate-x-0 text-red-600"
                                : "-translate-x-1 text-white/20 group-hover:translate-x-0 group-hover:text-white/50"
                            }`}
                          >
                            →
                          </span>

                        </button>
                      );
                    },
                  )}

                </div>

              </div>

            </div>

            {/* SECTION FOOTER */}
            <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30">
                One Nation. Growing Worldwide.
              </p>

              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
                More deployments incoming.
              </p>

            </div>

          </div>

        </section>

      </main>
    </>
  );
}

/* END SECTION 3 OF 3 */