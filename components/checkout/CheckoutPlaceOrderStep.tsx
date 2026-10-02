"use client";

import React from "react";
import { ArrowLeft, CreditCard, MessageCircle,} from "lucide-react";
import { SectionIcon, StepError, TextareaField,} from "./CheckoutUI";
import { FormState } from "@/lib/checkout/types";

type CheckoutPlaceOrderStepProps = {
  form: FormState;
  error: string;
  submitting: boolean;
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
  onFieldChange,
  onBack,
}: CheckoutPlaceOrderStepProps) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <SectionIcon>
          <CreditCard className="h-5 w-5" />
        </SectionIcon>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#b89445]">
            Step 3 · Place order
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Review your payment
          </h2>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Payment */}
        <div className="rounded-2xl border border-[#d4af37] bg-[#fffaf0] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f1f3d] text-[#d4af37]">
              <CreditCard className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Cash on Delivery
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Pay when your order is delivered.
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
          Review your order summary and click
          <span className="font-semibold text-slate-500">
            {" "}Place My Order{" "}
          </span>
          when you're ready.
        </p>
      </div>
    </section>
  );
}