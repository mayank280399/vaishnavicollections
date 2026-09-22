import type { RecentSale } from "@/lib/dashboard/types";

import { formatCurrency } from "@/lib/dashboard/calculations";

type Props = {
  sales: RecentSale[];
};

export function RecentSales({
  sales,
}: Props) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="font-semibold">
            Recent Sales
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Your latest transactions
          </p>
        </div>

        <button className="text-xs font-medium text-[#A87516] hover:underline">
          View all →
        </button>
      </div>

      {sales.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No recent sales
        </div>
      ) : (
        <div className="divide-y">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between gap-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {sale.invoiceNumber}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  ).format(
                    new Date(
                      sale.purchasedAt
                    )
                  )}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold">
                  {formatCurrency(
                    sale.amount
                  )}
                </p>

                <p className="text-xs text-emerald-600">
                  Profit{" "}
                  {formatCurrency(
                    sale.profit
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}