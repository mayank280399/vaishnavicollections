"use client";

import { useEffect, useState } from "react";
import {
  BadgePercent,
  CheckCircle2,
  Loader2,
  Ticket,
  Sparkles,
  Tag,
} from "lucide-react";
import type { PromotionQuote } from "@/lib/promotions/engine";

type Props = {
  items: Array<{ productId: string; quantity: number }>;
  subtotal: number;
  onQuoteChange: (
    quote: PromotionQuote | null,
    promotionId: string | null,
    couponCode: string,
  ) => void;
};

type QuoteResponse = {
  success: boolean;
  error?: string;
  offers?: PromotionQuote[];
  quote?: PromotionQuote | null;
};

const money = (value: number) =>
  `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function discountLabel(offer: PromotionQuote) {
  if (offer.discountType === "PERCENTAGE") {
    return `${offer.discountValue}% OFF${offer.maximumDiscountAmount ? ` · Save up to ${money(offer.maximumDiscountAmount)}` : ""}`;
  }
  return `${money(offer.discountAmount)} OFF`;
}

export default function CheckoutOffers({ items, subtotal, onQuoteChange }: Props) {
  const [couponCode, setCouponCode] = useState("");
  const [offers, setOffers] = useState<PromotionQuote[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const itemsSignature = items
    .map((item) => `${item.productId}:${item.quantity}`)
    .sort()
    .join("|");

  async function requestQuote(promotionId: string | null, code: string) {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/promotions/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          selectedPromotionId: promotionId,
          couponCode: code || null,
        }),
      });

      const payload = (await response.json()) as QuoteResponse;
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Unable to validate this offer.");
      }

      const nextOffers = payload.offers || [];
      const nextQuote = payload.quote || null;
      setOffers(nextOffers);
      setSelectedPromotionId(nextQuote?.promotionId || null);
      onQuoteChange(nextQuote, nextQuote?.promotionId || null, nextQuote?.promotionCode || "");

      if (nextQuote?.promotionId) {
        setMessage(`${nextQuote.promotionName} applied. You can use only one offer per order.`);
      } else if (code) {
        setMessage("Coupon removed.");
      } else {
        setMessage(nextOffers.length
          ? "Choose one eligible offer to apply to your order."
          : "No coupons are currently eligible for this cart.");
      }
      return nextQuote;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to validate this offer.");
      setSelectedPromotionId(null);
      onQuoteChange(null, null, "");
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setCouponCode("");
    setSelectedPromotionId(null);
    void requestQuote(null, "");
    // Cart changes invalidate any previously selected promotion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, itemsSignature]);

  function applyCoupon(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setError("Enter a coupon code first.");
      return;
    }
    void requestQuote(null, code);
  }

  function selectOffer(offer: PromotionQuote) {
    setCouponCode("");
    void requestQuote(offer.promotionId, "");
  }

  function clearOffer() {
    setCouponCode("");
    setSelectedPromotionId(null);
    void requestQuote(null, "");
  }

  return (
    <section className="mb-5 rounded-2xl border border-[#D4AF37]/40 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#071A35] text-[#D4AF37]">
          <BadgePercent size={19} />
        </span>
        <div>
          <h2 className="text-sm font-bold text-[#071A35]">Offers & coupons</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Choose one eligible offer. Coupons and loyalty-point redemption cannot be combined on the same order.
          </p>
        </div>
      </div>

      {offers.length > 0 && (
        <div className="mt-4 space-y-2">
          {offers.map((offer) => {
            const selected = selectedPromotionId === offer.promotionId;
            return (
              <button
                key={offer.promotionId}
                type="button"
                disabled={loading}
                onClick={() => selectOffer(offer)}
                aria-pressed={selected}
                className={`flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition disabled:opacity-60 ${
                  selected
                    ? "border-[#D4AF37] bg-[#fffaf0] ring-1 ring-[#D4AF37]/30"
                    : "border-slate-200 bg-white hover:border-[#D4AF37]/70 hover:bg-[#fffdf7]"
                }`}
              >
                <span className="flex min-w-0 items-start gap-3">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected ? "border-[#071A35] bg-[#071A35] text-[#D4AF37]" : "border-slate-300 text-transparent"
                  }`}>
                    <CheckCircle2 size={13} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#071A35]">{offer.promotionName}</span>
                      {offer.firstOrderOnly && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                          <Sparkles size={10} /> FIRST ORDER
                        </span>
                      )}
                      {offer.promotionKind === "AUTOMATIC" && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700">AUTO OFFER</span>
                      )}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-emerald-700">{discountLabel(offer)}</span>
                    <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                      {offer.promotionCode ? `Code: ${offer.promotionCode} · ` : ""}
                      Min. cart {money(offer.minimumOrderAmount)}
                      {offer.description ? ` · ${offer.description}` : ""}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 pt-0.5 text-xs font-bold text-[#071A35]">
                  {selected ? "Applied" : "Apply"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <form onSubmit={applyCoupon} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
            placeholder="Have another coupon code?"
            maxLength={40}
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm uppercase outline-none focus:border-[#D4AF37]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !couponCode.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A35] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : "Apply code"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Tag size={13} /> Loyalty rewards are still earned after successful payment, even when a coupon is used.
        </p>
        {selectedPromotionId && (
          <button type="button" onClick={clearOffer} disabled={loading} className="text-xs font-semibold text-slate-600 underline">
            Remove offer
          </button>
        )}
      </div>

      {loading && (
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Loader2 size={13} className="animate-spin" /> Validating offer…
        </p>
      )}
      {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
      {message && !error && <p role="status" className="mt-3 text-xs text-emerald-700">{message}</p>}
    </section>
  );
}
