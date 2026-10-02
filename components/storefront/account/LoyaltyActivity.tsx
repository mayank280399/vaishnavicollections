"use client";

import React from "react";
import {
  ArrowDown,
  ArrowUp,
  History,
  Sparkles,
} from "lucide-react";
import { LoyaltyTransaction } from "@/app/(storefront)/account/page";

type Props = {
  transactions: LoyaltyTransaction[];
};

export default function LoyaltyActivity({
  transactions,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf8ef] text-[#9b7b08]">
            <History size={18} />
          </div>

          <div>
            <h2 className="font-bold text-[#071A35]">
              Reward activity
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your recent loyalty activity
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {transactions.length === 0 ? (
          <div className="py-8 text-center">
            <Sparkles
              size={26}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-semibold text-[#071A35]">
              No reward activity yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Your reward transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const negativeTypes = [
                "REDEEM",
                "REDEEMED",
                "DEBIT",
              ];

              const negative = negativeTypes.includes(
                transaction.type.toUpperCase()
              );

              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      negative
                        ? "bg-red-50 text-red-500"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {negative ? (
                      <ArrowDown size={16} />
                    ) : (
                      <ArrowUp size={16} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#071A35]">
                      {transaction.description ||
                        transaction.type}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {new Date(
                        transaction.created_at
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <p
                    className={`text-sm font-bold ${
                      negative
                        ? "text-red-500"
                        : "text-emerald-600"
                    }`}
                  >
                    {negative ? "-" : "+"}
                    {Math.abs(
                      Number(transaction.amount || 0)
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}