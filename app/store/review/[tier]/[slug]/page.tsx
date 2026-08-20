import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../../Header";
import { buildCapabilityRoute } from "../../../../../lib/store/build-capabilities";
import { resolveBuildContext } from "../../../../../lib/store/build-context";

export default async function ReviewPage({ params }: { params: Promise<{ tier: string; slug: string }> }) {
  const { tier, slug } = await params;
  const context = resolveBuildContext(tier, slug);
  if (!context) notFound();
  const { capability, product } = context;
  return <main className="min-h-screen bg-black text-white"><Header /><section className="mx-auto max-w-3xl px-5 py-12 sm:py-16"><p className="text-xs font-black uppercase tracking-[.22em] text-red-500">Build review · temporary session</p><h1 className="mt-4 text-4xl font-black uppercase">Review your <span className="text-[#D4AF37]">Build</span></h1><dl className="mt-8 divide-y divide-white/10 border-y border-white/15"><div className="py-4"><dt className="text-sm text-white/45">Product</dt><dd className="mt-1 font-bold">{product.title}</dd></div><div className="py-4"><dt className="text-sm text-white/45">Capability</dt><dd className="mt-1 font-bold">{capability}</dd></div><div className="py-4"><dt className="text-sm text-white/45">Design / upload / details</dt><dd className="mt-1">No selections submitted in this guest foundation.</dd></div><div className="py-4"><dt className="text-sm text-white/45">Purchase</dt><dd className="mt-1">Native checkout is not available for this build yet.</dd></div></dl><div className="mt-7 flex flex-wrap gap-3"><Link href={buildCapabilityRoute(capability, product.slug)} className="inline-flex min-h-11 items-center border border-[#D4AF37]/60 px-4 text-xs font-black uppercase tracking-[.14em] text-[#D4AF37]">Return to build</Link><Link href={`/store/products/${product.slug}`} className="inline-flex min-h-11 items-center border border-white/25 px-4 text-xs font-black uppercase tracking-[.14em]">Back to product</Link></div></section></main>;
}
