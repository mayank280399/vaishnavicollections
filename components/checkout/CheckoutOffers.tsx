"use client";

import { useEffect, useState } from "react";
import { BadgePercent, CheckCircle2, Loader2, Ticket, X, Sparkles } from "lucide-react";
import type { PromotionQuote } from "@/lib/promotions/engine";

type Props = {
  items: Array<{ productId: string; quantity: number }>;
  subtotal: number;
  onQuoteChange: (quote: PromotionQuote | null, couponCode: string) => void;
};

const money = (value: number) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function CheckoutOffers({ items, subtotal, onQuoteChange }: Props) {
  const [couponCode, setCouponCode] = useState("");
  const [quote, setQuote] = useState<PromotionQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const itemsSignature = items.map((item) => `${item.productId}:${item.quantity}`).sort().join("|");

  async function fetchQuote(code: string) {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/promotions/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, couponCode: code }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to apply this offer.");
      const nextQuote = payload.quote as PromotionQuote;
      setQuote(nextQuote);
      onQuoteChange(nextQuote, code);
      if (nextQuote.promotionId) {
        setMessage(nextQuote.firstOrderOnly
          ? "Your first-purchase offer has been applied."
          : code
            ? "Coupon applied successfully."
            : "An eligible offer has been applied automatically.");
      } else {
        setMessage(code
          ? "Coupon removed."
          : "No automatic offers are available for this cart yet.");
      }
    } catch (e) {
      setQuote(null);
      onQuoteChange(null, "");
      setError(e instanceof Error ? e.message : "Unable to validate coupon.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchQuote("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, itemsSignature]);

  function applyCoupon(event: React.FormEvent) {
    event.preventDefault();
    if (!couponCode.trim()) {
      setError("Enter a coupon code first.");
      return;
    }
    void fetchQuote(couponCode.trim().toUpperCase());
  }

  function removeCoupon() {
    setCouponCode("");
    void fetchQuote("");
  }

  return (
    <section className="mb-5 rounded-2xl border border-[#D4AF37]/40 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071A35] text-[#D4AF37]"><BadgePercent size={18} /></span>
        <div>
          <h2 className="text-sm font-bold text-[#071A35]">Offers & coupons</h2>
          <p className="text-xs text-slate-500">First-purchase offers are applied automatically when your account is eligible.</p>
        </div>
      </div>
      <form onSubmit={applyCoupon} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" maxLength={40} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm uppercase outline-none focus:border-[#D4AF37]" />
        </div>
        <button type="submit" disabled={loading || !couponCode.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A35] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? <Loader2 size={15} className="animate-spin" /> : "Apply coupon"}</button>
        {quote?.promotionKind === "COUPON" && <button type="button" onClick={removeCoupon} disabled={loading} aria-label="Remove coupon" className="inline-flex items-center justify-center rounded-xl border px-3 py-3 text-slate-600"><X size={16}/></button>}
      </form>
      {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
      {message && <p role="status" className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700"><CheckCircle2 size={14}/>{message}</p>}
      {quote?.promotionId && (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-xl bg-[#fffaf0] p-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[#071A35]">{quote.promotionName}</p>
              {quote.firstOrderOnly && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800"><Sparkles size={11}/> FIRST PURCHASE</span>}
            </div>
            <p className="mt-1 text-xs text-slate-500">{quote.promotionCode ? `Code: ${quote.promotionCode}` : "Automatic offer"}{quote.description ? ` · ${quote.description}` : ""}</p>
          </div>
          <p className="shrink-0 text-sm font-bold text-emerald-700">−{money(quote.discountAmount)}</p>
        </div>
      )}
    </section>
  );
}
