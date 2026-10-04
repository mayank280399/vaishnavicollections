import React from "react";
import { Gift, ShoppingBag, Star } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ShoppingBag,
    title: "Shop",
    description: "Vaishnavi Collections se shopping karein.",
  },
  {
    number: "02",
    icon: Star,
    title: "Earn",
    description: "Har ₹500 eligible shopping par 1 stamp.",
  },
  {
    number: "03",
    icon: Gift,
    title: "Reward",
    description: "Stamps collect karke rewards paayein.",
  },
];

export default function RewardsHowItWorks() {
  return (
    <section className="border-t border-[#071A35]/6 pt-10 lg:pt-14">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
          How it works
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#071A35] sm:text-3xl">
          Bas 3 simple steps
        </h2>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#071A35]/50">
          VC Rewards ko simple rakha gaya hai — shop karein, stamps earn karein
          aur rewards paayein.
        </p>
      </div>

      <div className="relative mt-7 grid gap-4 md:grid-cols-3">
        {/* Desktop connector */}
        <div className="pointer-events-none absolute left-[17%] right-[17%] top-9 hidden border-t border-dashed border-[#D4AF37]/30 md:block" />

        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.number}
              className="relative rounded-3xl border border-[#071A35]/8 bg-white p-5 text-center shadow-[0_8px_25px_rgba(7,26,53,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(7,26,53,0.07)]"
            >
              <div className="relative mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-[#071A35]">
                <Icon
                  size={25}
                  strokeWidth={1.7}
                  className="text-[#D4AF37]"
                />

                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-[#D4AF37] px-1 text-[8px] font-bold text-[#071A35]">
                  {step.number}
                </span>
              </div>

              <h3 className="mt-4 text-base font-bold text-[#071A35]">
                {step.title}
              </h3>

              <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#071A35]/50">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}