"use client";

import {
  CheckCircle2,
  MessageCircle,
} from "lucide-react";

type PaymentConfirmationButtonProps = {
  whatsappUrl: string;
};

export default function PaymentConfirmationButton({
  whatsappUrl,
}: PaymentConfirmationButtonProps) {
  function openWhatsApp() {
    if (!whatsappUrl) {
      return;
    }

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <button
      type="button"
      onClick={openWhatsApp}
      className="relative z-10 flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-5 py-4 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/30 active:scale-[0.99]"
      aria-label="I've paid — confirm payment on WhatsApp"
    >
      <MessageCircle className="h-5 w-5 shrink-0" />

      <span>
        I&apos;ve Paid — Confirm on WhatsApp
      </span>

      <CheckCircle2 className="h-5 w-5 shrink-0" />
    </button>
  );
}