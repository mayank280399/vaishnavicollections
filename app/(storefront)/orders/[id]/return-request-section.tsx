
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  PackageCheck,
  Upload,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type ReturnOrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type ReturnRequest = {
  id: string;
  status: string;
  reason: string;
  created_at: string;
  return_tracking_number: string | null;
  return_carrier: string | null;
};

type Props = {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  deliveredAt: string | null;
  items: ReturnOrderItem[];
};

const REASONS = [
  {
    value: "DAMAGED_OR_DEFECTIVE",
    label: "Product arrived damaged or defective",
  },
  { value: "WRONG_ITEM", label: "Wrong product received" },
  { value: "MISSING_PARTS", label: "Item or component missing" },
  {
    value: "NOT_AS_DESCRIBED",
    label: "Product differs from confirmed order details",
  },
];

const ACTIVE_STATUSES = new Set([
  "REQUESTED",
  "UNDER_REVIEW",
  "APPROVED",
  "RETURN_SHIPPED",
  "RECEIVED",
  "INSPECTED",
  "REFUND_PENDING",
]);

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Request submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Return approved",
  REJECTED: "Request declined",
  RETURN_SHIPPED: "Return shipment in transit",
  RECEIVED: "Returned product received",
  INSPECTED: "Product inspection",
  REFUND_PENDING: "Refund pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function indiaDateKey(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const part = (type: string) =>
    parts.find((entry) => entry.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function getReturnDeadline(deliveredAt: string) {
  const deliveredDate = new Date(deliveredAt);

  if (Number.isNaN(deliveredDate.getTime())) {
    return null;
  }

  const key = indiaDateKey(deliveredDate);
  const [year, month, day] = key.split("-").map(Number);
  const deadline = new Date(Date.UTC(year, month - 1, day + 3));

  return `${deadline.getUTCFullYear()}-${String(
    deadline.getUTCMonth() + 1,
  ).padStart(2, "0")}-${String(deadline.getUTCDate()).padStart(2, "0")}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function getVideoExtension(file: File): "mp4" | "mov" | null {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".mp4")) {
    return "mp4";
  }

  if (fileName.endsWith(".mov")) {
    return "mov";
  }

  return null;
}

function getVideoContentType(extension: "mp4" | "mov") {
  return extension === "mov" ? "video/quicktime" : "video/mp4";
}

export default function ReturnRequestSection({
  orderId,
  orderNumber,
  orderStatus,
  deliveredAt,
  items,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState(REASONS[0].value);
  const [notes, setNotes] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [confirmedPolicy, setConfirmedPolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      setLoadingRequests(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("return_requests")
        .select(
          "id, status, reason, created_at, return_tracking_number, return_carrier",
        )
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        console.error("Return requests fetch error:", fetchError);
        setError(
          "We couldn't load your return requests. Please refresh the page.",
        );
      } else {
        setRequests((data ?? []) as ReturnRequest[]);
      }

      setLoadingRequests(false);
    }

    void loadRequests();

    return () => {
      cancelled = true;
    };
  }, [orderId, supabase]);

  const deadline = deliveredAt ? getReturnDeadline(deliveredAt) : null;
  const today = indiaDateKey(new Date());

  const eligible =
    orderStatus === "DELIVERED" &&
    Boolean(deliveredAt) &&
    Boolean(deadline && today <= deadline);

  const activeRequestExists = requests.some((request) =>
    ACTIVE_STATUSES.has(request.status),
  );

  const canSubmit =
    eligible &&
    !activeRequestExists &&
    !loadingRequests &&
    !submitting;

  function setItemQuantity(itemId: string, value: number) {
    setQuantities((current) => ({
      ...current,
      [itemId]: value,
    }));
  }

  function handleEvidenceChange(file: File | null) {
    setError("");
    setSuccess("");

    if (!file) {
      setEvidence(null);
      return;
    }

    const extension = getVideoExtension(file);

    if (!extension) {
      setEvidence(null);
      setError("Choose a video file with an MP4 or MOV extension.");
      return;
    }

    const allowedTypes = ["", getVideoContentType(extension)];

    if (!allowedTypes.includes(file.type)) {
      setEvidence(null);
      setError("The selected video format does not match its file extension.");
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setEvidence(null);
      setError("The video must be 50 MB or smaller.");
      return;
    }

    setEvidence(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (submitting) return;

    if (!canSubmit) {
      setError(
        activeRequestExists
          ? "This order already has an active return request."
          : "This order is not currently eligible for a return.",
      );
      return;
    }

    const selectedItems = items
      .map((item) => ({
        order_item_id: item.id,
        requested_quantity: Number(quantities[item.id] ?? 0),
      }))
      .filter((item) => item.requested_quantity > 0);

    if (selectedItems.length === 0) {
      setError("Select at least one item and its return quantity.");
      return;
    }

    for (const selected of selectedItems) {
      const item = items.find(
        (entry) => entry.id === selected.order_item_id,
      );

      if (
        !item ||
        !Number.isInteger(selected.requested_quantity) ||
        selected.requested_quantity < 1 ||
        selected.requested_quantity > item.quantity
      ) {
        setError("Please check the selected item quantities.");
        return;
      }
    }

    if (!evidence) {
      setError("Please attach the mandatory continuous unboxing video.");
      return;
    }

    const extension = getVideoExtension(evidence);

    if (!extension) {
      setError("Upload an MP4 or MOV video.");
      return;
    }

    if (evidence.size > MAX_VIDEO_SIZE) {
      setError("The video must be 50 MB or smaller.");
      return;
    }

    if (!confirmedPolicy) {
      setError("Please confirm that you have read the return conditions.");
      return;
    }

    setSubmitting(true);

    let uploadedEvidencePath: string | null = null;
    let createdRequestId: string | null = null;
    let currentUserId: string | null = null;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Your session has expired. Sign in and try again.");
      }

      currentUserId = user.id;

      const requestId = crypto.randomUUID();
      createdRequestId = requestId;

      const evidencePath =
        `${user.id}/${orderId}/${requestId}/unboxing-${Date.now()}.${extension}`;

      const contentType = getVideoContentType(extension);

      const { error: uploadError } = await supabase.storage
        .from("return-evidence")
        .upload(evidencePath, evidence, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        console.error("Return evidence upload error:", uploadError);

        throw new Error(
          "We couldn't upload your unboxing video. Please check your connection and try again.",
        );
      }

      uploadedEvidencePath = evidencePath;

      const { error: requestError } = await supabase
        .from("return_requests")
        .insert({
          id: requestId,
          order_id: orderId,
          user_id: user.id,
          status: "REQUESTED",
          reason,
          customer_notes: notes.trim() || null,
        });

      if (requestError) {
        console.error("Return request insert error:", requestError);

        throw new Error(
          "We couldn't create your return request. Please try again or contact support if the issue continues.",
        );
      }

      const { error: itemsError } = await supabase
        .from("return_request_items")
        .insert(
          selectedItems.map((item) => ({
            return_request_id: requestId,
            order_item_id: item.order_item_id,
            requested_quantity: item.requested_quantity,
          })),
        );

      if (itemsError) {
        console.error("Return request items insert error:", itemsError);

        // Best-effort rollback prevents an incomplete request from being
        // left behind when its item details cannot be saved.
        const { error: rollbackItemsError } = await supabase
          .from("return_request_items")
          .delete()
          .eq("return_request_id", requestId);

        if (rollbackItemsError) {
          console.error(
            "Return request item rollback error:",
            rollbackItemsError,
          );
        }

        const { error: rollbackRequestError } = await supabase
          .from("return_requests")
          .delete()
          .eq("id", requestId)
          .eq("user_id", user.id);

        if (rollbackRequestError) {
          console.error(
            "Return request rollback error:",
            rollbackRequestError,
          );
        }

        throw new Error(
          `We couldn't save the items for your return request. ${
            rollbackRequestError
              ? `Please contact support and quote reference ${requestId}.`
              : "Please try submitting your request again."
          }`,
        );
      }

      setSuccess(
        `Your return request has been submitted successfully. Reference: ${requestId}`,
      );

      setQuantities({});
      setReason(REASONS[0].value);
      setNotes("");
      setEvidence(null);
      setConfirmedPolicy(false);

      const fileInput = document.getElementById(
        "return-evidence",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      const refreshed = await supabase
        .from("return_requests")
        .select(
          "id, status, reason, created_at, return_tracking_number, return_carrier",
        )
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (refreshed.error) {
        console.error(
          "Return requests refresh error:",
          refreshed.error,
        );
      } else {
        setRequests((refreshed.data ?? []) as ReturnRequest[]);
      }

      router.refresh();
    } catch (caught) {
      console.error("Return submission error:", caught);

      // Remove the uploaded evidence when submission fails. This is
      // best-effort cleanup; storage policies must permit the owner to
      // remove their own uploaded object.
      if (uploadedEvidencePath) {
        const { error: cleanupError } = await supabase.storage
          .from("return-evidence")
          .remove([uploadedEvidencePath]);

        if (cleanupError) {
          console.error(
            "Return evidence cleanup error:",
            cleanupError,
          );
        }
      }

      setError(
        caught instanceof Error
          ? caught.message
          : "Something went wrong while submitting your return request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0f1f3d] text-[#D4AF37]">
          <PackageCheck className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-[#0f1f3d]">
            Returns & Refunds
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review your return status or request a return for an eligible
            order.
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Order: {orderNumber}
          </p>
        </div>
      </div>

      {loadingRequests ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading return requests…
        </div>
      ) : requests.length > 0 ? (
        <div className="mt-5 space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="break-all text-sm font-bold text-[#0f1f3d]">
                  Return reference: {request.id}
                </p>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  {STATUS_LABELS[request.status] ?? request.status}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Submitted {formatDate(request.created_at)}
              </p>

              {request.return_carrier && (
                <p className="mt-2 text-sm text-slate-600">
                  Return carrier: {request.return_carrier}
                </p>
              )}

              {request.return_tracking_number && (
                <p className="mt-1 break-all text-sm text-slate-600">
                  Return tracking: {request.return_tracking_number}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {!eligible ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-2">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

            <div>
              <p className="text-sm font-bold text-slate-700">
                Return request unavailable
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Online return requests are available for eligible delivered
                orders within 3 calendar days of delivery. If your product
                arrived damaged or incorrect and you cannot submit a request,
                please contact Vaishnavi Collections support.
              </p>
            </div>
          </div>
        </div>
      ) : activeRequestExists ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">
            Your return is already in progress
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            Please use the existing request above rather than submitting a
            duplicate. Our team will update its status after review.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />

              <div className="text-sm text-emerald-900">
                <p className="font-bold">Eligible delivery</p>

                <p className="mt-1">
                  Delivered {formatDate(deliveredAt!)}. Submit your request
                  by <strong>{deadline}</strong> (India time).
                </p>
              </div>
            </div>
          </div>

          <fieldset className="space-y-3" disabled={submitting}>
            <legend className="text-sm font-bold text-[#0f1f3d]">
              Select items and quantities
            </legend>

            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#0f1f3d]">
                    {item.product_name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Purchased: {item.quantity} ·{" "}
                    {formatCurrency(item.unit_price)} each
                  </p>
                </div>

                <div className="sm:w-28">
                  <label
                    htmlFor={`return-quantity-${item.id}`}
                    className="text-xs font-semibold text-slate-500"
                  >
                    Return quantity
                  </label>

                  <select
                    id={`return-quantity-${item.id}`}
                    className={inputClass}
                    value={quantities[item.id] ?? 0}
                    onChange={(event) =>
                      setItemQuantity(
                        item.id,
                        Number(event.target.value),
                      )
                    }
                  >
                    {Array.from(
                      { length: Math.max(0, item.quantity) + 1 },
                      (_, index) => index,
                    ).map((quantity) => (
                      <option key={quantity} value={quantity}>
                        {quantity === 0 ? "Don't return" : quantity}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                No order items are available to select. Please contact
                support.
              </p>
            )}
          </fieldset>

          <div>
            <label
              htmlFor="return-reason"
              className="text-sm font-bold text-[#0f1f3d]"
            >
              Reason for return *
            </label>

            <select
              id="return-reason"
              className={inputClass}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={submitting}
              required
            >
              {REASONS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="return-notes"
              className="text-sm font-bold text-[#0f1f3d]"
            >
              Additional details
            </label>

            <textarea
              id="return-notes"
              className={inputClass}
              rows={4}
              maxLength={2000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Describe the issue and the condition of the package or product."
              disabled={submitting}
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {notes.length}/2000
            </p>
          </div>

          <div>
            <label
              htmlFor="return-evidence"
              className="text-sm font-bold text-[#0f1f3d]"
            >
              Continuous unboxing video *
            </label>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Upload an MP4 or MOV video, maximum 50 MB. The video should
              show the package, shipping label, opening, and product
              condition.
            </p>

            <label
              htmlFor="return-evidence"
              className="mt-3 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-[#D4AF37]"
            >
              <Upload className="h-6 w-6 text-[#0f1f3d]" />

              <span className="mt-2 max-w-full break-all text-sm font-bold text-[#0f1f3d]">
                {evidence ? evidence.name : "Choose unboxing video"}
              </span>

              <span className="mt-1 text-xs text-slate-500">
                MP4 or MOV · Up to 50 MB
              </span>

              {evidence && (
                <span className="mt-1 text-xs text-slate-500">
                  {(evidence.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              )}

              <input
                id="return-evidence"
                type="file"
                accept="video/mp4,video/quicktime,.mp4,.mov"
                className="sr-only"
                disabled={submitting}
                onChange={(event) =>
                  handleEvidenceChange(
                    event.target.files?.[0] ?? null,
                  )
                }
              />
            </label>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
            <input
              type="checkbox"
              checked={confirmedPolicy}
              onChange={(event) =>
                setConfirmedPolicy(event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-[#0f1f3d]"
              disabled={submitting}
            />

            <span className="text-sm leading-6 text-slate-600">
              I confirm that the details are accurate and have read the
              Vaishnavi Collections return policy. Customized or
              made-to-order products are generally excluded from
              change-of-mind returns; damage, defects, and incorrect items
              are reviewed individually.
            </span>
          </label>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || items.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f1f3d] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#172c50] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Submitting request…
              </>
            ) : (
              "Submit Return Request"
            )}
          </button>

          <p className="text-xs leading-5 text-slate-500">
            Do not ship a product back until your return has been approved
            and you have received return instructions.
          </p>
        </form>
      )}
    </section>
  );
}
