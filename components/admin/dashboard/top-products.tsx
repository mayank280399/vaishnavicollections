import type { DashboardProduct } from "@/lib/dashboard/types";

type Props = {
  products: DashboardProduct[];
};

export function TopProducts({
  products,
}: Props) {
  const maxRevenue =
    products[0]?.revenue ?? 1;
    console.log("TopProducts products:", products);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="font-semibold">
            Top Products
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Products generating the most revenue
          </p>
        </div>

        <button className="text-xs font-medium text-[#A87516] hover:underline">
          View all →
        </button>
      </div>

      {products.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No product sales available
        </div>
      ) : (
        <div className="space-y-5">
          {products.map((product) => {
            const percentage =
              maxRevenue > 0
                ? (product.revenue /
                    maxRevenue) *
                  100
                : 0;

            return (
              <div
                key={product.productId}
                className="space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {product.productName}
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      {product.quantity > 0
                        ? `${product.quantity} sold`
                        : "Quantity unavailable"}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-semibold">
                    ₹
                    {product.revenue.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[#C9952E] transition-all"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}