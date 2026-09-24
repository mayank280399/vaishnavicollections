"use client";

import {
  Eye,
  Stamp,
} from "lucide-react";

import type { LoyaltyCustomer } from "@/lib/loyalty/loyalty-types";

type Props = {
  customers: LoyaltyCustomer[];
  onView: (customer: LoyaltyCustomer) => void;
};

export function LoyaltyCustomerTable({
  customers,
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
                Lifetime
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="transition hover:bg-muted/20"
              >
                <td className="px-4 py-4">
                  <div className="font-medium">
                    {customer.display_name}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {customer.phone || customer.email || "—"}
                  </div>
                </td>

                <td className="px-4 py-4 text-right">
                  {customer.purchase_count}
                </td>

                <td className="px-4 py-4 text-right font-medium">
                  ₹
                  {customer.total_spent.toLocaleString(
                    "en-IN"
                  )}
                </td>

                <td className="px-4 py-4 text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    <Stamp className="h-3.5 w-3.5" />
                    {customer.points_balance}
                  </span>
                </td>

                <td className="px-4 py-4 text-right">
                  {customer.lifetime_points_earned}
                </td>

                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onView(customer)}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}