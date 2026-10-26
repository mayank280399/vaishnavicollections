"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Gift,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stamp,
  Truck,
} from "lucide-react";

type WelcomePromotion = {
  code: string;
  name: string;
  description: string | null;
  discount_type: "FIXED" | "PERCENTAGE";
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number | null;
  starts_at: string | null;
  ends_at: string | null;
  first_order_only: boolean;
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function discountLabel(promotion: WelcomePromotion) {
  if (promotion.discount_type === "PERCENTAGE") {
    const cap = promotion.maximum_discount_amount
      ? ` (up to ${money(promotion.maximum_discount_amount)})`
      : "";
    return `${promotion.discount_value}% off${cap}`;
  }
  return `${money(promotion.discount_value)} off`;
}

export default function RewardsLandingPage({
  promotion,
}: {
  promotion: WelcomePromotion | null;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  async function copyCode() {
    if (!promotion) return;
    setCopyError("");
    try {
      await navigator.clipboard.writeText(promotion.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError("Please select and copy the code manually.");
    }
  }

  return (
    <div className="overflow-hidden text-[#071A35]">
      <section className="relative isolate overflow-hidden bg-[#071A35] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border border-[#D4AF37]/20 sm:h-[28rem] sm:w-[28rem]" />
          <div className="absolute -right-8 -top-12 h-56 w-56 rounded-full border border-[#D4AF37]/15" />
          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-12 lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-[#E8CE7B]">
              <Sparkles size={14} /> Vaishnavi Collections · Rewards Club
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Your favourites.
              <span className="block text-[#D4AF37]">A little more rewarding.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              Shop thoughtful finds for Laddu Gopal Ji, beautiful home touches,
              beauty essentials and handmade accessories — and keep your eligible
              rewards progress together in your VC account.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-bold text-[#071A35] transition hover:bg-[#e8c95e]">
                Shop the collection <ArrowRight size={17} />
              </Link>
              <Link href="/login?redirect=/account" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#D4AF37]/70 hover:bg-white/5">
                View my rewards
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#D4AF37]" /> Secure checkout</span>
              <span className="inline-flex items-center gap-1.5"><Truck size={14} className="text-[#D4AF37]" /> Pan-India shipping</span>
              <span className="inline-flex items-center gap-1.5"><Heart size={14} className="text-[#D4AF37]" /> Made for VC customers</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 rounded-[2rem] border border-[#D4AF37]/20 rotate-2" />
            <div className="relative rounded-[1.75rem] border border-[#D4AF37]/25 bg-white p-5 text-[#071A35] shadow-2xl shadow-black/20 sm:p-7">
              {promotion ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#f8f2dc] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#80651a]"><Gift size={14} /> Welcome offer</span>
                    <Sparkles className="text-[#C19A2B]" size={21} />
                  </div>
                  <p className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{discountLabel(promotion)}</p>
                  <h2 className="mt-2 text-lg font-bold">{promotion.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {promotion.description || (promotion.first_order_only ? "For eligible first orders." : "A little thank-you for shopping with VC.")}
                  </p>
                  <div className="mt-5 rounded-2xl border-2 border-dashed border-[#D4AF37]/70 bg-[#fffaf0] p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Your coupon code</p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="min-w-0 flex-1 break-all text-xl font-extrabold tracking-[.12em] sm:text-2xl">{promotion.code}</code>
                      <button type="button" onClick={copyCode} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#071A35] px-3 text-xs font-bold text-white transition hover:bg-[#102b52]" aria-label="Copy welcome coupon code">
                        {copied ? <Check size={15} /> : <Copy size={15} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    {promotion.minimum_order_amount > 0 ? `Minimum order: ${money(promotion.minimum_order_amount)}.` : "Check offer eligibility before checkout."}
                    {promotion.first_order_only ? " First order only." : ""}
                    {promotion.ends_at ? ` Offer ends ${new Date(promotion.ends_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.` : ""}
                  </p>
                  {copyError && <p role="status" className="mt-2 text-xs text-amber-800">{copyError}</p>}
                  <Link href="/products" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-3 text-sm font-extrabold text-[#071A35] transition hover:bg-[#e8c95e]">
                    Find your next favourite <ArrowRight size={17} />
                  </Link>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f8f2dc] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#80651a]"><Gift size={14} /> VC Rewards</span>
                  <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">Good finds. Feel-good rewards.</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Explore the collection and sign in to check your rewards progress. New offers appear here when available.</p>
                  <Link href="/products" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#071A35] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#102b52">Shop now <ArrowRight size={17} /></Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9a7a20]">A lovely reason to come back</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Shop what you love. Build your VC journey.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">A simple, welcoming place to explore your rewards and discover something special for your home, your style or your Laddu Gopal Ji.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-[#071A35]/8 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#071A35] text-[#D4AF37]"><Stamp size={23} /></span>
            <h3 className="mt-4 text-lg font-bold">Keep track of your stamps</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Check your eligible shopping progress from your account as your rewards journey grows.</p>
          </article>
          <article className="rounded-2xl border border-[#071A35]/8 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#071A35] text-[#D4AF37]"><Gift size={23} /></span>
            <h3 className="mt-4 text-lg font-bold">Discover reward options</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">See rewards and points information available to your account, without losing track of your progress.</p>
          </article>
          <article className="rounded-2xl border border-[#071A35]/8 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 lg:col-span-1">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#071A35] text-[#D4AF37]"><ShoppingBag size={23} /></span>
            <h3 className="mt-4 text-lg font-bold">Find your next favourite</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Browse Laddu Gopal poshak and shringar, home décor, beauty essentials and handmade hair accessories.</p>
            <Link href="/products" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#8a6c19] hover:text-[#071A35]">Explore products <ArrowRight size={15} /></Link>
          </article>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-3xl border border-[#D4AF37]/30 bg-[#fffaf0] p-5 sm:flex-row sm:items-center sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#8a6c19]">Your rewards, in one place</p>
            <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">Ready to shop with VC?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Sign in to check your account, or head straight to the products and find something you love.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-44">
            <Link href="/products" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#071A35] px-4 py-3 text-sm font-bold text-white hover:bg-[#102b52]">Shop products <ArrowRight size={16} /></Link>
            <Link href="/login?redirect=/account" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#071A35]/15 bg-white px-4 py-3 text-sm font-semibold text-[#071A35] hover:border-[#D4AF37]">Sign in to my account</Link>
          </div>
        </div>
      </section>
      <p className="px-4 pb-8 text-center text-[11px] text-slate-400">VC Rewards · Vaishnavi Collections</p>
    </div>
  );
}
