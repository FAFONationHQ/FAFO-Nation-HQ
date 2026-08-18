import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "../../../lib/catalog";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const hasCustomBuild = product.capabilities.some((capability) => capability.tier === "CUSTOM_BUILD" && capability.available);
  return <article className="group overflow-hidden border border-white/15 bg-white/[0.03]"><Link href={`/store/products/${product.slug}`} className="block"><Image src={product.image.src} alt={product.image.alt} width={960} height={960} className="aspect-square w-full bg-neutral-950 object-contain transition duration-300 group-hover:scale-[1.02]" /></Link><div className="p-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">{product.collection.replaceAll("-", " ")}</p><h3 className="mt-3 text-lg font-black uppercase leading-6 text-white">{product.title}</h3><p className="mt-3 text-sm font-bold text-[#D4AF37]">{product.priceCad}</p><p className="mt-3 text-xs font-bold uppercase tracking-[.14em] text-white/45">Ready to buy{hasCustomBuild ? " · Custom Build available" : ""}</p><Link href={`/store/products/${product.slug}`} className="mt-5 inline-flex min-h-11 items-center border border-red-600/70 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-700/30">View product</Link></div></article>;
}
