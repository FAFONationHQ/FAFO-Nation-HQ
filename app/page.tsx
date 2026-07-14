"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Header from "./Header";
import LoadingScreen from "./LoadingScreen";
import heroBanner from "../assets/hero/hero-banner.jpg";

const WELCOME_AUDIO =
  "/assets/audio/fafo-nation-welcome-friend.mp3";

const DEPLOYMENT_TICKER_ITEMS = [
  "FAFO GEAR DEPLOYED • VICTORIA, BRITISH COLUMBIA, CANADA",
  "FAFO GEAR DEPLOYED • TORONTO, ONTARIO, CANADA",
  "FAFO GEAR DEPLOYED • VANCOUVER, BRITISH COLUMBIA, CANADA",
  "GOLD STAR FAFO DEPLOYED • CALGARY, ALBERTA, CANADA",
  "GOLD STAR FAFO DEPLOYED • CEDAR HILLS, UTAH, USA",
  "GOLD STAR FAFO DEPLOYED • CEDAR HILLS, UTAH, USA",
];

const PILLARS = [
  { number: "01", title: "Community", description: "Built by people who show up, stand together, and understand that a strong community is earned through loyalty, contribution, and action." },
  { number: "02", title: "Purpose", description: "FAFO Nation exists to build something bigger than a name—supporting our community, recognizing those who contribute, and turning shared values into real impact." },
  { number: "03", title: "Consequences", description: "Actions matter. Choices matter. FAFO Nation stands for accountability, resilience, and owning the consequences of the path you choose." },
];

export default function Home() {
  const welcomeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [welcomeActive, setWelcomeActive] = useState(false);

  const handleWelcome = () => {
    if (welcomeActive) return;
    setWelcomeActive(true);
    const audio = welcomeAudioRef.current ?? new Audio(WELCOME_AUDIO);
    welcomeAudioRef.current = audio;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    window.setTimeout(() => {
      document.getElementById("home-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
    const unlockButton = () => setWelcomeActive(false);
    audio.addEventListener("ended", unlockButton, { once: true });
    window.setTimeout(() => setWelcomeActive(false), 5000);
  };

  return (
    <>
      <LoadingScreen />
      <main className="min-h-screen text-white">
        <section aria-label="Recently Deployed activity" className="relative z-50 flex h-10 w-full overflow-hidden border-b border-red-600/40 sm:h-11">
          <div className="relative z-20 flex shrink-0 items-center border-r border-red-600/50 px-3 sm:px-5">
            <span aria-hidden="true" className="mr-2 h-2 w-2 shrink-0 rounded-full bg-red-600" />
            <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.18em] text-[#DC2626] sm:text-xs">
              Recently Deployed
            </span>
          </div>
          <div className="relative flex min-w-0 flex-1 items-center overflow-hidden">
            <div className="fafo-deployment-marquee flex w-max shrink-0 items-center whitespace-nowrap">
              {[...DEPLOYMENT_TICKER_ITEMS, ...DEPLOYMENT_TICKER_ITEMS].map((item, index) => (
                <span key={`${item}-${index}`} className="flex shrink-0 items-center">
                  <span className="fafo-ticker-red px-5 text-[10px] font-black uppercase tracking-[0.16em] sm:px-7 sm:text-xs">
                    {item}
                  </span>
                  <span aria-hidden="true" className="fafo-ticker-leaf-gold text-base font-black">🍁︎</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <Header />

        <section className="relative flex min-h-[calc(100dvh-92px)] w-full items-center overflow-hidden">
          <Image src={heroBanner} alt="" fill priority sizes="100vw" className="object-cover object-center" />
          <div className="absolute inset-0/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15" />

          <div className="relative z-10 mx-auto flex w-full max-w-7xl px-5 sm:px-10 lg:absolute lg:inset-0 lg:max-w-none lg:items-end lg:justify-end lg:px-8 lg:pb-4">
            <div className="flex w-full max-w-4xl flex-col items-start pt-[clamp(7rem,18vh,13rem)] lg:w-auto lg:max-w-none lg:items-start lg:pt-0 lg:translate-x-[clamp(3rem,7vw,8rem)]">
              <div className="font-black uppercase bg-transparent">
                <p className="whitespace-nowrap text-[1.3125rem] leading-none tracking-[0.12em] sm:text-[1.5rem] sm:tracking-[0.18em] lg:text-[1.6875rem]">
                  <span className="fafo-force-gold bg-transparent" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.75)" }}>MORE THAN A NAME</span>
                </p>
                <p className="mt-3 whitespace-nowrap text-[2.45rem] leading-none tracking-[0.10em] sm:text-[2.8rem] sm:tracking-[0.16em] lg:text-[3.15rem]">
                  <span className="fafo-force-gold bg-transparent" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.75)" }}>A WARNING...</span>
                </p>
              </div>
              <button type="button" onClick={handleWelcome} disabled={welcomeActive} className="fafo-welcome-cta mt-8 inline-flex min-h-14 items-center justify-center border border-red-600/65 px-7 py-4 text-xs font-black uppercase tracking-[0.16em] shadow-[0_0_14px_rgba(220,38,38,0.85)] backdrop-blur-sm transition hover:border-red-500 hover:bg-red-700/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 disabled:cursor-default disabled:opacity-80 sm:px-9 sm:text-sm sm:tracking-[0.18em]">
                <span className="fafo-force-gold">Welcome to FAFO, Friend</span>
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

        <section id="home-content" aria-labelledby="what-is-fafo-heading" className="relative overflow-hidden border-t border-white/10 px-5 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(127,29,29,0.20)_0%,rgba(0,0,0,0)_68%)]" />
          <div className="relative z-10 mx-auto w-full max-w-7xl">
            <div className="max-w-4xl">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600 sm:text-sm">The Nation</p>
              <h2 id="what-is-fafo-heading" className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl">
                What Is
                <span className="block text-white/35">FAFO Nation?</span>
              </h2>
              <div className="mt-8 h-px w-20 bg-red-600 sm:mt-10" />
              <p className="mt-8 max-w-3xl text-base font-medium leading-8 text-white/65 sm:text-lg sm:leading-9">
                FAFO Nation is a community built around accountability, resilience, loyalty, and action. It is a place for people who believe words mean something, actions have consequences, and strong communities are built by those willing to contribute.
              </p>
            </div>
            <div className="mt-16 grid border-t border-white/15 sm:mt-24 lg:grid-cols-3">
              {PILLARS.map((pillar) => (
                <article key={pillar.number} className="group relative border-b border-white/15 py-10 transition-colors duration-300 hover:bg-neutral-950 lg:border-b-0 lg:border-r lg:px-8 lg:py-14 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-[0.24em] text-red-600">{pillar.number}</span>
                    <span aria-hidden="true" className="text-xl text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-red-600">+</span>
                  </div>
                  <h3 className="mt-8 text-2xl font-black uppercase tracking-[-0.02em] text-white sm:text-3xl">{pillar.title}</h3>
                  <p className="mt-5 max-w-md text-sm leading-7 text-white/55 sm:text-base">{pillar.description}</p>
                  <div className="mt-8 h-px w-0 bg-red-600 transition-all duration-500 group-hover:w-full" />
                </article>
              ))}
            </div>
            <div className="mt-20 border-l-2 border-red-600 pl-6 sm:mt-28 sm:pl-8">
              <p className="max-w-4xl text-xl font-black uppercase leading-tight tracking-[-0.02em] text-white sm:text-3xl lg:text-4xl">
                <span className="block">Different Backgrounds</span>
                <span className="block">All Different Stories</span>
                <span className="block text-white/40">One Nation Built by Those Who Show Up</span>
              </p>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .fafo-force-gold {
          color: #D4AF37 !important;
          -webkit-text-fill-color: #D4AF37 !important;
          background: transparent !important;
          forced-color-adjust: none !important;
        }
        .fafo-ticker-red {
          color: #DC2626 !important;
          -webkit-text-fill-color: #DC2626 !important;
          forced-color-adjust: none !important;
        }
        .fafo-ticker-leaf-gold {
          color: #D4AF37 !important;
          -webkit-text-fill-color: #D4AF37 !important;
          forced-color-adjust: none !important;
        }

        @keyframes fafo-deployment-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes fafo-red-cta-pulse {
          0%, 100% {
            border-color: rgba(220, 38, 38, 0.8);
            box-shadow: 0 0 8px rgba(220, 38, 38, 0.55), 0 0 16px rgba(220, 38, 38, 0.25);
          }
          50% {
            border-color: rgba(239, 68, 68, 1);
            box-shadow: 0 0 16px rgba(220, 38, 38, 1), 0 0 30px rgba(220, 38, 38, 0.55);
          }
        }
        .fafo-deployment-marquee {
          animation: fafo-deployment-scroll 32s linear infinite;
          will-change: transform;
        }
        .fafo-deployment-marquee:hover { animation-play-state: paused; }
        .fafo-welcome-cta { animation: fafo-red-cta-pulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .fafo-deployment-marquee, .fafo-welcome-cta { animation: none; }
          .fafo-deployment-marquee { transform: none; }
        }
      `}</style>
    </>
  );
}
