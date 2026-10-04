"use client";

import React from "react";
import {
  ArrowRight,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { RecentOrder } from "@/app/(storefront)/account/page";

type Props = {
  orders: RecentOrder[];
};

export default function RecentOrders({
  orders,
}: Props) {
  const router = useRouter();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 className="font-bold text-[#071A35]">
            Recent orders
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your latest purchases
          </p>
        </div>

        {orders.length > 0 && (
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#071A35]"
          >
            View all
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="p-5">
        {orders.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingBag
              size={28}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-semibold text-[#071A35]">
              No orders yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Your purchases will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#071A35]">
                  <Package size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#071A35]">
                    {order.sale_number
                      ? `Order ${order.sale_number}`
                      : "Order"}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {new Date(
                      order.created_at
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-[#071A35]">
                    ₹
                    {Number(
                      order.total_amount || 0
                    ).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase text-slate-400">
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}