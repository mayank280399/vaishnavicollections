"use client";

import { ArrowLeft, Check, CreditCard, ShieldCheck } from "lucide-react";
import { SectionIcon, StepError, TextareaField } from "./CheckoutUI";
import type { CheckoutPaymentOption, FormState } from "@/lib/checkout/types";

type CheckoutPlaceOrderStepProps = {
  form: FormState;
  error: string;
  submitting: boolean;
  paymentMethod: CheckoutPaymentOption;
  total: number;
  partialPaymentAmount: number;
  onPaymentMethodChange: (method: CheckoutPaymentOption) => void;
  onFieldChange: (field: keyof FormState, value: string) => void;
  onBack: () => void;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CheckoutPlaceOrderStep({
  form,
  error,
  submitting,
  total,
  onFieldChange,
  onBack,
}: CheckoutPlaceOrderStepProps) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <SectionIcon>
          <CreditCard className="h-5 w-5" />
        </SectionIcon>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#b89445]">
            Step 3 · Secure Payment
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Pay securely with Razorpay
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Complete your full payment using UPI, debit or credit cards,
            netbanking, or other methods available in Razorpay Checkout.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#D4AF37]/50 bg-[#fffaf0] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071A35] text-[#D4AF37]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-[#071A35]">Razorpay Secure Checkout</p>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-[#071A35]">
                <Check className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Your order is created first. You will continue to Razorpay to
              complete payment, and the order will only be marked paid after
              the server verifies the transaction.
            </p>
            <p className="mt-3 text-xl font-extrabold text-[#071A35]">
              {formatPrice(total)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Full order amount · INR</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">What happens next?</p>
        <ol className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">
          <li>1. We securely create your order.</li>
          <li>2. Open Razorpay Checkout and choose an available payment method.</li>
          <li>3. Our server verifies the payment before confirming the payment status.</li>
        </ol>
      </div>

      <div className="mt-5">
        <TextareaField
          label="Order notes (optional)"
          value={form.notes}
          placeholder="Delivery instructions or special notes"
          onChange={(value: string) => onFieldChange("notes", value)}
        />
      </div>

      <StepError message={error} />

      <button
        type="button"
        onClick={onBack}
        disabled={submitting}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Delivery
      </button>
      <p className="mt-4 text-center text-xs text-slate-400">
        By continuing, you agree to complete payment securely through Razorpay.
      </p>
    </section>
  );
}
