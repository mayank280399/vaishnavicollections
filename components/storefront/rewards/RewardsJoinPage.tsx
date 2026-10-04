"use client";

import React from "react";
import { ArrowRight, LogIn, ShieldCheck, Sparkles } from "lucide-react";

import RewardsJoinHero from "./RewardsJoinHero";
import RewardsHowItWorks from "./RewardsHowItWorks";
import RewardsBenefitCard from "./RewardsBenefitCard";

export default function RewardsJoinPage() {
  const handleJoin = () => {
  window.location.href = "/login?redirect=/account&rewards=1&source=physicalshop";
};

  const handleLogin = () => {
    // Existing login route will be connected here.
  };

  return (
    <main className="min-h-[100svh] overflow-x-hidden bg-[#faf9f6] text-[#071A35]">
      {/* Desktop background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#D4AF37]/5 blur-3xl" />
        <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-[#071A35]/5 blur-3xl" />
      </div>

      <div className="relative">
        {/* Brand header */}
        <header className="border-b border-[#071A35]/5 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071A35]">
                <Sparkles
                  size={18}
                  strokeWidth={1.8}
                  className="text-[#D4AF37]"
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Vaishnavi Collections
                </p>

                <p className="mt-0.5 text-xs text-[#071A35]/50">
                  VC Rewards
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#071A35]/10 bg-white px-4 text-xs font-semibold text-[#071A35] transition hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5"
            >
              <LogIn size={15} />
              Already a member? Log in
            </button>
          </div>
        </header>

        {/* Main */}
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-6 sm:px-8 sm:pt-10 lg:pb-16 lg:pt-14">
          {/* Hero */}
          <RewardsJoinHero onJoin={handleJoin} />

          {/* How it works */}
          <RewardsHowItWorks />

          {/* Benefits */}
          <section className="mt-10 lg:mt-16">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                More reasons to join
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#071A35] sm:text-3xl">
                Your shopping, your rewards 💛
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#071A35]/55">
                Shop with Vaishnavi Collections and keep your rewards progress
                with you for your future visits.
              </p>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <RewardsBenefitCard
                icon="⭐"
                title="Earn stamps"
                description="Har ₹500 eligible shopping par 1 stamp earn karein."
              />

              <RewardsBenefitCard
                icon="🎁"
                title="Unlock rewards"
                description="Stamps collect karke future shopping par rewards unlock karein."
              />

              <RewardsBenefitCard
                icon="💛"
                title="Keep your progress"
                description="Apni stamps aur rewards progress apne VC account mein dekhein."
              />
            </div>
          </section>

          {/* Trust / CTA */}
          <section className="mt-10 lg:mt-16">
            <div className="relative overflow-hidden rounded-[28px] bg-[#071A35] px-6 py-7 shadow-[0_20px_60px_rgba(7,26,53,0.14)] sm:px-8 lg:px-10 lg:py-9">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-[#D4AF37]/10" />

              <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-[#D4AF37]/5 blur-2xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={17}
                      className="text-[#D4AF37]"
                    />

                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
                      Simple & free
                    </p>
                  </div>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Shopping karo, rewards pao! 💛
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                   Aaj se apni shopping ko aur rewarding banaiye. VC Rewards join karein, eligible purchases par stamps earn karein aur dheere-dheere apne next reward ke aur paas aate jaiye. ⭐
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleJoin}
                  className="inline-flex min-h-[54px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-6 text-sm font-bold text-[#071A35] shadow-[0_8px_25px_rgba(212,175,55,0.18)] transition hover:bg-[#e0bd4d] active:scale-[0.98]"
                >
                  Join VC Rewards
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-8 text-center">
            <p className="text-[11px] text-[#071A35]/35">
              VC Rewards • Vaishnavi Collections
            </p>

            <p className="mt-1 text-[10px] text-[#071A35]/25">
              Shop with us. Earn stamps. Get rewarded. 💛
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}