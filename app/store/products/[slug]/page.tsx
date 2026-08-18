import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "../../../Header";
import { getProduct, productCapability } from "../../../../lib/catalog";

const tierCopy = {
  DEFAULT: ["Ready to buy", "Select variants and complete purchase through the temporary Printify fallback."],
  PERSONALIZATION: ["Personalize this", "Make approved personal changes to this exact product."],
  CUSTOM_BUILD: ["Custom build this", "Use this exact product as the base for a deeper custom project."],
} as const;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return <main className="min-h-screen bg-black text-white"><Header /><section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2"><Image src={product.image.src} alt={product.image.alt} width={1200} height={1200} className="w-full bg-neutral-950 object-contain" /><div><p className="text-xs font-black uppercase tracking-[.18em] text-red-500">{product.collection.replaceAll("-", " ")}</p><h1 className="mt-5 text-4xl font-black uppercase leading-tight">{product.title}</h1><p className="mt-6 text-2xl font-bold text-[#D4AF37]">{product.priceCad}</p><p className="mt-4 text-sm leading-7 text-white/60">Price shown is the verified public listing price. Product options and purchase are temporarily completed through Printify while native FAFO checkout is prepared.</p><div className="mt-8 grid gap-3" aria-label="Choose how you want this product">{(["DEFAULT", "PERSONALIZATION", "CUSTOM_BUILD"] as const).map((tier) => { const capability = productCapability(product, tier); return <article key={tier} className="border border-white/15 p-5"><p className="text-xs font-black uppercase tracking-[.16em] text-[#D4AF37]">{tierCopy[tier][0]}</p><p className="mt-2 text-sm leading-6 text-white/60">{tierCopy[tier][1]}</p>{capability?.available ? <a href={product.purchase.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center border border-red-600 px-4 text-xs font-black uppercase tracking-[.14em]">Continue to Printify ↗</a> : <p className="mt-4 text-xs font-bold leading-5 text-white/45">{capability?.notice}</p>}</article>; })}</div></div></section></main>;
}
