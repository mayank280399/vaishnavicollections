"use client";

import Image from "next/image";
import Link from "next/link";

const images = [
  { src: "/banner-image/banner-laddugopal.png", alt: "Laddu Gopal collection" },
  { src: "/banner-image/banner-scrunchies.png", alt: "Handmade hair accessories" },
  { src: "/banner-image/banner-chair.jpg", alt: "Handcrafted details" },
  { src: "/banner-image/banner-cosmetics.png", alt: "Beauty collection" },
  { src: "/banner-image/Banner-homedecor.png", alt: "Home decor collection" },
];

export default function InstagramGallery() {
  return (
    <section className="bg-[#fbfaf7] px-4 py-9 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b18425]">Follow us on Instagram</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-[#10233e]">Stay connected</h2>
        <p className="mt-2 text-xs text-slate-600">Get the latest updates, new arrivals and behind the scenes with us.</p>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {images.map((image) => (
            <Link key={image.src} href="https://www.instagram.com/" className="group relative aspect-square overflow-hidden rounded-lg bg-[#eee8dd] sm:aspect-[1.25]">
              <Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 30vw, 17vw" className="object-cover transition duration-500 group-hover:scale-105" />
            </Link>
          ))}
          <Link href="https://www.instagram.com/" className="flex aspect-square flex-col items-center justify-center rounded-lg bg-[#0b1d36] text-[#e2b657] sm:aspect-[1.25]">
            <span className="font-serif text-lg">Follow Us</span><span className="mt-1 text-[10px] text-white/80">@vaishnavicollections</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
