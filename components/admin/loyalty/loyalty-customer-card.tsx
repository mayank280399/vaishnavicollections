"use client";

import {
  Gift,
  Phone,
  ShoppingBag,
  Stamp,
  TrendingUp,
} from "lucide-react";

import type { LoyaltyCustomer } from "@/lib/loyalty/loyalty-types";

type Props = {
  customer: LoyaltyCustomer;
  spendPerStamp: number;
  onView: (customer: LoyaltyCustomer) => void;
};

export function LoyaltyCustomerCard({
  customer,
  spendPerStamp,
  onView,
}: Props) {
  const carry = Number(
    customer.eligible_spend_balance ?? 0
  );

  const progress =
    spendPerStamp > 0
      ? Math.min(
          100,
          Math.round(
            (carry / spendPerStamp) * 100
          )
        )
      : 0;

  const remaining = Math.max(
    0,
    spendPerStamp - carry
  );

  return (
    <button
      type="button"
      onClick={() => onView(customer)}
      className="w-full rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:bg-muted/30 active:scale-[0.99]"
    >
      {/* HEADER */}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">
            {customer.display_name}
          </h3>

          {customer.phone && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span className="truncate">
                {customer.phone}
              </span>
            </div>
          )}

          {!customer.phone && customer.email && (
            <div className="mt-1 truncate text-xs text-muted-foreground">
              {customer.email}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <Stamp className="h-3.5 w-3.5" />
          {customer.points_balance}
        </div>
      </div>

      {/* QUICK STATS */}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShoppingBag className="h-3.5 w-3.5" />
            Purchases
          </div>

          <p className="mt-1 font-semibold">
            {customer.purchase_count}
          </p>
        </div>

        <div className="rounded-xl bg-muted/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Gift className="h-3.5 w-3.5" />
            Lifetime
          </div>

          <p className="mt-1 font-semibold">
            {customer.lifetime_points_earned}
          </p>
        </div>
      </div>

      {/* TOTAL SPENT */}

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Total spent
        </span>

        <span className="font-semibold">
          ₹
          {customer.total_spent.toLocaleString(
            "en-IN"
          )}
        </span>
      </div>

      {/* NEXT STAMP */}

      <div className="mt-4 rounded-xl border bg-primary/[0.03] p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            Next stamp
          </div>

          <span className="text-xs font-semibold">
            ₹
            {carry.toLocaleString("en-IN")}
            /
            {spendPerStamp.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {progress}% complete
          </span>

          <span>
            ₹
            {remaining.toLocaleString("en-IN")} more
          </span>
        </div>
      </div>

      {/* RULE */}

      <p className="mt-3 text-[11px] text-muted-foreground">
        ₹
        {spendPerStamp.toLocaleString("en-IN")} = 1 stamp
      </p>
    </button>
  );
}