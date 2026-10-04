"use client";

import React from "react";
import {
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  UserRound,
} from "lucide-react";
import { Customer } from "@/app/(storefront)/account/page";


type Props = {
  customer: Customer;
  completion: number;
  onUpdated: () => void;
};

export default function ProfileCompletionCard({
  customer,
  completion,
  onUpdated,
}: Props) {
  const missingFields: string[] = [];

if (!customer.display_name) {
  missingFields.push("name");
}

if (!customer.phone) {
  missingFields.push("phone number");
}

if (!customer.date_of_birth) {
  missingFields.push("date of birth");
}

if (!customer.gender) {
  missingFields.push("gender");
}

if (!customer.address_line1) {
  missingFields.push("address");
}

if (!customer.city) {
  missingFields.push("city");
}

if (!customer.state) {
  missingFields.push("state");
}

if (!customer.postal_code) {
  missingFields.push("PIN code");
}
  const complete = completion >= 100;

  return (
    <section className="overflow-hidden rounded-3xl border border-[#eadfbf] bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#071A35] text-[#D4AF37]">
            {complete ? (
              <CheckCircle2 size={24} />
            ) : (
              <UserRound size={24} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#071A35]">
                  {complete
                    ? "Your profile is complete"
                    : "Let’s complete your profile"}
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {complete
                    ? "Your details are ready for a smoother shopping experience."
                    : "A few details will make checkout and delivery much easier."}
                </p>
              </div>

              <span className="text-sm font-bold text-[#071A35]">
                {completion}%
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#D4AF37] transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>

            {!complete && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#faf8ef] p-3">
                <CircleAlert
                  size={17}
                  className="mt-0.5 shrink-0 text-[#9b7b08]"
                />

                <p className="text-xs leading-5 text-slate-600">
                  Just add your{" "}
                  <span className="font-semibold">
                    {missingFields.slice(0, 3).join(", ")}
                  </span>
                  {missingFields.length > 3
                    ? ` and ${missingFields.length - 3} more detail${
                        missingFields.length - 3 === 1 ? "" : "s"
                      }`
                    : ""}{" "}
                  to finish your profile.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("customer-profile")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });

                onUpdated();
              }}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#071A35]"
            >
              {complete ? "Review your details" : "Complete my profile"}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}