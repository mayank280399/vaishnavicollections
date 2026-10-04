import React from "react";
import { ArrowUpRight } from "lucide-react";

interface RewardsBenefitCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function RewardsBenefitCard({
  icon,
  title,
  description,
}: RewardsBenefitCardProps) {
  return (
    <div className="group rounded-3xl border border-[#071A35]/8 bg-white p-5 shadow-[0_8px_25px_rgba(7,26,53,0.04)] transition hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(7,26,53,0.08)]">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-xl">
          {icon}
        </div>

        <ArrowUpRight
          size={17}
          className="text-[#071A35]/20 transition group-hover:text-[#D4AF37]"
        />
      </div>

      <h3 className="mt-5 text-sm font-bold text-[#071A35]">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-[#071A35]/50">
        {description}
      </p>
    </div>
  );
}