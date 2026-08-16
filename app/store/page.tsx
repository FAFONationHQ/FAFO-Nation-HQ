import type { Metadata } from "next";
import Link from "next/link";
import Header from "../Header";
import { publishedProducts } from "../../lib/catalog";
import { ProductCard } from "./_components/ProductCard";

export const metadata: Metadata = { title: "FAFO Nation Store", description: "Current public access and status information for FAFO Nation gear." };

export default function StorePage() { return <main className="min-h-screen bg-black text-white"><Header /><section className="border-b border-white/10 px-5 py-16 sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[.28em] text-red-500">FAFO Nation Store</p><h1 className="mt-4 text-5xl font-black uppercase sm:text-7xl">Remastered <span className="text-[#D4AF37]">Gear</span></h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">Approved FAFO Nation merchandise ready to browse. Purchases are completed on Printify.</p><Link href="/store/collections" className="mt-8 inline-flex border border-[#D4AF37]/60 px-5 py-3 text-xs font-black uppercase tracking-[.15em] text-[#D4AF37]">Browse collections</Link></div></section><section className="px-5 py-14 sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><div className="mb-8 flex items-end justify-between"><h2 className="text-3xl font-black uppercase">Store V1</h2><p className="text-sm text-white/50">{publishedProducts.length} approved listings</p></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{publishedProducts.map((product) => <ProductCard key={product.slug} product={product} />)}</div></div></section></main>; }
