import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../../Header";
import { getProduct, productCapability, type ProductServiceTier } from "../../../../../lib/catalog";
import { galleryRecords } from "../../../../../lib/store/build";

export default async function GalleryPage({ params }: { params: Promise<{ tier: string; slug: string }> }) {
  const { tier, slug } = await params;
  if (tier !== "PERSONALIZATION" && tier !== "CUSTOM_BUILD") notFound();
  const product = getProduct(slug);
  if (!product) notFound();
  if (!productCapability(product, tier as ProductServiceTier)?.available) notFound();
  const buildId = `guest-${tier.toLowerCase()}-${slug}`;
  return <main className="min-h-screen bg-black text-white"><Header /><section className="mx-auto max-w-7xl px-5 py-12 sm:py-16"><p className="text-xs font-black uppercase tracking-[.22em] text-red-500">FAFO Gallery · session build</p><h1 className="mt-4 text-4xl font-black uppercase">Choose a <span className="text-[#D4AF37]">Design Direction</span></h1><p className="mt-5 max-w-3xl leading-7 text-white/60">Browsing for <strong className="text-white">{product.title}</strong>. Your product, {tier.replaceAll("_", " ").toLowerCase()} tier, and build reference {buildId} remain attached to this session.</p><div className="mt-9 border border-white/15 p-6"><h2 className="text-xl font-black uppercase">{galleryRecords.length ? "Approved gallery assets" : "Gallery preparing for approved assets"}</h2><p className="mt-3 max-w-2xl leading-7 text-white/60">{galleryRecords.length ? "Approved assets will be shown with their compatibility and usage rights." : "No approved FAFO gallery assets are published yet. When available, reusable assets will be selectable only when compatible with this product; previous custom work and reference-only assets will be labeled for inspiration, not reuse."}</p><p className="mt-5 text-sm text-white/45">Search, themes, reusable assets, previous custom work, and temporary session favorites will appear when there are real records to search or save.</p></div><div className="mt-7 flex flex-wrap gap-3"><Link href={`/store/build/${tier}/${slug}`} className="inline-flex min-h-11 items-center border border-[#D4AF37]/60 px-4 text-xs font-black uppercase tracking-[.14em] text-[#D4AF37]">Back to build</Link><Link href={`/store/review/${tier}/${slug}`} className="inline-flex min-h-11 items-center border border-white/25 px-4 text-xs font-black uppercase tracking-[.14em]">Review build</Link></div></section></main>;
}
