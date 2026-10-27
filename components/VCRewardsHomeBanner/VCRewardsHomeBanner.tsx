import Link from "next/link";
import { ArrowRight, Gift, Sparkles, Stamp, WalletCards } from "lucide-react";

export default function VCRewardsHomeBanner() {
  return (
    <section
      aria-labelledby="vc-rewards-heading"
      className="relative isolate overflow-hidden bg-[#071A35] px-4 py-12 text-white sm:px-6 sm:py-16"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-[#D4AF37]/20 sm:h-80 sm:w-80" />
        <div className="absolute -right-5 -top-9 h-44 w-44 rounded-full border border-[#D4AF37]/15 sm:h-60 sm:w-60" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#D4AF37]/[0.07] blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E6C76A]">
            <Sparkles size={13} /> The VC Rewards Club
          </p>
          <h2 id="vc-rewards-heading" className="mt-4 max-w-xl font-serif text-3xl font-semibold leading-tight sm:text-4xl">
            A little more joy with every eligible purchase.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
            Keep your loyalty progress in one place, explore member rewards, and see what you can work towards with VC Rewards.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/rewards"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-bold text-[#071A35] transition hover:bg-[#e6c65b] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#071A35]"
            >
              Explore VC Rewards <ArrowRight size={16} />
            </Link>
            <Link
              href="/account"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#D4AF37]/70 hover:bg-white/5"
            >
              <WalletCards size={16} /> View my rewards
            </Link>
          </div>
          <p className="mt-3 text-xs leading-5 text-white/45">
            Reward availability and eligibility are shown in your account. Sign in to view your personal progress.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 sm:items-start lg:p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#D4AF37]/10 text-[#E6C76A]"><Stamp size={21} /></span>
            <div><h3 className="text-sm font-semibold">Track your stamps</h3><p className="mt-1 text-xs leading-5 text-white/60">Follow your eligible-spend progress from your account.</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 sm:items-start lg:p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#D4AF37]/10 text-[#E6C76A]"><Gift size={21} /></span>
            <div><h3 className="text-sm font-semibold">Explore member rewards</h3><p className="mt-1 text-xs leading-5 text-white/60">See available rewards and the points needed to unlock them.</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 sm:items-start lg:p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#D4AF37]/10 text-[#E6C76A]"><Sparkles size={21} /></span>
            <div><h3 className="text-sm font-semibold">Made for VC customers</h3><p className="mt-1 text-xs leading-5 text-white/60">One place to check your rewards journey with Vaishnavi Collections.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
