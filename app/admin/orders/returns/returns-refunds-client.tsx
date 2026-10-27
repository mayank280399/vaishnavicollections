
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileVideo,
  IndianRupee,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  completeReturnRefund,
  createReturnRefund,
  saveReturnInspection,
  updateReturnStatus,
} from "@/lib/orders/returns/actions";

type AnyRow = Record<string, any>;
type Role = "STAFF" | "ADMIN" | "OWNER";
type RefundMethod = "UPI" | "BANK_TRANSFER";

const statusLabels: Record<string, string> = {
  REQUESTED: "New request",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  RETURN_SHIPPED: "Return shipped",
  RECEIVED: "Received",
  INSPECTED: "Inspected",
  REFUND_PENDING: "Refund pending",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusStyles: Record<string, string> = {
  REQUESTED: "bg-amber-50 text-amber-800 ring-amber-200",
  UNDER_REVIEW: "bg-blue-50 text-blue-800 ring-blue-200",
  APPROVED: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  RETURN_SHIPPED: "bg-sky-50 text-sky-800 ring-sky-200",
  RECEIVED: "bg-violet-50 text-violet-800 ring-violet-200",
  INSPECTED: "bg-teal-50 text-teal-800 ring-teal-200",
  REFUND_PENDING: "bg-orange-50 text-orange-800 ring-orange-200",
  REJECTED: "bg-red-50 text-red-800 ring-red-200",
  COMPLETED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  CANCELLED: "bg-gray-100 text-gray-700 ring-gray-200",
};

const reasonLabels: Record<string, string> = {
  DAMAGED_OR_DEFECTIVE: "Damaged or defective",
  WRONG_ITEM: "Wrong item received",
  MISSING_PARTS: "Missing parts",
  NOT_AS_DESCRIBED: "Item not as described",
};

// PROCESSING refunds also reserve money and must count toward the limit.
const RESERVED_REFUND_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
];

function money(value: unknown) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function dateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

function statusBadge(status: string) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
        statusStyles[status] ?? "bg-gray-100 text-gray-700 ring-gray-200"
      }`}
    >
      {statusLabels[status] ?? status.replaceAll("_", " ")}
    </span>
  );
}

function reservedRefundTotal(refunds: AnyRow[]) {
  return refunds
    .filter((refund) =>
      RESERVED_REFUND_STATUSES.includes(
        String(refund.status ?? "").toUpperCase(),
      ),
    )
    .reduce(
      (sum: number, refund: AnyRow) =>
        sum + Math.max(0, Number(refund.amount ?? 0)),
      0,
    );
}

function validPositiveAmount(value: string) {
  if (!value.trim()) return false;

  const amount = Number(value);

  return (
    Number.isFinite(amount) &&
    amount > 0 &&
    Math.round(amount * 100) === amount * 100
  );
}

export default function ReturnsRefundsClient({
  initialRequests,
  currentRole,
}: {
  initialRequests: AnyRow[];
  currentRole: Role;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const canRefund = currentRole === "ADMIN" || currentRole === "OWNER";

  const requests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialRequests.filter((request) => {
      const statusMatch = filter === "ALL" || request.status === filter;

      const searchable = [
        request.order?.order_number,
        request.customer?.full_name,
        request.customer?.email,
        request.customer?.phone,
        request.order?.customer_name,
        request.order?.customer_phone,
        request.reason,
        request.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return statusMatch && (!query || searchable.includes(query));
    });
  }, [initialRequests, search, filter]);

  const stats = useMemo(() => {
    const count = (status: string) =>
      initialRequests.filter((request) => request.status === status).length;

    return {
      total: initialRequests.length,
      needsReview: count("REQUESTED") + count("UNDER_REVIEW"),
      inTransit: count("APPROVED") + count("RETURN_SHIPPED"),
      refundPending: initialRequests.filter(
        (request) =>
          request.status === "REFUND_PENDING" ||
          (request.refunds ?? []).some((refund: AnyRow) =>
            ["PENDING", "PROCESSING"].includes(
              String(refund.status ?? "").toUpperCase(),
            ),
          ),
      ).length,
      completed: count("COMPLETED"),
    };
  }, [initialRequests]);

  function runAction(action: () => Promise<unknown>, success: string) {
    setMessage("");
    setErrorMessage("");

    startTransition(async () => {
      try {
        await action();
        setMessage(success);
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl bg-[#071A35] text-white shadow-sm">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
              <ShieldCheck size={14} />
              Returns management
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Returns &amp; Refunds
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Review customer requests, inspect returned items, and track
              manual refunds from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.refresh()}
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={pending ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="h-1 w-full bg-gradient-to-r from-[#D4AF37] via-[#F2D77A] to-transparent" />
      </header>

      {message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 className="mr-2 inline" size={17} />
          {message}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mr-2 inline" size={17} />
          {errorMessage}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard
          label="All requests"
          value={stats.total}
          icon={<PackageCheck size={18} />}
        />
        <StatCard
          label="Needs review"
          value={stats.needsReview}
          icon={<Clock3 size={18} />}
        />
        <StatCard
          label="Approved / in transit"
          value={stats.inTransit}
          icon={<ArrowUpRight size={18} />}
        />
        <StatCard
          label="Refund pending"
          value={stats.refundPending}
          icon={<IndianRupee size={18} />}
        />
        <StatCard
          label="Completed returns"
          value={stats.completed}
          icon={<CheckCircle2 size={18} />}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order number, customer, phone..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#D4AF37]"
          >
            <option value="ALL">All statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Showing {requests.length} of {initialRequests.length} return requests
        </p>
      </section>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <PackageCheck className="mx-auto text-slate-400" size={34} />

          <h2 className="mt-3 font-semibold text-slate-900">
            No return requests found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Try a different search or status filter. New customer requests
            will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map((request) => (
            <ReturnRequestCard
              key={request.id}
              request={request}
              canRefund={canRefund}
              pending={pending}
              runAction={runAction}
            />
          ))}
        </div>
      )}

      <p className="text-xs leading-5 text-slate-500">
        Refunds are processed manually. Do not mark a refund completed until
        the UPI or bank transfer has actually been sent and its reference is
        available.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className="text-[#B18A17]">{icon}</span>
      </div>

      <p className="mt-3 text-2xl font-bold text-[#071A35]">{value}</p>
    </div>
  );
}

function ReturnRequestCard({
  request,
  canRefund,
  pending,
  runAction,
}: {
  request: AnyRow;
  canRefund: boolean;
  pending: boolean;
  runAction: (action: () => Promise<unknown>, success: string) => void;
}) {
  const [staffNotes, setStaffNotes] = useState(request.staff_notes ?? "");
  const [inspectionNotes, setInspectionNotes] = useState(
    request.inspection_notes ?? "",
  );
  const [refundAmount, setRefundAmount] = useState("");
  const [refundMethod, setRefundMethod] = useState<RefundMethod>("UPI");
  const [refundNotes, setRefundNotes] = useState("");
  const [activeRefundId, setActiveRefundId] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");

  const [quantities, setQuantities] = useState<
    Record<
      string,
      {
        approvedQuantity: number;
        receivedQuantity: number;
        restockQuantity: number;
      }
    >
  >(() => {
    const result: Record<
      string,
      {
        approvedQuantity: number;
        receivedQuantity: number;
        restockQuantity: number;
      }
    > = {};

    for (const item of request.items ?? []) {
      result[item.id] = {
        approvedQuantity: Number(item.approved_quantity ?? 0),
        receivedQuantity: Number(item.received_quantity ?? 0),
        restockQuantity: Number(item.restock_quantity ?? 0),
      };
    }

    return result;
  });

  const order = request.order ?? {};
  const customer = request.customer ?? {};
  const items = request.items ?? [];
  const refunds = request.refunds ?? [];
  const status = String(request.status ?? "");

  // The server should supply order_refunds for an authoritative UI balance.
  const hasOrderWideRefunds = Array.isArray(request.order_refunds);
  const refundsForBalance = hasOrderWideRefunds
    ? request.order_refunds
    : refunds;

  const reservedAmount = reservedRefundTotal(refundsForBalance);
  const amountPaid = Math.max(0, Number(order.amount_paid ?? 0));
  const refundableRemaining = Math.max(0, amountPaid - reservedAmount);

  const balanceIsOrderWide = hasOrderWideRefunds;
  const amount = Number(refundAmount);

  const refundAmountValid =
    validPositiveAmount(refundAmount) &&
    amount <= refundableRemaining;

  const canApprove = ["REQUESTED", "UNDER_REVIEW"].includes(status);
  const canReceive = ["APPROVED", "RETURN_SHIPPED"].includes(status);
  const canCreateRefund =
    canRefund && ["INSPECTED", "REFUND_PENDING"].includes(status);

  const hasAnyReservedRefund = refundsForBalance.some(
    (refund: AnyRow) =>
      RESERVED_REFUND_STATUSES.includes(
        String(refund.status ?? "").toUpperCase(),
      ),
  );

  const hasPendingRefund = refunds.some((refund: AnyRow) =>
    ["PENDING", "PROCESSING"].includes(
      String(refund.status ?? "").toUpperCase(),
    ),
  );

  const completedRefundTotal = refundsForBalance
    .filter(
      (refund: AnyRow) =>
        String(refund.status ?? "").toUpperCase() === "COMPLETED",
    )
    .reduce(
      (sum: number, refund: AnyRow) =>
        sum + Math.max(0, Number(refund.amount ?? 0)),
      0,
    );

  const isFullyRefunded =
    amountPaid > 0 && completedRefundTotal >= amountPaid - 0.005;

  function changeQuantity(
    itemId: string,
    key: "approvedQuantity" | "receivedQuantity" | "restockQuantity",
    value: string,
  ) {
    const current = quantities[itemId] ?? {
      approvedQuantity: 0,
      receivedQuantity: 0,
      restockQuantity: 0,
    };

    const item = items.find((entry: AnyRow) => entry.id === itemId);
    const requested = Math.max(0, Number(item?.requested_quantity ?? 0));

    const max =
      key === "approvedQuantity"
        ? requested
        : key === "receivedQuantity"
          ? current.approvedQuantity
          : current.receivedQuantity;

    const parsed = value.trim() === "" ? 0 : Number(value);

    const nextValue = Number.isFinite(parsed)
      ? Math.min(max, Math.max(0, Math.floor(parsed)))
      : 0;

    setQuantities((previous) => ({
      ...previous,
      [itemId]: {
        ...(previous[itemId] ?? current),
        [key]: nextValue,
        ...(key === "approvedQuantity"
          ? {
              receivedQuantity: Math.min(
                current.receivedQuantity,
                nextValue,
              ),
              restockQuantity: Math.min(
                current.restockQuantity,
                current.receivedQuantity,
                nextValue,
              ),
            }
          : {}),
        ...(key === "receivedQuantity"
          ? {
              restockQuantity: Math.min(
                current.restockQuantity,
                nextValue,
              ),
            }
          : {}),
      },
    }));
  }

  async function saveInspection() {
    if (items.length === 0) {
      throw new Error("No return items were found for inspection.");
    }

    const invalidQuantities = items.some((item: AnyRow) => {
      const qty = quantities[item.id];
      const requested = Number(item.requested_quantity);

      return (
        !qty ||
        !Number.isInteger(qty.approvedQuantity) ||
        !Number.isInteger(qty.receivedQuantity) ||
        !Number.isInteger(qty.restockQuantity) ||
        qty.approvedQuantity < 0 ||
        qty.approvedQuantity > requested ||
        qty.receivedQuantity < 0 ||
        qty.receivedQuantity > qty.approvedQuantity ||
        qty.restockQuantity < 0 ||
        qty.restockQuantity > qty.receivedQuantity
      );
    });

    if (invalidQuantities) {
      throw new Error(
        "Check quantities: approved ≤ requested, received ≤ approved, and restock ≤ received.",
      );
    }

    await saveReturnInspection({
      returnRequestId: request.id,
      inspectionNotes,
      items: items.map((item: AnyRow) => ({
        id: item.id,
        ...(quantities[item.id] ?? {
          approvedQuantity: 0,
          receivedQuantity: 0,
          restockQuantity: 0,
        }),
      })),
    });
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-[#071A35]">
              Order #
              {order.order_number ??
                String(request.order_id ?? "").slice(0, 8)}
            </h2>

            {statusBadge(status)}
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Request created {dateTime(request.created_at)}
          </p>

          <p className="mt-3 text-sm font-semibold text-slate-900">
            {customer.full_name || order.customer_name || "Customer"}
          </p>

          <p className="text-sm text-slate-500">
            {customer.phone || order.customer_phone || "No phone recorded"}
            {customer.email ? ` · ${customer.email}` : ""}
          </p>
        </div>

        <div className="shrink-0 rounded-xl bg-slate-50 px-4 py-3 sm:text-right">
          <p className="text-xs text-slate-500">Amount paid</p>

          <p className="mt-1 text-lg font-bold text-[#071A35]">
            {money(order.amount_paid)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Order total: {money(order.total_amount)}
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-5">
          <section>
            <h3 className="text-sm font-bold text-slate-900">
              Request details
            </h3>

            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <Info
                label="Reason"
                value={
                  reasonLabels[request.reason] ??
                  request.reason ??
                  "Not provided"
                }
              />
              <Info label="Return request ID" value={request.id} />
              <Info label="Reviewed at" value={dateTime(request.reviewed_at)} />
              <Info label="Received at" value={dateTime(request.received_at)} />
            </dl>

            {request.customer_notes && (
              <div className="mt-3 rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">
                  Customer notes
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {request.customer_notes}
                </p>
              </div>
            )}

            {request.inspection_notes && (
              <div className="mt-3 rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">
                  Previous inspection notes
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {request.inspection_notes}
                </p>
              </div>
            )}

            {request.evidence_url ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#071A35]">
                    <FileVideo size={18} className="text-[#94721a]" />
                    Customer unboxing video
                  </div>
                  <a
                    href={request.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#071A35] hover:bg-slate-100"
                  >
                    Open video separately
                    <ArrowUpRight size={14} />
                  </a>
                </div>
                <video
                  key={request.evidence_url}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full rounded-xl bg-black object-contain"
                  aria-label={`Unboxing evidence for return request ${request.id}`}
                >
                  <source src={request.evidence_url} />
                  Your browser cannot play this video. Use “Open video separately” to view it.
                </video>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Review the video before deciding whether to approve or reject this return.
                  If playback fails, refresh the page to generate a fresh secure video link.
                </p>
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                No evidence link is available for this request. Older requests may not have
                saved the uploaded video path. Verify the evidence before approving this return.
              </p>
            )}
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-900">
              Requested items
            </h3>

            <div className="mt-3 space-y-3">
              {items.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No return items were found for this request.
                </p>
              ) : (
                items.map((item: AnyRow) => {
                  const product = item.order_item ?? {};
                  const qty = quantities[item.id] ?? {
                    approvedQuantity: 0,
                    receivedQuantity: 0,
                    restockQuantity: 0,
                  };

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex gap-3">
                        {product.product_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.product_image}
                            alt={product.product_name ?? "Returned product"}
                            className="h-16 w-16 rounded-lg border border-slate-100 object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            <PackageCheck
                              className="text-slate-400"
                              size={23}
                            />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {product.product_name ?? "Product"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            SKU: {product.product_sku ?? "—"} · Ordered:{" "}
                            {product.quantity ?? "—"} · Requested:{" "}
                            {item.requested_quantity}
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            Unit price: {money(product.unit_price)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <QuantityInput
                          label="Approved"
                          value={qty.approvedQuantity}
                          disabled={
                            ![
                              "REQUESTED",
                              "UNDER_REVIEW",
                              "APPROVED",
                              "RETURN_SHIPPED",
                              "RECEIVED",
                              "INSPECTED",
                            ].includes(status)
                          }
                          max={Number(item.requested_quantity)}
                          onChange={(value) =>
                            changeQuantity(
                              item.id,
                              "approvedQuantity",
                              value,
                            )
                          }
                        />

                        <QuantityInput
                          label="Received"
                          value={qty.receivedQuantity}
                          disabled={
                            ![
                              "APPROVED",
                              "RETURN_SHIPPED",
                              "RECEIVED",
                              "INSPECTED",
                            ].includes(status)
                          }
                          max={qty.approvedQuantity}
                          onChange={(value) =>
                            changeQuantity(
                              item.id,
                              "receivedQuantity",
                              value,
                            )
                          }
                        />

                        <QuantityInput
                          label="Restock"
                          value={qty.restockQuantity}
                          disabled={!["RECEIVED", "INSPECTED"].includes(status)}
                          max={qty.receivedQuantity}
                          onChange={(value) =>
                            changeQuantity(
                              item.id,
                              "restockQuantity",
                              value,
                            )
                          }
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 &&
              [
                "APPROVED",
                "RETURN_SHIPPED",
                "RECEIVED",
                "INSPECTED",
              ].includes(status) && (
                <div className="mt-3 space-y-3">
                  <label className="block text-xs font-semibold text-slate-600">
                    Inspection notes
                    <textarea
                      value={inspectionNotes}
                      onChange={(event) =>
                        setInspectionNotes(event.target.value)
                      }
                      rows={3}
                      placeholder="Condition, defects, missing parts, restock decision..."
                      className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-[#D4AF37]"
                    />
                  </label>

                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      runAction(
                        saveInspection,
                        "Return quantities and inspection notes saved.",
                      )
                    }
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Save quantities &amp; inspection
                  </button>
                </div>
              )}
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-900">Staff notes</h3>

            <textarea
              value={staffNotes}
              onChange={(event) => setStaffNotes(event.target.value)}
              rows={2}
              placeholder="Internal notes for this return..."
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#D4AF37]"
            />
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-900">
              Return workflow
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Save your notes when taking an action. Approval and refund
              payment are separate steps.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {status === "REQUESTED" && (
                <ActionButton
                  disabled={pending}
                  onClick={() =>
                    runAction(
                      () =>
                        updateReturnStatus(
                          request.id,
                          "UNDER_REVIEW",
                          staffNotes,
                        ),
                      "Return marked as under review.",
                    )
                  }
                >
                  Start review
                </ActionButton>
              )}

              {canApprove && (
                <>
                  <ActionButton
                    disabled={pending}
                    onClick={() => {
                      if (items.length === 0) {
                        window.alert(
                          "This return has no items. Check the request before approving.",
                        );
                        return;
                      }

                      runAction(
                        () =>
                          updateReturnStatus(
                            request.id,
                            "APPROVED",
                            staffNotes,
                          ),
                        "Return approved.",
                      );
                    }}
                  >
                    Approve return
                  </ActionButton>

                  <ActionButton
                    variant="danger"
                    disabled={pending}
                    onClick={() => {
                      if (!staffNotes.trim()) {
                        window.alert(
                          "Add a reason in staff notes before rejecting.",
                        );
                        return;
                      }

                      if (!window.confirm("Reject this return request?")) {
                        return;
                      }

                      runAction(
                        () =>
                          updateReturnStatus(
                            request.id,
                            "REJECTED",
                            staffNotes,
                          ),
                        "Return request rejected.",
                      );
                    }}
                  >
                    Reject
                  </ActionButton>
                </>
              )}

              {status === "APPROVED" && (
                <ActionButton
                  disabled={pending}
                  onClick={() =>
                    runAction(
                      () =>
                        updateReturnStatus(
                          request.id,
                          "RETURN_SHIPPED",
                          staffNotes,
                        ),
                      "Return marked as shipped.",
                    )
                  }
                >
                  Mark return shipped
                </ActionButton>
              )}

              {canReceive && (
                <ActionButton
                  disabled={pending}
                  onClick={() =>
                    runAction(
                      () =>
                        updateReturnStatus(
                          request.id,
                          "RECEIVED",
                          staffNotes,
                        ),
                      "Return marked as received.",
                    )
                  }
                >
                  Mark received
                </ActionButton>
              )}

              {status === "RECEIVED" && (
                <ActionButton
                  disabled={pending}
                  onClick={() => {
                    if (items.length === 0) {
                      window.alert(
                        "No return items were found for inspection.",
                      );
                      return;
                    }

                    const invalidQuantities = items.some((item: AnyRow) => {
                      const qty = quantities[item.id];
                      const requested = Number(item.requested_quantity);

                      return (
                        !qty ||
                        !Number.isInteger(qty.approvedQuantity) ||
                        !Number.isInteger(qty.receivedQuantity) ||
                        !Number.isInteger(qty.restockQuantity) ||
                        qty.approvedQuantity < 0 ||
                        qty.approvedQuantity > requested ||
                        qty.receivedQuantity < 0 ||
                        qty.receivedQuantity > qty.approvedQuantity ||
                        qty.restockQuantity < 0 ||
                        qty.restockQuantity > qty.receivedQuantity
                      );
                    });

                    if (invalidQuantities) {
                      window.alert(
                        "Check quantities before completing inspection: approved ≤ requested, received ≤ approved, and restock ≤ received.",
                      );
                      return;
                    }

                    if (
                      !window.confirm(
                        "Save the inspection and mark this return as inspected? Eligible restock quantities will be processed by the database.",
                      )
                    ) {
                      return;
                    }

                    runAction(
                      async () => {
                        // Save the latest inspection values first.
                        await saveInspection();

                        // Only proceed if inspection data saved successfully.
                        // The database RPC must handle restocking atomically.
                        await updateReturnStatus(
                          request.id,
                          "INSPECTED",
                          staffNotes,
                        );
                      },
                      "Inspection saved and return marked as inspected.",
                    );
                  }}
                >
                  Mark inspected
                </ActionButton>
              )}

              {["INSPECTED", "REFUND_PENDING"].includes(status) && (
                <p className="w-full rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  Inspection is recorded. Create a refund below after
                  confirming the approved quantities and refundable amount.
                </p>
              )}

              {status === "COMPLETED" && (
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={17} />
                  Return marked completed
                </p>
              )}

              {["REJECTED", "CANCELLED"].includes(status) && (
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <XCircle size={17} />
                  This request is closed to further workflow actions.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#D4AF37]/50 bg-amber-50/40 p-4">
            <div className="flex items-center gap-2">
              <IndianRupee size={18} className="text-[#9A7411]" />
              <h3 className="text-sm font-bold text-[#071A35]">
                Refund management
              </h3>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Info label="Amount paid" value={money(amountPaid)} />

              <Info
                label={
                  balanceIsOrderWide
                    ? "Reserved across order"
                    : "Reserved on this request"
                }
                value={money(reservedAmount)}
              />
            </div>

            {!balanceIsOrderWide && (
              <p className="mt-2 text-xs leading-5 text-amber-900">
                Order-wide refund history has not been supplied to this page.
                The displayed balance uses only this return request and is
                an estimate. The database must validate the actual order
                balance before creating another refund.
              </p>
            )}

            {refunds.length > 0 && (
              <div className="mt-4 space-y-3">
                {refunds.map((refund: AnyRow) => {
                  const refundStatus = String(
                    refund.status ?? "",
                  ).toUpperCase();

                  return (
                    <div
                      key={refund.id}
                      className="rounded-xl border border-amber-200 bg-white p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-[#071A35]">
                          {money(refund.amount)}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            refundStatus === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-800"
                              : ["PENDING", "PROCESSING"].includes(
                                    refundStatus,
                                  )
                                ? "bg-orange-50 text-orange-800"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {refundStatus.replaceAll("_", " ")}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {refund.refund_method} · Created{" "}
                        {dateTime(refund.created_at)}
                      </p>

                      {refund.payment_reference && (
                        <p className="mt-2 break-all text-xs text-slate-600">
                          Reference: {refund.payment_reference}
                        </p>
                      )}

                      {refund.internal_notes && (
                        <p className="mt-1 whitespace-pre-wrap text-xs text-slate-500">
                          {refund.internal_notes}
                        </p>
                      )}

                      {canRefund && refundStatus === "PENDING" && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                          <label className="block text-xs font-semibold text-slate-600">
                            UPI transaction / bank reference
                            <input
                              value={
                                activeRefundId === refund.id
                                  ? paymentReference
                                  : ""
                              }
                              onChange={(event) => {
                                setActiveRefundId(refund.id);
                                setPaymentReference(event.target.value);
                              }}
                              placeholder="Enter transfer reference"
                              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-[#D4AF37]"
                            />
                          </label>

                          <label className="block text-xs font-semibold text-slate-600">
                            Completion note (optional)
                            <input
                              value={
                                activeRefundId === refund.id
                                  ? completionNotes
                                  : ""
                              }
                              onChange={(event) => {
                                setActiveRefundId(refund.id);
                                setCompletionNotes(event.target.value);
                              }}
                              placeholder="Internal note"
                              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-[#D4AF37]"
                            />
                          </label>

                          <ActionButton
                            disabled={pending}
                            onClick={() => {
                              if (
                                activeRefundId !== refund.id ||
                                !paymentReference.trim()
                              ) {
                                window.alert(
                                  "Enter the actual transfer reference.",
                                );
                                return;
                              }

                              if (
                                !window.confirm(
                                  "Confirm that this refund has already been transferred?",
                                )
                              ) {
                                return;
                              }

                              runAction(
                                () =>
                                  completeReturnRefund({
                                    refundId: refund.id,
                                    paymentReference: paymentReference.trim(),
                                    internalNotes: completionNotes,
                                  }),
                                "Refund marked completed.",
                              );
                            }}
                          >
                            Confirm transfer completed
                          </ActionButton>
                        </div>
                      )}

                      {refundStatus === "PROCESSING" && (
                        <p className="mt-3 rounded-lg bg-orange-50 p-2 text-xs leading-5 text-orange-900">
                          This refund is processing and still reserves part
                          of the refundable balance. Follow your refund
                          workflow before creating another refund.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {isFullyRefunded && (
              <div
                role="status"
                className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-700"
                  />

                  <div>
                    <p className="text-sm font-bold text-emerald-900">
                      Refund completed
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800">
                      Completed refunds cover the amount paid for this order.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {hasPendingRefund && (
              <p className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs leading-5 text-orange-900">
                A refund is pending or processing. Follow up on the existing
                refund rather than creating a duplicate.
              </p>
            )}

            {canCreateRefund && (
              <div className="mt-4 space-y-3 border-t border-amber-200 pt-4">
                {!isFullyRefunded && refundableRemaining > 0.004 ? (
                  <>
                    <p className="text-xs leading-5 text-slate-600">
                      {balanceIsOrderWide
                        ? "Order-wide refundable balance before this new refund:"
                        : "Estimated refundable balance for this request:"}{" "}
                      <strong>{money(refundableRemaining)}</strong>.
                    </p>

                    <label className="block text-xs font-semibold text-slate-600">
                      Refund amount (₹)
                      <input
                        type="number"
                        min="0.01"
                        max={refundableRemaining}
                        step="0.01"
                        value={refundAmount}
                        onChange={(event) =>
                          setRefundAmount(event.target.value)
                        }
                        placeholder="0.00"
                        aria-invalid={
                          refundAmount.length > 0 && !refundAmountValid
                        }
                        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#D4AF37] aria-[invalid=true]:border-red-400"
                      />

                      {refundAmount.length > 0 && !refundAmountValid && (
                        <span className="mt-1 block font-normal text-red-700">
                          Enter a valid amount with up to two decimal places,
                          not exceeding {money(refundableRemaining)}.
                        </span>
                      )}
                    </label>

                    <label className="block text-xs font-semibold text-slate-600">
                      Refund method
                      <select
                        value={refundMethod}
                        onChange={(event) =>
                          setRefundMethod(event.target.value as RefundMethod)
                        }
                        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#D4AF37]"
                      >
                        <option value="UPI">UPI</option>
                        <option value="BANK_TRANSFER">Bank transfer</option>
                      </select>
                    </label>

                    <label className="block text-xs font-semibold text-slate-600">
                      Internal refund note (optional)
                      <textarea
                        value={refundNotes}
                        onChange={(event) => setRefundNotes(event.target.value)}
                        rows={2}
                        placeholder="Reason for partial refund, adjustments..."
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-[#D4AF37]"
                      />
                    </label>

                    <button
                      type="button"
                      disabled={
                        pending ||
                        !refundAmountValid ||
                        refundableRemaining <= 0.004
                      }
                      onClick={() => {
                        const amountToRefund = Number(refundAmount);

                        if (
                          !validPositiveAmount(refundAmount) ||
                          amountToRefund > refundableRemaining ||
                          refundableRemaining <= 0.004
                        ) {
                          window.alert(
                            "Enter a valid refund amount within the remaining refundable balance.",
                          );
                          return;
                        }

                        if (
                          !window.confirm(
                            `Create a pending refund of ${money(amountToRefund)}? This will not transfer money.`,
                          )
                        ) {
                          return;
                        }

                        runAction(
                          () =>
                            createReturnRefund({
                              returnRequestId: request.id,
                              amount: amountToRefund,
                              method: refundMethod,
                              internalNotes: refundNotes,
                            }),
                          "Pending refund created. Transfer the amount manually before marking it completed.",
                        );

                        setRefundAmount("");
                        setRefundNotes("");
                      }}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#071A35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102B50] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <IndianRupee size={16} />
                      Create pending refund
                    </button>
                  </>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      No refundable balance available
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {hasAnyReservedRefund
                        ? "Existing pending, processing or completed refunds already reserve the available balance. Review those refunds before creating another."
                        : "The amount paid is zero or no refundable balance is available for this order."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!canRefund && (
              <p className="mt-4 rounded-lg bg-white p-3 text-xs leading-5 text-slate-600">
                Only ADMIN or OWNER can create refunds or confirm transfers.
              </p>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-800">
        {value || "—"}
      </dd>
    </div>
  );
}

function QuantityInput({
  label,
  value,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0 text-xs font-semibold text-slate-600">
      {label}
      <input
        type="number"
        min={0}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm font-normal text-slate-900 outline-none focus:border-[#D4AF37] disabled:bg-slate-100 disabled:text-slate-500"
      />
    </label>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  variant?: "primary" | "danger";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        variant === "danger"
          ? "border border-red-200 bg-white text-red-700 hover:bg-red-50"
          : "bg-[#071A35] text-white hover:bg-[#102B50]"
      }`}
    >
      {children}
    </button>
  );
}
