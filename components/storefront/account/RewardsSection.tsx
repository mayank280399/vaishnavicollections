"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Gift, LockKeyhole, Sparkles } from "lucide-react";
import { Reward } from "@/app/(storefront)/account/page";

type Props = { rewards: Reward[]; pointsBalance: number };

export default function RewardsSection({ rewards, pointsBalance }: Props) {
  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2"><Sparkles size={17} className="text-[#9b7b08]" /><span className="text-xs font-semibold uppercase tracking-wider text-[#9b7b08]">Rewards</span></div>
          <h2 className="mt-1 text-xl font-bold text-[#071A35]">Rewards you can unlock</h2>
          <p className="mt-1 text-xs text-slate-500">Your current stamp balance is {pointsBalance.toLocaleString("en-IN")}.</p>
        </div>
        <Link href="/account/rewards" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#D4AF37]/60 px-3 py-2 text-xs font-semibold text-[#071A35] transition hover:bg-[#faf7e9]">View full rewards dashboard <ArrowRight size={14} /></Link>
      </div>

      {!rewards.length ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf8ef] text-[#9b7b08]"><Gift size={19} /></div><div><h3 className="font-bold text-[#071A35]">No active rewards right now</h3><p className="text-xs text-slate-500">Your stamp balance is still tracked. New reward options will appear here when activated.</p></div></div></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => {
            const unlocked = pointsBalance >= reward.points_required;
            return <div key={reward.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${unlocked ? "border-[#eadfbf]" : "border-slate-200"}`}>
              <div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071A35] text-[#D4AF37]">{unlocked ? <Gift size={20} /> : <LockKeyhole size={19} />}</div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${unlocked ? "bg-[#f8f2d9] text-[#8b6d05]" : "bg-slate-100 text-slate-500"}`}>{unlocked ? "THRESHOLD REACHED" : "KEEP EARNING"}</span></div>
              <h3 className="mt-4 font-bold text-[#071A35]">{reward.name}</h3>
              <p className="mt-2 text-sm text-slate-500">{reward.reward_type === "PERCENTAGE_DISCOUNT" ? `${reward.reward_value}% off` : `₹${Number(reward.reward_value).toLocaleString("en-IN")} off`}</p>
              <div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs text-slate-400">Required stamps</p><p className="mt-0.5 text-sm font-bold text-[#071A35]">{reward.points_required.toLocaleString("en-IN")}</p>{reward.minimum_purchase != null && <p className="mt-1 text-xs text-slate-500">Minimum purchase ₹{Number(reward.minimum_purchase).toLocaleString("en-IN")}</p>}</div>
            </div>;
          })}
        </div>
      )}
    </section>
  );
}
