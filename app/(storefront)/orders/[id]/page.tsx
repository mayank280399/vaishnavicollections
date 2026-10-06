import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  Package,
  Smartphone,
  Truck,
  XCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import CancelOrderButton from "./cancel-order-button";
import PaymentConfirmationButton from "./payment-confirmation-button";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

type PaymentStatus =
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

type PaymentOption = "upi_full" | "upi_partial";

type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  customer_name: string;
  customer_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type Shipment = {
  id: string;
  tracking_number: string | null;
  carrier: string | null;
  status: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    payment?: string;
    option?: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeWhatsAppNumber(
  value: string | null | undefined,
) {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  // Indian 10-digit mobile number.
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // Already includes India's country code.
  if (digits.startsWith("91") && digits.length === 12) {
    return digits;
  }

  return digits;
}

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "Order Placed";
    case "CONFIRMED":
      return "Confirmed";
    case "PROCESSING":
      return "Preparing";
    case "SHIPPED":
      return "Shipped";
    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function getPaymentStatusLabel(status: PaymentStatus) {
  switch (status) {
    case "PENDING":
      return "Payment Pending";
    case "PARTIALLY_PAID":
      return "Partially Paid";
    case "PAID":
      return "Payment Verified";
    case "FAILED":
      return "Payment Failed";
    case "REFUNDED":
      return "Refunded";
    default:
      return status;
  }
}

function getPaymentOption(
  value: string | undefined,
): PaymentOption {
  return value === "upi_partial"
    ? "upi_partial"
    : "upi_full";
}

function ShipmentTimeline({
  shipment,
}: {
  shipment: Shipment | null;
}) {
  if (!shipment) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0f1f3d] text-white">
          <Truck className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#0f1f3d]">
            Shipment Tracking
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {shipment.carrier
              ? shipment.carrier
              : "Shipment information"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {shipment.tracking_number && (
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tracking Number
            </p>

            <p className="mt-1 break-all text-sm font-bold text-[#0f1f3d]">
              {shipment.tracking_number}
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {shipment.shipped_at && (
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Shipped
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {formatDate(shipment.shipped_at)}
              </p>
            </div>
          )}

          {shipment.delivered_at && (
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Delivered
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {formatDate(shipment.delivered_at)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function OrderDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirect=${encodeURIComponent(
        `/orders/${id}`,
      )}`,
    );
  }

  const { data: orderData, error: orderError } =
    await supabase
      .from("orders")
      .select(
        `
          id,
          order_number,
          status,
          payment_status,
          payment_method,
          subtotal,
          shipping_amount,
          discount_amount,
          total_amount,
          amount_paid,
          amount_due,
          customer_name,
          customer_phone,
          shipping_address_line1,
          shipping_address_line2,
          shipping_city,
          shipping_state,
          shipping_postal_code,
          shipping_country,
          notes,
          created_at,
          updated_at
        `,
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

  if (orderError) {
    console.error("Order fetch error:", orderError);
  }

  if (!orderData) {
    redirect("/orders");
  }

  const order = orderData as Order;

  const [
    { data: orderItemsData, error: orderItemsError },
    { data: shipmentData, error: shipmentError },
    { data: settingsData, error: settingsError },
  ] = await Promise.all([
    supabase
      .from("order_items")
      .select(
        `
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price
        `,
      )
      .eq("order_id", order.id)
      .order("created_at", {
        ascending: true,
      }),

    supabase
      .from("order_shipments")
      .select(
        `
          id,
          tracking_number,
          carrier,
          status,
          shipped_at,
          delivered_at,
          created_at
        `,
      )
      .eq("order_id", order.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("app_settings")
      .select(
        `
          shop_name,
          currency,
          currency_symbol,
          whatsapp_number,
          upi_id
        `,
      )
      .eq("id", 1)
      .maybeSingle(),
  ]);

  if (orderItemsError) {
    console.error(
      "Order items fetch error:",
      orderItemsError,
    );
  }

  if (shipmentError) {
    console.error(
      "Shipment fetch error:",
      shipmentError,
    );
  }

  if (settingsError) {
    console.error(
      "App settings fetch error:",
      settingsError,
    );
  }

  const orderItems = (orderItemsData ??
    []) as OrderItem[];

  const shipment = (shipmentData ??
    null) as Shipment | null;

  const paymentOption = getPaymentOption(query.option);

  const isUpiOrder =
    order.payment_method === "UPI";

  const isPaymentPending =
    order.payment_status === "PENDING" ||
    order.payment_status === "PARTIALLY_PAID";

  const isPaymentCompleted =
    order.payment_status === "PAID";

  const isPartialPayment =
    paymentOption === "upi_partial";

  /*
   * Current partial-payment amount.
   *
   * This remains aligned with the checkout flow for now.
   * Payment-plan persistence can be added to the orders table
   * separately later.
   */
  const configuredPartialAdvance = Math.min(
    149,
    Number(order.total_amount) || 0,
  );

  const paymentAmount = isPartialPayment
    ? configuredPartialAdvance
    : Number(order.amount_due) > 0
      ? Number(order.amount_due)
      : Number(order.total_amount);

  const remainingAfterAdvance = Math.max(
    Number(order.total_amount) - paymentAmount,
    0,
  );

  const whatsappNumber =
    normalizeWhatsAppNumber(
      settingsData?.whatsapp_number,
    );

  const upiIds = String(
    settingsData?.upi_id ?? "",
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const whatsappMessage = [
    "Hello Vaishnavi Collections,",
    "",
    "I have made the UPI payment for my order.",
    "",
    `Order ID: ${order.order_number}`,
    `Customer: ${order.customer_name}`,
    `Amount paid: ${formatCurrency(paymentAmount)}`,
    `Payment option: ${
      isPartialPayment
        ? "Partial UPI Advance"
        : "Full UPI Payment"
    }`,
    "",
    "Please verify my payment and confirm my order.",
  ].join("\n");

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        whatsappMessage,
      )}`
    : null;

  const hasShipment = Boolean(shipment);

  const isCancelled =
    order.status === "CANCELLED";

  const isDelivered =
    order.status === "DELIVERED";

  const isShipped =
    order.status === "SHIPPED" ||
    order.status === "OUT_FOR_DELIVERY";

  const canCancel =
    !isCancelled &&
    !isDelivered &&
    order.status !== "SHIPPED" &&
    order.status !== "OUT_FOR_DELIVERY";

  const statusSteps: {
    key: OrderStatus;
    label: string;
  }[] = [
    {
      key: "PENDING",
      label: "Order Placed",
    },
    {
      key: "CONFIRMED",
      label: "Confirmed",
    },
    {
      key: "PROCESSING",
      label: "Preparing",
    },
    {
      key: "SHIPPED",
      label: "Shipped",
    },
    {
      key: "DELIVERED",
      label: "Delivered",
    },
  ];

  const statusOrder: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const currentStatusIndex =
    statusOrder.indexOf(order.status);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-[#0f1f3d] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-[#D4AF37]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
                Vaishnavi Collections
              </p>

              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Order {order.order_number}
              </h1>

              <p className="mt-2 text-sm text-white/65">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                isCancelled
                  ? "bg-red-500/15 text-red-200"
                  : isDelivered
                    ? "bg-emerald-500/15 text-emerald-200"
                    : "bg-white/10 text-white"
              }`}
            >
              {isCancelled ? (
                <XCircle className="h-4 w-4" />
              ) : isDelivered ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Clock3 className="h-4 w-4" />
              )}

              {getStatusLabel(order.status)}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
        {/* Payment Section */}
        {isUpiOrder &&
          isPaymentPending &&
          !isCancelled && (
            <section className="mb-6 overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-white shadow-sm">
              <div className="border-b border-[#D4AF37]/20 bg-[#0f1f3d] px-5 py-5 text-white sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37] text-[#0f1f3d]">
                    <Smartphone className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold">
                      Complete Your UPI Payment
                    </h2>

                    <p className="mt-1 text-sm text-white/70">
                      Your order has been created. Complete
                      the payment and confirm it with us on
                      WhatsApp.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                  {/* QR */}
                  <div className="flex flex-col items-center rounded-3xl bg-slate-50 p-5 text-center">
                    <p className="text-sm font-bold text-[#0f1f3d]">
                      {isPartialPayment
                        ? "Scan & Pay Advance"
                        : "Scan & Pay Full Amount"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {isPartialPayment
                        ? "Pay the advance amount shown below."
                        : "Pay the full order amount shown below."}
                    </p>

                    <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <img
                        src="/upi-qr.png"
                        alt="Vaishnavi Collections UPI QR Code"
                        className="h-56 w-56 object-contain sm:h-64 sm:w-64"
                      />
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Amount to Pay
                      </p>

                      <p className="mt-1 text-2xl font-extrabold text-[#0f1f3d]">
                        {formatCurrency(paymentAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex flex-col justify-center">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-500">
                          Order Total
                        </span>

                        <span className="text-sm font-bold text-[#0f1f3d]">
                          {formatCurrency(
                            order.total_amount,
                          )}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-500">
                          {isPartialPayment
                            ? "Advance"
                            : "Amount Due"}
                        </span>

                        <span className="text-sm font-bold text-[#0f1f3d]">
                          {formatCurrency(paymentAmount)}
                        </span>
                      </div>

                      {isPartialPayment && (
                        <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                          <span className="text-sm text-slate-500">
                            Remaining
                          </span>

                          <span className="text-sm font-extrabold text-[#0f1f3d]">
                            {formatCurrency(
                              remainingAfterAdvance,
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* {upiIds.length > 0 && (
                      <div className="mt-5 w-full rounded-2xl bg-slate-50 p-4">
                        <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                          UPI ID
                          {upiIds.length > 1
                            ? "s"
                            : ""}
                        </p>

                        <div className="mt-2 space-y-2">
                          {upiIds.map((upiId) => (
                            <p
                              key={upiId}
                              className="break-all text-center text-sm font-bold text-[#0f1f3d]"
                            >
                              {upiId}
                            </p>
                          ))}
                        </div>
                      </div>
                    )} */}

                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-bold text-amber-900">
                        Important
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        After making the UPI payment, please
                        confirm it using WhatsApp. Your payment
                        will remain pending until Vaishnavi
                        Collections verifies the transaction.
                      </p>
                    </div>

                    {whatsappUrl ? (
                      <div className="mt-5">
                        <PaymentConfirmationButton
                          whatsappUrl={whatsappUrl}
                        />
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                        <p className="text-sm font-semibold text-slate-600">
                          WhatsApp confirmation is currently
                          unavailable.
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Please contact Vaishnav Collections
                          directly to confirm your payment.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* Payment Completed */}
        {isUpiOrder &&
          isPaymentCompleted &&
          !isCancelled && (
            <section className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-emerald-900">
                    Payment Verified
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    Your payment has been verified and your
                    order is being processed.
                  </p>
                </div>
              </div>
            </section>
          )}

        {/* Cancelled */}
        {isCancelled && (
          <section className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white">
                <XCircle className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-extrabold text-red-900">
                  Order Cancelled
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-800">
                  This order has been cancelled and will not
                  be processed further.
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            {/* Status Progress */}
            {!isCancelled && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-extrabold text-[#0f1f3d]">
                      Order Status
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {getStatusLabel(order.status)}
                    </p>
                  </div>

                  <Package className="h-5 w-5 text-[#D4AF37]" />
                </div>

                <div className="mt-6">
                  <div className="hidden sm:block">
                    <div className="flex items-start">
                      {statusSteps.map(
                        (step, index) => {
                          const stepIndex =
                            statusOrder.indexOf(
                              step.key,
                            );

                          const completed =
                            currentStatusIndex >=
                            stepIndex;

                          const isCurrent =
                            order.status ===
                            step.key ||
                            (order.status ===
                              "OUT_FOR_DELIVERY" &&
                              step.key ===
                                "SHIPPED");

                          return (
                            <div
                              key={step.key}
                              className="flex flex-1 items-start"
                            >
                              <div className="flex flex-col items-center">
                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                                    completed
                                      ? "border-[#D4AF37] bg-[#D4AF37] text-[#0f1f3d]"
                                      : "border-slate-200 bg-white text-slate-300"
                                  }`}
                                >
                                  {completed ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    <span className="h-2 w-2 rounded-full bg-current" />
                                  )}
                                </div>

                                <p
                                  className={`mt-2 text-center text-[11px] font-bold ${
                                    isCurrent
                                      ? "text-[#0f1f3d]"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {step.label}
                                </p>
                              </div>

                              {index <
                                statusSteps.length -
                                  1 && (
                                <div
                                  className={`mt-4 h-0.5 flex-1 ${
                                    currentStatusIndex >
                                    stepIndex
                                      ? "bg-[#D4AF37]"
                                      : "bg-slate-200"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 sm:hidden">
                    {statusSteps.map(
                      (step) => {
                        const stepIndex =
                          statusOrder.indexOf(
                            step.key,
                          );

                        const completed =
                          currentStatusIndex >=
                          stepIndex;

                        const isCurrent =
                          order.status ===
                            step.key ||
                          (order.status ===
                            "OUT_FOR_DELIVERY" &&
                            step.key ===
                              "SHIPPED");

                        return (
                          <div
                            key={step.key}
                            className="flex items-center gap-3"
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                                completed
                                  ? "border-[#D4AF37] bg-[#D4AF37] text-[#0f1f3d]"
                                  : "border-slate-200 bg-white text-slate-300"
                              }`}
                            >
                              {completed ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-current" />
                              )}
                            </div>

                            <span
                              className={`text-sm font-bold ${
                                isCurrent
                                  ? "text-[#0f1f3d]"
                                  : "text-slate-400"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Shipment */}
            {hasShipment && (
              <ShipmentTimeline
                shipment={shipment}
              />
            )}

            {/* Items */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#0f1f3d]">
                    Order Items
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {orderItems.length}{" "}
                    {orderItems.length === 1
                      ? "item"
                      : "items"}
                  </p>
                </div>

                <Package className="h-5 w-5 text-[#D4AF37]" />
              </div>

              <div className="mt-5 divide-y divide-slate-100">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[#0f1f3d]">
                      <Package className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#0f1f3d]">
                        {item.product_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Qty: {item.quantity} ×{" "}
                        {formatCurrency(
                          item.unit_price,
                        )}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-extrabold text-[#0f1f3d]">
                      {formatCurrency(
                        item.total_price,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Summary */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-extrabold text-[#0f1f3d]">
                Order Summary
              </h2>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-semibold text-slate-700">
                    {formatCurrency(
                      order.subtotal,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-500">
                    Shipping
                  </span>

                  <span className="font-semibold text-slate-700">
                    {Number(
                      order.shipping_amount,
                    ) > 0
                      ? formatCurrency(
                          order.shipping_amount,
                        )
                      : "Free"}
                  </span>
                </div>

                {Number(
                  order.discount_amount,
                ) > 0 && (
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-500">
                      Discount
                    </span>

                    <span className="font-semibold text-emerald-600">
                      -
                      {formatCurrency(
                        order.discount_amount,
                      )}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-bold text-[#0f1f3d]">
                      Total
                    </span>

                    <span className="text-xl font-extrabold text-[#0f1f3d]">
                      {formatCurrency(
                        order.total_amount,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Summary */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-extrabold text-[#0f1f3d]">
                  Payment
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    order.payment_status ===
                    "PAID"
                      ? "bg-emerald-50 text-emerald-700"
                      : order.payment_status ===
                          "FAILED"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {getPaymentStatusLabel(
                    order.payment_status,
                  )}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-500">
                    Method
                  </span>

                  <span className="font-semibold text-slate-700">
                    {order.payment_method ||
                      "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-500">
                    Amount Paid
                  </span>

                  <span className="font-semibold text-slate-700">
                    {formatCurrency(
                      order.amount_paid,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-500">
                    Amount Due
                  </span>

                  <span className="font-semibold text-slate-700">
                    {formatCurrency(
                      order.amount_due,
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* Delivery Details */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-[#0f1f3d]">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-[#0f1f3d]">
                    Delivery Details
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Shipping information
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-bold text-[#0f1f3d]">
                  {order.customer_name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {order.customer_phone}
                </p>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  <p>
                    {order.shipping_address_line1}
                  </p>

                  {order.shipping_address_line2 && (
                    <p>
                      {order.shipping_address_line2}
                    </p>
                  )}

                  <p>
                    {order.shipping_city},{" "}
                    {order.shipping_state}{" "}
                    {order.shipping_postal_code}
                  </p>

                  <p>
                    {order.shipping_country}
                  </p>
                </div>

                {order.notes && (
                  <div className="mt-4 rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Order Notes
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/products"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-[#0f1f3d] shadow-sm transition hover:border-[#D4AF37] hover:bg-[#fffcf2]"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>

              {canCancel && (
                <CancelOrderButton
                  orderId={order.id}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-slate-400">
            Order placed on{" "}
            {formatDate(order.created_at)}
          </p>

          {hasShipment &&
            shipment?.tracking_number && (
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Truck className="h-3.5 w-3.5" />
                Tracking available
              </p>
            )}
        </div>
      </div>
    </main>
  );
}