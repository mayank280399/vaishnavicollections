"use client";

import React from "react";
import { ProgressStep } from "./CheckoutUI";

type CheckoutProgressProps = {
  currentStep: number;
};

export default function CheckoutProgress({
  currentStep,
}: CheckoutProgressProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <ProgressStep
        step={1}
        label="Details"
        active={currentStep === 1}
        completed={currentStep > 1}
      />

      <div
        className={[
          "h-px flex-1",
          currentStep > 1
            ? "bg-[#d4af37]"
            : "bg-white/20",
        ].join(" ")}
      />

      <ProgressStep
        step={2}
        label="Delivery"
        active={currentStep === 2}
        completed={currentStep > 2}
      />

      <div
        className={[
          "h-px flex-1",
          currentStep > 2
            ? "bg-[#d4af37]"
            : "bg-white/20",
        ].join(" ")}
      />

      <ProgressStep
        step={3}
        label="Place order"
        active={currentStep === 3}
        completed={false}
      />
    </div>
  );
}