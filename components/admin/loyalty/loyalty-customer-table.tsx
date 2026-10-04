"use client";

import {
  Eye,
  Stamp,
  TrendingUp,
} from "lucide-react";

import type { LoyaltyCustomer } from "@/lib/loyalty/loyalty-types";

type Props = {
  customers: LoyaltyCustomer[];
  spendPerStamp?: number;
  onView: (customer: LoyaltyCustomer) => void;
};

export function LoyaltyCustomerTable({
  customers,
  spendPerStamp = 500,
  onView,
}: Props) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                Customer
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Purchases
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Total Spent
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Stamps
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Next Stamp
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Lifetime
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {customers.map((customer) => {
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
                <tr
                  key={customer.id}
                  className="transition hover:bg-muted/20"
                >
                  {/* CUSTOMER */}

                  <td className="px-4 py-4">
                    <div className="font-medium">
                      {customer.display_name}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {customer.phone ||
                        customer.email ||
                        "—"}
                    </div>
                  </td>

                  {/* PURCHASES */}

                  <td className="px-4 py-4 text-right">
                    {customer.purchase_count}
                  </td>

                  {/* TOTAL SPENT */}

                  <td className="px-4 py-4 text-right font-medium">
                    ₹
                    {customer.total_spent.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  {/* CURRENT STAMPS */}

                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      <Stamp className="h-3.5 w-3.5" />
                      {customer.points_balance}
                    </span>
                  </td>

                  {/* NEXT STAMP PROGRESS */}

                  <td className="min-w-[170px] px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />

                      <span className="text-xs font-medium">
                        ₹
                        {carry.toLocaleString(
                          "en-IN"
                        )}
                        /
                        {spendPerStamp.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div className="mt-1.5 ml-auto h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-right text-[11px] text-muted-foreground">
                      ₹
                      {remaining.toLocaleString(
                        "en-IN"
                      )}{" "}
                      more
                    </p>
                  </td>

                  {/* LIFETIME */}

                  <td className="px-4 py-4 text-right">
                    {customer.lifetime_points_earned}
                  </td>

                  {/* ACTION */}

                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onView(customer)}
                      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}