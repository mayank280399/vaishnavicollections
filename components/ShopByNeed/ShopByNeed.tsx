"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

const needs = [
  { title: "For Your Kanha Ji", detail: "Poshak · Shringar · Mukut · Accessories", image: "/banner-image/banner-laddugopal.png", href: "/products?category=Laddu%20Gopal" },
  { title: "For You", detail: "Jewellery · Beauty · Hair Accessories", image: "/banner-image/banner-scrunchies.png", href: "/products" },
  { title: "For Gifting", detail: "Thoughtful gifts for every occasion", image: "/shop.webp", href: "/products" },
  { title: "For Your Home", detail: "Decor · Furnishings · Lifestyle", image: "/banner-image/Banner-homedecor.png", href: "/products?category=Decor" },
];

export default function ShopByNeed() {
  return (
    <section className="bg-[#fbfaf7] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-[#f8f6f1] px-4 py-7 sm:px-7">
        <header className="mb-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b18425]">Shop by need</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-[#10233e] sm:text-3xl">Find what you’re looking for</h2>
          <p className="mt-2 text-xs text-slate-600">Whatever the occasion, we have something special for you.</p>
        </header>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {needs.map((item) => (
            <Link key={item.title} href={item.href} className="group overflow-hidden rounded-xl border border-[#eee8dd] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="relative aspect-[1.55] overflow-hidden">
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 640px) 45vw, 24vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-[#10233e]"><Heart size={13} /></span>
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="text-xs font-semibold text-[#10233e] sm:text-sm">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-xs">{item.detail}</p>
                <span className="mt-2 inline-flex text-[#b18425]"><ArrowRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
