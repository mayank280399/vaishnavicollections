"use client";

import React from "react";
import { ArrowLeft, Phone, ShieldCheck, User,} from "lucide-react";
import { Field, RecipientOption, SectionIcon, StepError,} from "./CheckoutUI";
import { Customer, FormState, RecipientMode } from "@/lib/checkout/types";

type CheckoutDetailsStepProps = {
  form: FormState;
  customer: Customer | null;
  recipientMode: RecipientMode;
  saveCustomerDetails: boolean;
  error: string;
  canContinue: boolean;

  onFieldChange: (field: keyof FormState, value: string,) => void;
  onRecipientModeChange: (mode: RecipientMode,) => void;
  onSaveCustomerDetailsChange: (value: boolean,) => void;
  onContinue: () => void;
};

export default function CheckoutDetailsStep({
  form,
  customer,
  recipientMode,
  saveCustomerDetails,
  error,
  canContinue,
  onFieldChange,
  onRecipientModeChange,
  onSaveCustomerDetailsChange,
  onContinue,
}: CheckoutDetailsStepProps) {
  return (
    <div className="space-y-6">
      {/* Recipient */}
      <section className="rounded-[1.75rem] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <SectionIcon>
            <User className="h-5 w-5" />
          </SectionIcon>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#b89445]">
              Step 1
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Who is receiving this order?
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <RecipientOption
            selected={recipientMode === "me"}
            title="I'm receiving it"
            description="Use my details for this order."
            onClick={() =>
              onRecipientModeChange("me")
            }
          />

          <RecipientOption
            selected={
              recipientMode === "someone_else"
            }
            title="Someone else"
            description="It's a gift or for someone else."
            onClick={() =>
              onRecipientModeChange("someone_else")
            }
          />
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#b89445]" />

          <p className="text-xs leading-5 text-slate-500">
            Your details are used only to process and
            deliver your order securely.
          </p>
        </div>
      </section>

      {/* Customer details */}
      <section className="rounded-[1.75rem] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <SectionIcon>
            <Phone className="h-5 w-5" />
          </SectionIcon>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#b89445]">
              Your details
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {recipientMode === "me"
                ? "Tell us how to reach you"
                : "Recipient details"}
            </h2>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <Field
            label={
              recipientMode === "me"
                ? "Your name"
                : "Recipient's name"
            }
            required
            value={form.customerName}
            placeholder="Enter full name"
            onChange={(value) =>
              onFieldChange(
                "customerName",
                value,
              )
            }
          />

          <Field
            label={
              recipientMode === "me"
                ? "Mobile number"
                : "Recipient's mobile number"
            }
            required
            value={form.customerPhone}
            placeholder="10-digit mobile number"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            onChange={(value) =>
              onFieldChange(
                "customerPhone",
                value.replace(/\D/g, ""),
              )
            }
          />

          {recipientMode === "me" && (
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={saveCustomerDetails}
                onChange={(event) =>
                  onSaveCustomerDetailsChange(
                    event.target.checked,
                  )
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#0f1f3d]"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Save my details for future orders
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  We'll remember your name, phone
                  number and city to make your next
                  checkout faster. Your full delivery
                  address is saved with this order only.
                </span>
              </span>
            </label>
          )}

          {recipientMode === "someone_else" && (
            <div className="rounded-2xl bg-[#fffaf0] p-4 text-xs leading-5 text-slate-600">
              Since this order is for someone else, we
              won't change your saved customer details.
            </div>
          )}

          <StepError message={error} />

          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f1f3d] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#172b52] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            Continue to Delivery

            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>

          {!canContinue && (
            <p className="text-center text-xs text-slate-400">
              Enter a valid name and 10-digit mobile
              number to continue.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}