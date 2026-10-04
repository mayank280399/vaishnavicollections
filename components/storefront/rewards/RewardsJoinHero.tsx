"use client";

import React from "react";
import {
  ArrowRight,
  Gift,
  Sparkles,
  Star,
  Check,
} from "lucide-react";

interface RewardsJoinHeroProps {
  onJoin: () => void;
}

export default function RewardsJoinHero({
  onJoin,
}: RewardsJoinHeroProps) {
  return (
    <section className="lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
      {/* Left content */}
      <div className="py-7 sm:py-10 lg:py-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5">
          <Gift size={14} className="text-[#D4AF37]" />

          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#071A35]">
            VC Rewards
          </span>
        </div>

        <h1 className="mt-5 max-w-2xl text-[34px] font-bold leading-[1.08] tracking-tight text-[#071A35] sm:text-5xl lg:text-[58px]">
          Shopping karo
          <span className="block text-[#D4AF37]">
            reward pao! 💛
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-6 text-[#071A35]/60 sm:text-base sm:leading-7">
          Vaishnavi Collections ke saath shop karein, stamps earn karein
          aur future shopping par rewards paayein.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#071A35]/5 px-3.5 py-2 text-xs font-medium text-[#071A35]/70">
            <Check size={14} className="text-[#D4AF37]" />
            Free to join
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#071A35]/5 px-3.5 py-2 text-xs font-medium text-[#071A35]/70">
            <Check size={14} className="text-[#D4AF37]" />
            Takes about 1 minute
          </div>
        </div>

        <button
          type="button"
          onClick={onJoin}
          className="mt-7 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#071A35] px-6 text-sm font-bold text-white shadow-[0_10px_30px_rgba(7,26,53,0.16)] transition hover:bg-[#0b2347] active:scale-[0.98] sm:w-auto sm:min-w-[210px]"
        >
          Join VC Rewards
          <ArrowRight size={18} />
        </button>

        <p className="mt-3 text-center text-[10px] text-[#071A35]/35 sm:text-left">
          Already have an account? Use the Log in button above.
        </p>
      </div>

      {/* Right rewards visual */}
      <div className="pb-7 pt-3 sm:pb-10 lg:py-8">
        <div className="relative mx-auto max-w-[470px]">
          {/* Glow */}
          <div className="absolute inset-8 rounded-[40px] bg-[#D4AF37]/10 blur-3xl" />

          {/* Main card */}
          <div className="relative overflow-hidden rounded-[32px] bg-[#071A35] p-6 shadow-[0_25px_70px_rgba(7,26,53,0.2)] sm:p-8">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-[#D4AF37]/15" />

            <div className="pointer-events-none absolute -right-4 top-12 h-28 w-28 rounded-full border border-[#D4AF37]/10" />

            <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#D4AF37]/5 blur-2xl" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                    Vaishnavi Collections
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    VC Rewards
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4AF37]">
                  <Sparkles
                    size={19}
                    className="text-[#071A35]"
                  />
                </div>
              </div>

              {/* Stamp progress visual */}
              <div className="mt-9">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-white/50">
                      Your rewards journey
                    </p>

                    <p className="mt-1 text-2xl font-bold text-white">
                      Shop → Earn → Reward
                    </p>
                  </div>

                  <Star
                    size={25}
                    fill="currentColor"
                    className="text-[#D4AF37]"
                  />
                </div>

                <div className="mt-6 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className="flex aspect-square items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-white/[0.05]"
                    >
                      <Star
                        size={17}
                        className="text-[#D4AF37]/60"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rule */}
              <div className="mt-7 rounded-2xl border border-[#D4AF37]/20 bg-white/[0.06] p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]">
                    <Star
                      size={22}
                      fill="currentColor"
                      className="text-[#071A35]"
                    />
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-white">
                      ₹500 = 1 stamp
                    </p>

                    <p className="mt-1 text-[11px] text-white/45">
                      Eligible shopping par
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-white/65">
                <Sparkles
                  size={14}
                  className="text-[#D4AF37]"
                />

                Aaj ka purchase bhi count ho sakta hai!
              </div>
            </div>
          </div>

          {/* Floating mini card */}
          <div className="absolute -bottom-4 -left-2 hidden rounded-2xl border border-[#071A35]/8 bg-white px-4 py-3 shadow-[0_12px_35px_rgba(7,26,53,0.12)] sm:flex sm:items-center sm:gap-3 lg:-left-7">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/15">
              <Gift
                size={17}
                className="text-[#D4AF37]"
              />
            </div>

            <div>
              <p className="text-[10px] text-[#071A35]/40">
                Your shopping
              </p>

              <p className="text-xs font-bold text-[#071A35]">
                Can earn rewards 💛
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}