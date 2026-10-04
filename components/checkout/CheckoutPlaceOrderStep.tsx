"use client";

import React from "react";
import {
  ArrowLeft,
  Banknote,
  Check,
  CreditCard,
  MessageCircle,
  Smartphone,
} from "lucide-react";

import {
  SectionIcon,
  StepError,
  TextareaField,
} from "./CheckoutUI";

import { FormState } from "@/lib/checkout/types";

export type CheckoutPaymentMethod = "cod" | "razorpay";

type CheckoutPlaceOrderStepProps = {
  form: FormState;
  error: string;
  submitting: boolean;

  paymentMethod: CheckoutPaymentMethod;
  total: number;

  onPaymentMethodChange: (
    method: CheckoutPaymentMethod,
  ) => void;

  onFieldChange: (
    field: keyof FormState,
    value: string,
  ) => void;

  onBack: () => void;
};

export default function CheckoutPlaceOrderStep({
  form,
  error,
  submitting,
  paymentMethod,
  total,
  onPaymentMethodChange,
  onFieldChange,
  onBack,
}: CheckoutPlaceOrderStepProps) {
  const isCod = paymentMethod === "cod";
  const isOnline = paymentMethod === "razorpay";

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <SectionIcon>
          <CreditCard className="h-5 w-5" />
        </SectionIcon>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#b89445]">
            Step 3 · Payment
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Choose your payment method
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Select how you would like to pay for your order.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Payment methods */}
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Payment method
          </p>

          <div className="space-y-3">
            {/* COD */}
            <button
              type="button"
              onClick={() =>
                onPaymentMethodChange("cod")
              }
              disabled={submitting}
              aria-pressed={isCod}
              className={[
                "w-full rounded-2xl border p-4 text-left transition",
                "disabled:cursor-not-allowed disabled:opacity-60",
                isCod
                  ? "border-[#d4af37] bg-[#fffaf0] shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    isCod
                      ? "bg-[#0f1f3d] text-[#d4af37]"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  <Banknote className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">
                      Cash on Delivery
                    </p>

                    {isCod && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4af37] text-[#0f1f3d]">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Pay when your order is delivered.
                  </p>

                  {isCod && (
                    <p className="mt-2 text-xs font-medium text-[#8b6f24]">
                      No online payment required.
                    </p>
                  )}
                </div>
              </div>
            </button>

            {/* Online Payment */}
            <button
              type="button"
              onClick={() =>
                onPaymentMethodChange("razorpay")
              }
              disabled={submitting}
              aria-pressed={isOnline}
              className={[
                "w-full rounded-2xl border p-4 text-left transition",
                "disabled:cursor-not-allowed disabled:opacity-60",
                isOnline
                  ? "border-[#d4af37] bg-[#fffaf0] shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    isOnline
                      ? "bg-[#0f1f3d] text-[#d4af37]"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  <Smartphone className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">
                      Online Payment
                    </p>

                    {isOnline && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4af37] text-[#0f1f3d]">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Pay securely using UPI, cards or net banking.
                  </p>

                  <p className="mt-2 text-xs font-medium text-slate-500">
                    UPI · PhonePe · Google Pay · Cards · Net Banking
                  </p>

                  {isOnline && (
                    <div className="mt-3 rounded-xl border border-[#eadfb9] bg-white/70 px-3 py-2.5">
                      <p className="text-xs leading-5 text-slate-600">
                        You&apos;ll be redirected to the secure Razorpay
                        payment window after placing the order.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Selected payment summary */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Selected
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {isCod
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">
                Order total
              </p>

              <p className="mt-1 text-base font-bold text-[#0f1f3d]">
                ₹{total.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-[#b89445]" />

            <p className="text-sm font-semibold text-slate-800">
              Order notes
            </p>

            <span className="text-xs text-slate-400">
              Optional
            </span>
          </div>

          <TextareaField
            label="Anything we should know?"
            value={form.notes}
            placeholder="Delivery instructions or special notes"
            onChange={(value: string) => {
              onFieldChange("notes", value);
            }}
          />
        </div>

        <StepError message={error} />

        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Delivery
        </button>

        <p className="text-center text-xs text-slate-400">
          Review your order summary and continue when you&apos;re
          ready.
        </p>
      </div>
    </section>
  );
}