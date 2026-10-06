"use client";


import { ArrowLeft, Check, CreditCard, MessageCircle, Smartphone,} from "lucide-react";

import {  SectionIcon,  StepError,  TextareaField,} from "./CheckoutUI";

import type { CheckoutPaymentOption, FormState,} from "@/lib/checkout/types";

export type CheckoutPaymentMethod = CheckoutPaymentOption;

type CheckoutPlaceOrderStepProps = {
  form: FormState;
  error: string;
  submitting: boolean;

  paymentMethod: CheckoutPaymentMethod;
  total: number;
  partialPaymentAmount: number;

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
  partialPaymentAmount,
  onPaymentMethodChange,
  onFieldChange,
  onBack,
}: CheckoutPlaceOrderStepProps) {
  const isFullPayment = paymentMethod === "upi_full";
  const isPartialPayment = paymentMethod === "upi_partial";

  const advanceAmount = Math.min(
    partialPaymentAmount,
    total,
  );

  const remainingAmount = Math.max(
    total - advanceAmount,
    0,
  );

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
            Choose your payment option
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Pay securely through UPI. Your order will be created
            first and you&apos;ll then receive the payment details.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Payment options */}
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Payment option
          </p>

          <div className="space-y-3">
            {/* Full UPI Payment */}
            <button
              type="button"
              onClick={() =>
                onPaymentMethodChange("upi_full")
              }
              disabled={submitting}
              aria-pressed={isFullPayment}
              className={[
                "w-full rounded-2xl border p-4 text-left transition",
                "disabled:cursor-not-allowed disabled:opacity-60",
                isFullPayment
                  ? "border-[#d4af37] bg-[#fffaf0] shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    isFullPayment
                      ? "bg-[#0f1f3d] text-[#d4af37]"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  <Smartphone className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">
                      Full UPI Payment
                    </p>

                    {isFullPayment && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4af37] text-[#0f1f3d]">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Pay the complete order amount through UPI.
                  </p>

                  <p className="mt-2 text-sm font-bold text-[#0f1f3d]">
                    ₹{total.toLocaleString("en-IN")}
                  </p>

                  {isFullPayment && (
                    <div className="mt-3 rounded-xl border border-[#eadfb9] bg-white/70 px-3 py-2.5">
                      <p className="text-xs leading-5 text-slate-600">
                        After your order is created, we&apos;ll show
                        the UPI payment details and QR code.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </button>

            {/* Partial UPI Payment */}
            <button
              type="button"
              onClick={() =>
                onPaymentMethodChange("upi_partial")
              }
              disabled={submitting}
              aria-pressed={isPartialPayment}
              className={[
                "w-full rounded-2xl border p-4 text-left transition",
                "disabled:cursor-not-allowed disabled:opacity-60",
                isPartialPayment
                  ? "border-[#d4af37] bg-[#fffaf0] shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    isPartialPayment
                      ? "bg-[#0f1f3d] text-[#d4af37]"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  <CreditCard className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">
                      Partial UPI Advance
                    </p>

                    {isPartialPayment && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4af37] text-[#0f1f3d]">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Pay a small advance now and the remaining amount
                    later.
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="text-sm font-bold text-[#0f1f3d]">
                      Pay now ₹
                      {advanceAmount.toLocaleString("en-IN")}
                    </p>

                    <p className="text-xs font-medium text-slate-500">
                      Remaining ₹
                      {remainingAmount.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {isPartialPayment && (
                    <div className="mt-3 rounded-xl border border-[#eadfb9] bg-white/70 px-3 py-2.5">
                      <p className="text-xs leading-5 text-slate-600">
                        Your order will be created with the advance
                        payment pending verification. The remaining
                        amount will be due later.
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
                {isFullPayment
                  ? "Full UPI Payment"
                  : "Partial UPI Advance"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">
                {isFullPayment
                  ? "Pay now"
                  : "Advance"}
              </p>

              <p className="mt-1 text-base font-bold text-[#0f1f3d]">
                ₹
                {(isFullPayment
                  ? total
                  : advanceAmount
                ).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {isPartialPayment && (
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-500">
                Remaining amount
              </p>

              <p className="text-sm font-semibold text-slate-700">
                ₹{remainingAmount.toLocaleString("en-IN")}
              </p>
            </div>
          )}
        </div>

        {/* Payment process information */}
        <div className="rounded-2xl border border-[#eadfb9] bg-[#fffaf0] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0f1f3d] text-[#d4af37]">
              <Smartphone className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                How UPI payment works
              </p>

              <ol className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">
                <li>
                  1. We create your order and provide your VC order
                  ID.
                </li>

                <li>
                  2. You pay the selected amount using the displayed
                  UPI QR/details.
                </li>

                <li>
                  3. Tap the WhatsApp confirmation button after
                  making the payment.
                </li>

                <li>
                  4. We verify the payment and confirm your order.
                </li>
              </ol>

              <p className="mt-3 text-xs font-medium leading-5 text-[#8b6f24]">
                Your order is not automatically marked as paid just
                because you click the payment confirmation button.
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
          Your order will be created first. You&apos;ll then be taken
          to the UPI payment instructions.
        </p>
      </div>
    </section>
  );
}
