import Image from "next/image";
import LoadingScreen from "./LoadingScreen";
import heroBanner from "../assets/hero/hero-banner.jpg";

export default function Home() {
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
          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          {/* HERO CONTENT */}
          <div className="relative z-10 mx-auto flex w-full max-w-7xl px-6 sm:px-10 lg:px-16">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-red-600 sm:text-base">
                More Than a Name. A Warning.
              </p>

              <h1 className="text-5xl font-black uppercase leading-[0.88] tracking-tight sm:text-7xl lg:text-8xl">
                FAFO
                <span className="block text-red-600">NATION</span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-relaxed text-zinc-200 sm:text-lg lg:text-xl">
                Built on loyalty, accountability, resilience, and community.
                A worldwide family where actions matter, people matter, and
                consequences are earned.
              </p>

              {/* HERO ACTIONS */}
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#community"
                  className="inline-flex min-h-14 items-center justify-center bg-red-700 px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600"
                >
                  Enter the Nation
                </a>

                <a
                  href="#about"
                  className="inline-flex min-h-14 items-center justify-center border border-white/60 bg-black/30 px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-white backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Our Story
                </a>
              </div>
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
      </main>
    </>
  );
}