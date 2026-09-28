"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, Sparkles, WandSparkles } from "lucide-react";

export default function CustomOrderBanner() {
  return (
    <section className="bg-[#fbfaf7] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl bg-[#f5f0e8] shadow-sm md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-56 sm:min-h-72">
          <Image src="/brands/handmade-design.png" alt="Handcrafted festive embroidery" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b18425]">Made especially for you</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#10233e] sm:text-3xl">Custom creations, just for you</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Looking for something special? We prepare beautiful poshak, shringar, accessories and decor items on order.</p>
            <Link href="/contact" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#e4b653] px-4 py-2.5 text-xs font-semibold text-[#132440] transition hover:bg-[#d5a33d]">Request a custom order <ArrowRight size={15} /></Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 text-xs text-[#30405a] lg:grid-cols-1">
            <li className="flex items-center gap-2"><Sparkles size={16} className="text-[#b18425]" /> Custom poshak</li>
            <li className="flex items-center gap-2"><WandSparkles size={16} className="text-[#b18425]" /> Custom shringar</li>
            <li className="flex items-center gap-2"><Gift size={16} className="text-[#b18425]" /> Personalised gifts</li>
            <li className="flex items-center gap-2"><Sparkles size={16} className="text-[#b18425]" /> Selected decor</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
