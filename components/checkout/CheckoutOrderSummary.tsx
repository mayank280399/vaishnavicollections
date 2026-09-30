"use client";

import React from "react";
import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import { CheckoutItem } from "../types";

import { TrustItem } from "./CheckoutUI";

type CheckoutOrderSummaryProps = {
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  total: number;
  totalQuantity: number;

  currentStep: number;
  submitting: boolean;
  showOrderItems: boolean;

  checkoutComplete: boolean;

  onToggleItems: () => void;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => void;
};

function getProductPrice(
  product: CheckoutItem["product"],
) {
  if (
    product.online_enabled &&
    product.online_price !== null &&
    Number(product.online_price) > 0
  ) {
    return Number(product.online_price);
  }

  return Number(product.selling_price);
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function CheckoutOrderSummary({
  items,
  subtotal,
  shipping,
  total,
  totalQuantity,
  currentStep,
  submitting,
  showOrderItems,
  checkoutComplete,
  onToggleItems,
  onSubmit,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <form onSubmit={onSubmit}>
        <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
          {/* Header */}
          <div className="bg-[#0f1f3d] px-5 py-5 text-white sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <ShoppingBag className="h-5 w-5 text-[#d4af37]" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Your order
                  </p>

                  <p className="mt-0.5 text-xs text-white/60">
                    {totalQuantity}{" "}
                    {totalQuantity === 1
                      ? "item"
                      : "items"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleItems}
                className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white lg:hidden"
              >
                Review
                <ChevronDown
                  className={[
                    "h-4 w-4 transition-transform",
                    showOrderItems
                      ? "rotate-180"
                      : "",
                  ].join(" ")}
                />
              </button>
            </div>
          </div>

          {/* Items */}
          <div
            className={[
              "px-5 sm:px-6",
              showOrderItems
                ? "block"
                : "hidden lg:block",
            ].join(" ")}
          >
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const price = getProductPrice(
                  item.product,
                );

                const title =
                  item.product.product_title ||
                  item.product.name;

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 py-4"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <PackageCheck className="h-5 w-5 text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                        {title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-slate-800">
                      {formatPrice(
                        price * item.quantity,
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-medium text-slate-700">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span>Delivery</span>
                <span className="font-semibold text-green-600">
                  {shipping === 0
                    ? "Free"
                    : formatPrice(shipping)}
                </span>
              </div>

              <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                <span className="text-base font-bold text-slate-900">
                  Total
                </span>

                <span className="text-xl font-bold text-[#0f1f3d]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Final CTA */}
            <button
              type="submit"
              disabled={
                currentStep !== 3 ||
                submitting ||
                !checkoutComplete
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f1f3d] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#172b52] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  Place My Order
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
              By placing this order, you confirm that
              the delivery details provided are correct.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <TrustItem
                icon={
                  <ShieldCheck className="h-4 w-4" />
                }
                title="Secure checkout"
              />

              <TrustItem
                icon={
                  <CheckCircle2 className="h-4 w-4" />
                }
                title="Order confirmation"
              />
            </div>
          </div>
        </div>
      </form>
    </aside>
  );
}