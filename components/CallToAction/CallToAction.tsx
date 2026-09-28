import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="bg-[#fbfaf7] px-4 pb-7 pt-2 sm:px-6 lg:px-8">
      <div className="relative mx-auto flex min-h-40 max-w-6xl flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#0b1d36] px-5 py-8 text-center text-white sm:min-h-48">
        <Image src="/banner-image/Banner-homedecor.png" alt="" fill sizes="100vw" className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1d36]/90 via-[#0b1d36]/65 to-[#b18425]/50" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2b657]">Ready to celebrate?</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold sm:text-3xl">Beautiful things await you</h2>
          <p className="mt-2 text-xs text-white/80">Shop your favourites and bring home something special.</p>
          <Link href="/products" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#e2b657] px-4 py-2 text-xs font-semibold text-[#10233e] hover:bg-[#f0c96f]">Explore all collections <ArrowRight size={14} /></Link>
        </div>
      </div>
    </section>
  );
}
