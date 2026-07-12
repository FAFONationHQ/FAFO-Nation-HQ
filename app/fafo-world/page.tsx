import Header from "../Header";
import FAFOWorldMap from "./FAFOWorldMap";
import { FAFO_WORLD_STATS } from "./deployments";

const STAT_CARDS = [
  {
    label: "Gear Deployments",
    value: FAFO_WORLD_STATS.gearDeployments,
  },
  {
    label: "Gold Star FAFO",
    value: FAFO_WORLD_STATS.goldStarDeployments,
  },
  {
    label: "Member Locations",
    value: FAFO_WORLD_STATS.memberLocations,
  },
  {
    label: "Countries Reached",
    value: FAFO_WORLD_STATS.countriesReached,
  },
];

export default function FAFOWorldPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <section className="relative overflow-hidden border-b border-white/10 px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(212,175,55,0.14)_0%,rgba(0,0,0,0)_68%)]"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600 sm:text-sm">
            Global Operations
          </p>

          <h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-7xl lg:text-9xl">
            FAFO
            <span className="block text-[#D4AF37]">
              World
            </span>
          </h1>

          <div className="mt-8 h-px w-24 bg-red-600" />

          <p className="mt-8 max-w-3xl text-base font-medium leading-8 text-white/65 sm:text-lg sm:leading-9">
            Track verified FAFO Nation gear deployments and public
            member locations as the Nation grows across borders.
            Deployment activity and member presence remain separate
            so the map can expand without compromising privacy or
            distorting real merchandise activity.
          </p>

          <div className="mt-12 grid grid-cols-2 border-l border-t border-white/15 lg:grid-cols-4">
            {STAT_CARDS.map((stat) => (
              <div
                key={stat.label}
                className="border-b border-r border-white/15 bg-white/[0.02] px-5 py-7 sm:px-7 sm:py-9"
              >
                <p className="text-3xl font-black text-[#D4AF37] sm:text-4xl">
                  {stat.value}
                </p>

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/50 sm:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="fafo-world-map-heading"
        className="px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-600">
              Deployment Map
            </p>

            <h2
              id="fafo-world-map-heading"
              className="mt-4 text-3xl font-black uppercase tracking-[-0.03em] text-white sm:text-5xl"
            >
              The Nation,
              <span className="text-[#D4AF37]">
                {" "}Deployed Worldwide.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/55 sm:text-base">
              Explore verified gear destinations and public FAFO
              member locations. Map positions use city-level
              coordinates and do not expose customer addresses.
            </p>
          </div>

          <FAFOWorldMap />
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-2">
          <article className="border border-white/15 bg-white/[0.02] p-7 sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-red-600">
              Verified Deployments
            </p>

            <h2 className="mt-4 text-3xl font-black uppercase text-white">
              Gear Across the Nation
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/60 sm:text-base">
              Standard deployment markers represent verified FAFO
              Nation gear destinations. Each deployment record is
              counted independently while public map information
              remains limited to city-level geography.
            </p>
          </article>

          <article className="border border-[#D4AF37]/35 bg-white/[0.02] p-7 shadow-[0_0_28px_rgba(212,175,55,0.08)] sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-[#D4AF37]">
              Gold Star FAFO
            </p>

            <h2 className="mt-4 text-3xl font-black uppercase text-white">
              Custom Gear Recognition
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/60 sm:text-base">
              Gold Star FAFO markers identify eligible custom gear
              deployments. The designation is intentionally distinct
              from ordinary merchandise markers and is used with
              respect for the Gold Star family tradition that inspired
              its symbolism.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
