"use client";

import React from "react";
import { ArrowLeft, MapPin } from "lucide-react";

import { FormState } from "../types";

import {
  Field,
  SectionIcon,
  StepError,
} from "./CheckoutUI";

type CheckoutDeliveryStepProps = {
  form: FormState;
  error: string;
  canContinue: boolean;

  onFieldChange: (
    field: keyof FormState,
    value: string,
  ) => void;

  onBack: () => void;
  onContinue: () => void;
};

export default function CheckoutDeliveryStep({
  form,
  error,
  canContinue,
  onFieldChange,
  onBack,
  onContinue,
}: CheckoutDeliveryStepProps) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <SectionIcon>
          <MapPin className="h-5 w-5" />
        </SectionIcon>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#b89445]">
            Step 2 · Delivery
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Where should we deliver it?
          </h2>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <Field
          label="Address"
          required
          value={form.addressLine1}
          placeholder="House / Flat / Street / Area"
          onChange={(value) =>
            onFieldChange(
              "addressLine1",
              value,
            )
          }
        />

        <Field
          label="Landmark"
          value={form.addressLine2}
          placeholder="Nearby landmark (optional)"
          onChange={(value) =>
            onFieldChange(
              "addressLine2",
              value,
            )
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="City"
            required
            value={form.city}
            placeholder="Enter city"
            onChange={(value) =>
              onFieldChange(
                "city",
                value,
              )
            }
          />

          <Field
            label="State"
            required
            value={form.state}
            placeholder="Enter state"
            onChange={(value) =>
              onFieldChange(
                "state",
                value,
              )
            }
          />
        </div>

        <Field
          label="PIN code"
          required
          value={form.postalCode}
          placeholder="6-digit PIN code"
          inputMode="numeric"
          maxLength={6}
          onChange={(value) =>
            onFieldChange(
              "postalCode",
              value.replace(/\D/g, ""),
            )
          }
        />

        <StepError message={error} />

        {/* Navigation */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Back */}
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Details
          </button>

          {/* Continue */}
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#0f1f3d] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#172b52] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            Continue to Place Order

            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>

        {!canContinue && (
          <p className="text-center text-xs text-slate-400">
            Complete your address, city, state and valid
            6-digit PIN code to continue.
          </p>
        )}
      </div>
    </section>
  );
}