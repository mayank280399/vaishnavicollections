"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type CancelOrderButtonProps = {
  orderId: string;
};

export default function CancelOrderButton({
  orderId,
}: CancelOrderButtonProps) {
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    setSaving(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error("Please sign in to cancel this order.");
      }

      const { error: cancelError } = await supabase.rpc(
        "cancel_my_order",
        {
          p_order_id: orderId,
          p_reason: reason.trim() || null,
        },
      );

      if (cancelError) {
        throw cancelError;
      }

      window.location.reload();
    } catch (err) {
      console.error("Cancel order error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel the order. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
      >
        <X className="h-4 w-4" />
        Cancel Order
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  id="cancel-order-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Cancel this order?
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-600">
                  This action will cancel your order. Please confirm
                  before continuing.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5">
              <label
                htmlFor="cancellation-reason"
                className="text-sm font-semibold text-slate-800"
              >
                Reason for cancellation
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <textarea
                id="cancellation-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={saving}
                rows={3}
                maxLength={500}
                placeholder="Tell us why you want to cancel"
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 disabled:bg-slate-50"
              />

              <p className="mt-1 text-right text-[11px] text-slate-400">
                {reason.length}/500
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-700">
                {error}
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep Order
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    Yes, Cancel Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}