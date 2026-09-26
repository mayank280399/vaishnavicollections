"use client";

import React from "react";
import Link from "next/link";
import {
  Aperture,
  Send,
  Users,
  ArrowRight,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  LifeBuoy,
} from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#1B263B] text-white">
      {/* =========================================================
          TOP FEATURES
      ========================================================= */}
      <div className="border-b border-white/10 bg-[#162033]">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Feature 1 */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#C88A3D]/25 bg-[#C88A3D]/10 text-[#C88A3D]">
                <Truck size={30} strokeWidth={1.7} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white sm:text-base">
                  Global Shipping
                </h3>
                <p className="mt-1 text-xs text-white/55 sm:text-sm">
                  Free on orders above $150
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#C88A3D]/25 bg-[#C88A3D]/10 text-[#C88A3D]">
                <RotateCcw size={30} strokeWidth={1.7} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white sm:text-base">
                  Easy Returns
                </h3>
                <p className="mt-1 text-xs text-white/55 sm:text-sm">
                  30-day hassle-free policy
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#C88A3D]/25 bg-[#C88A3D]/10 text-[#C88A3D]">
                <ShieldCheck size={30} strokeWidth={1.7} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white sm:text-base">
                  Secure Payment
                </h3>
                <p className="mt-1 text-xs text-white/55 sm:text-sm">
                  100% encrypted checkout
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#C88A3D]/25 bg-[#C88A3D]/10 text-[#C88A3D]">
                <LifeBuoy size={30} strokeWidth={1.7} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white sm:text-base">
                  24/7 Support
                </h3>
                <p className="mt-1 text-xs text-white/55 sm:text-sm">
                  Available all day
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN FOOTER
      ========================================================= */}
      <div className="bg-[#1B263B]">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:gap-12">
            {/* =====================================================
                BRAND
            ===================================================== */}
            <div>
              <Link
                href="/"
                className="inline-flex items-center"
                aria-label="Vaishnavi Collections home"
              >
                <Image
                  src="/vc_white_logo.png"
                  alt="Vaishnavi Collections Logo"
                  width={220}
                  height={74}
                  loading="eager"
                  className="h-auto w-[180px] object-contain sm:w-[210px]"
                />
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
                Curating timeless objects and modern essentials for inspired
                living. We believe in quality over quantity and craftsmanship
                that lasts generations.
              </p>

              {/* Social Links */}
              <div className="mt-6 flex items-center gap-3">
                <Link
                  href="#"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:border-[#C88A3D]/50 hover:bg-[#C88A3D] hover:text-white"
                >
                  <Aperture size={19} />
                </Link>

                <Link
                  href="#"
                  aria-label="Twitter"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:border-[#C88A3D]/50 hover:bg-[#C88A3D] hover:text-white"
                >
                  <Send size={19} />
                </Link>

                <Link
                  href="#"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:border-[#C88A3D]/50 hover:bg-[#C88A3D] hover:text-white"
                >
                  <Users size={19} />
                </Link>
              </div>
            </div>

            {/* =====================================================
                SHOP
            ===================================================== */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#C88A3D]">
                Shop
              </h3>

              <nav className="mt-5 flex flex-col gap-3">
                <Link
                  href="/products"
                  className="text-sm text-white/60 transition-colors duration-200 hover:text-[#C88A3D]"
                >
                  All Products
                </Link>

                <Link
                  href="/products?category=Lighting"
                  className="text-sm text-white/60 transition-colors duration-200 hover:text-[#C88A3D]"
                >
                  Lighting
                </Link>

                <Link
                  href="/products?category=Furniture"
                  className="text-sm text-white/60 transition-colors duration-200 hover:text-[#C88A3D]"
                >
                  Furniture
                </Link>

                <Link
                  href="/products?category=Decor"
                  className="text-sm text-white/60 transition-colors duration-200 hover:text-[#C88A3D]"
                >
                  Decor
                </Link>

                <Link
                  href="/products?category=Textiles"
                  className="text-sm text-white/60 transition-colors duration-200 hover:text-[#C88A3D]"
                >
                  Textiles
                </Link>
              </nav>
            </div>

            {/* =====================================================
                COMPANY
            ===================================================== */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#C88A3D]">
                Company
              </h3>

              <nav className="mt-5 flex flex-col gap-3">
                <Link
                  href="/about"
                  className="text-sm text-white/60 transition-colors duration-200 hover:text-[#C88A3D]"
                >
                  Our Story
                </Link>

                <Link
                  href="/contact"
                  className="text-sm text-white/60 transition-colors duration-200 hover:text-[#C88A3D]"
                >
                  Contact Us
                </Link>

                <Link
                  href="/terms"
                  className="text-sm text-white/60 transition-colors duration-200 hover:text-[#C88A3D]"
                >
                  Terms of Service
                </Link>

                <Link
                  href="/privacy-policy"
                  className="text-sm text-white/60 transition-colors duration-200 hover:text-[#C88A3D]"
                >
                  Privacy Policy
                </Link>

                <Link
                  href="#"
                  className="text-sm text-white/60 transition-colors duration-200 hover:text-[#C88A3D]"
                >
                  Shipping Info
                </Link>
              </nav>
            </div>

            {/* =====================================================
                NEWSLETTER
            ===================================================== */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#C88A3D]">
                Join the Club
              </h3>

              <p className="mt-5 text-sm leading-6 text-white/60">
                Subscribe to receive early access to new drops and design
                inspiration.
              </p>

              <form className="mt-5">
                <div className="flex h-12 overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors focus-within:border-[#C88A3D]/60">
                  <div className="flex items-center pl-4 text-white/40">
                    <Mail size={18} />
                  </div>

                  <input
                    type="email"
                    placeholder="Your email address"
                    required
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/35"
                  />

                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="flex w-12 shrink-0 items-center justify-center bg-[#C88A3D] text-white transition-colors duration-300 hover:bg-[#B77830]"
                  >
                    <ArrowRight size={19} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          BOTTOM BAR
      ========================================================= */}
      <div className="border-t border-white/10 bg-[#162033]">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-white/45 sm:text-sm">
              &copy; {new Date().getFullYear()} Vaishnavi Collections. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}