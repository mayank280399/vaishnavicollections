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
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#20bd5a] active:scale-[0.99]"
    >
      <MessageCircle className="h-5 w-5" />

      <span>Confirm Payment on WhatsApp</span>

      <CheckCircle2 className="h-5 w-5" />
    </a>
  );
}
