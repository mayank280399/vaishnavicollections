"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      prefill?: { name?: string; email?: string; contact?: string };
      notes?: Record<string, string>;
      theme?: { color?: string };
      modal?: { ondismiss?: () => void };
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => void;
    }) => { open: () => void; on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void };
  }
}

type Props = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  amount: number;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function RazorpayPaymentButton({
  orderId,
  orderNumber,
  customerName,
  customerPhone,
  customerEmail,
  amount,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function startPayment() {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const orderPayload = await orderResponse.json();
      if (!orderResponse.ok || !orderPayload.success) {
        throw new Error(orderPayload.error || "Unable to start Razorpay checkout.");
      }

      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector<HTMLScriptElement>(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
          );
          if (existing && window.Razorpay) {
            resolve();
            return;
          }
          const script = existing ?? document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Unable to load Razorpay Checkout. Please check your connection and retry."));
          if (!existing) document.body.appendChild(script);
        });
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout could not be initialized. Please retry.");
      }

      const razorpay = new window.Razorpay({
        key: orderPayload.keyId,
        amount: orderPayload.amount,
        currency: orderPayload.currency || "INR",
        name: "Vaishnavi Collections",
        description: `Order ${orderNumber}`,
        order_id: orderPayload.razorpayOrderId,
        prefill: {
          name: customerName,
          email: customerEmail || undefined,
          contact: customerPhone,
        },
        notes: { vc_order_id: orderId, vc_order_number: orderNumber },
        theme: { color: "#071A35" },
        handler: async (response) => {
          setBusy(true);
          setMessage("Payment received by Razorpay. Verifying securely…");
          try {
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyPayload = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyPayload.success) {
              throw new Error(verifyPayload.error || "Payment verification is pending. Refresh this page in a moment.");
            }
            window.location.href = `/orders/${encodeURIComponent(orderId)}?payment=success`;
          } catch (verifyError) {
            setError(verifyError instanceof Error ? verifyError.message : "Payment verification is pending. Please refresh this order page.");
            setMessage("");
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setMessage("");
          },
        },
      });

      razorpay.on("payment.failed", (response) => {
        setError(response.error?.description || "Payment failed. You can safely try again.");
        setBusy(false);
        setMessage("");
      });
      razorpay.open();
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Unable to open Razorpay Checkout.");
      setBusy(false);
      setMessage("");
    }
  }

  return (
    <div className="mt-5">
      <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#fffaf0] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#071A35] text-[#D4AF37]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#071A35]">Secure payment with Razorpay</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Pay {formatPrice(amount)} using the payment methods available in checkout. Your order is marked paid only after server-side verification.
            </p>
          </div>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={startPayment}
        disabled={busy || amount <= 0}
        className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#071A35] px-5 py-4 text-sm font-extrabold text-white shadow-md transition hover:bg-[#102b50] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
        {busy ? "Preparing secure checkout…" : `Pay ${formatPrice(amount)} securely`}
      </button>
    </div>
  );
}
