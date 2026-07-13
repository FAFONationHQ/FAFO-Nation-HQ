"use client";

import Header from "./Header";
import LoadingScreen from "./LoadingScreen";

const RED = "#DC2626";
const GOLD = "#D4AF37";

function TestRow({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="border-b border-white/20 px-5 py-6"><div className="mb-3 text-sm font-black text-white">TEST {number} — {title}</div>{children}</section>;
}

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="mx-auto w-full max-w-5xl py-6">
          <h1 className="px-5 pb-4 text-3xl font-black uppercase text-white">Xbox Color Rendering Diagnostic</h1>
          <p className="px-5 pb-6 text-sm leading-6 text-white/70">Screenshot this page on the affected Xbox browsers. Compare each numbered test to the solid RED and GOLD reference blocks at the bottom.</p>

          <TestRow number="01" title="TAILWIND TEXT COLOR"><div className="text-3xl font-black text-[#DC2626]">RED SAMPLE</div><div className="text-3xl font-black text-[#D4AF37]">GOLD SAMPLE</div></TestRow>
          <TestRow number="02" title="INLINE CSS COLOR"><div style={{ color: RED }} className="text-3xl font-black">RED SAMPLE</div><div style={{ color: GOLD }} className="text-3xl font-black">GOLD SAMPLE</div></TestRow>
          <TestRow number="03" title="WEBKIT TEXT FILL"><div style={{ color: RED, WebkitTextFillColor: RED }} className="text-3xl font-black">RED SAMPLE</div><div style={{ color: GOLD, WebkitTextFillColor: GOLD }} className="text-3xl font-black">GOLD SAMPLE</div></TestRow>
          <TestRow number="04" title="ISOLATED COMPOSITING LAYER"><div style={{ color: RED, transform: "translateZ(0)", backfaceVisibility: "hidden", filter: "none" }} className="text-3xl font-black">RED SAMPLE</div><div style={{ color: GOLD, transform: "translateZ(0)", backfaceVisibility: "hidden", filter: "none" }} className="text-3xl font-black">GOLD SAMPLE</div></TestRow>
          <TestRow number="05" title="SVG FILL TEXT"><svg viewBox="0 0 800 100" className="h-auto w-full"><text x="10" y="38" fill={RED} fontSize="34" fontWeight="900">RED SAMPLE</text><text x="10" y="82" fill={GOLD} fontSize="34" fontWeight="900">GOLD SAMPLE</text></svg></TestRow>
          <TestRow number="06" title="CSS GRADIENT CLIPPED TEXT"><div style={{ backgroundImage: `linear-gradient(${RED}, ${RED})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }} className="text-3xl font-black">RED SAMPLE</div><div style={{ backgroundImage: `linear-gradient(${GOLD}, ${GOLD})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }} className="text-3xl font-black">GOLD SAMPLE</div></TestRow>
          <TestRow number="07" title="TEXT SHADOW"><div style={{ color: RED, textShadow: `0 0 1px ${RED}` }} className="text-3xl font-black">RED SAMPLE</div><div style={{ color: GOLD, textShadow: `0 0 1px ${GOLD}` }} className="text-3xl font-black">GOLD SAMPLE</div></TestRow>
          <TestRow number="08" title="FORCED COLOR ADJUST OFF"><div style={{ color: RED, forcedColorAdjust: "none" }} className="text-3xl font-black">RED SAMPLE</div><div style={{ color: GOLD, forcedColorAdjust: "none" }} className="text-3xl font-black">GOLD SAMPLE</div></TestRow>
          <TestRow number="09" title="REFERENCE COLOR BLOCKS"><div className="grid grid-cols-2 gap-4"><div style={{ backgroundColor: RED }} className="flex h-28 items-center justify-center text-xl font-black text-black">RED BLOCK</div><div style={{ backgroundColor: GOLD }} className="flex h-28 items-center justify-center text-xl font-black text-black">GOLD BLOCK</div></div></TestRow>
        </div>
      </main>
    </>
  );
}
