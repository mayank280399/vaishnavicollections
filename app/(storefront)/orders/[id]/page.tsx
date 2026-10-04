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
  Truck,
  XCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import CancelOrderButton from "./cancel-order-button";

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
  | "PAID"
  | "FAILED"
  | "REFUNDED";

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
  product_sku: string | null;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type Shipment = {
  id: string;
  order_id: string;

  delivery_partner: string | null;
  tracking_number: string | null;
  tracking_url: string | null;

  shipped_at: string | null;
  out_for_delivery_at: string | null;
  delivered_at: string | null;

  delivery_notes: string | null;
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_STEPS: {
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
    label: "Processing",
  },
  {
    key: "SHIPPED",
    label: "Shipped",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
  },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash on Delivery",
  UPI: "UPI",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "Order Placed";
    case "CONFIRMED":
      return "Confirmed";
    case "PROCESSING":
      return "Processing";
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

function getPaymentMethodLabel(method: string | null) {
  if (!method) {
    return "Not specified";
  }

  return PAYMENT_METHOD_LABELS[method] ?? method;
}

function getPaymentStatusLabel(status: PaymentStatus) {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

function ShipmentTimeline({
  shipment,
  orderStatus,
}: {
  shipment: Shipment;
  orderStatus: OrderStatus;
}) {
  const events = [
    {
      label: "Order Placed",
      date: null,
      active: true,
    },
    {
      label: "Shipped",
      date: shipment.shipped_at,
      active:
        Boolean(shipment.shipped_at) ||
        ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
          orderStatus,
        ),
    },
    {
      label: "Out for Delivery",
      date: shipment.out_for_delivery_at,
      active:
        Boolean(shipment.out_for_delivery_at) ||
        ["OUT_FOR_DELIVERY", "DELIVERED"].includes(orderStatus),
    },
    {
      label: "Delivered",
      date: shipment.delivered_at,
      active:
        Boolean(shipment.delivered_at) || orderStatus === "DELIVERED",
    },
  ];

  return (
    <div className="mt-6">
      <div className="space-y-5">
        {events.map((event, index) => (
          <div key={event.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  event.active
                    ? "bg-[#0f1f3d] text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {event.active ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Clock3 className="h-4 w-4" />
                )}
              </div>

              {index < events.length - 1 && (
                <div
                  className={`mt-1 h-7 w-px ${
                    events[index + 1]?.active
                      ? "bg-[#0f1f3d]"
                      : "bg-slate-200"
                  }`}
                />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <p
                className={`text-sm font-semibold ${
                  event.active
                    ? "text-slate-900"
                    : "text-slate-400"
                }`}
              >
                {event.label}
              </p>

              {event.date && (
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(event.date)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function OrderDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/orders/${id}`);
  }

  const { data: orderData, error: orderError } = await supabase
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

  const { data: orderItemsData, error: itemsError } =
    await supabase
      .from("order_items")
      .select(
        `
          id,
          product_id,
          product_name,
          product_sku,
          product_image,
          quantity,
          unit_price,
          total_price
        `,
      )
      .eq("order_id", order.id)
      .order("id", {
        ascending: true,
      });

  if (itemsError) {
    console.error("Order items fetch error:", itemsError);
  }

  const items = (orderItemsData ?? []) as OrderItem[];

  const { data: shipmentData, error: shipmentError } =
    await supabase
      .from("order_shipments")
      .select(
        `
          id,
          order_id,
          delivery_partner,
          tracking_number,
          tracking_url,
          shipped_at,
          out_for_delivery_at,
          delivered_at,
          delivery_notes
        `,
      )
      .eq("order_id", order.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (shipmentError) {
    console.error("Shipment fetch error:", shipmentError);
  }

  const shipment = shipmentData as Shipment | null;

  const currentStatusIndex = STATUS_STEPS.findIndex(
    (step) => step.key === order.status,
  );

  const isCancelled = order.status === "CANCELLED";

  const canCancelOrder =
    order.status === "PENDING" ||
    order.status === "CONFIRMED";

  // Important:
  // Keep the null check inside Boolean() so TypeScript correctly
  // narrows shipment before accessing its properties.
  const hasShipment = Boolean(
    shipment &&
      (
        shipment.delivery_partner ||
        shipment.tracking_number ||
        shipment.tracking_url ||
        shipment.shipped_at ||
        shipment.out_for_delivery_at ||
        shipment.delivered_at ||
        shipment.delivery_notes
      ),
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/orders"
              className="text-slate-500 transition hover:text-[#0f1f3d]"
            >
              My Orders
            </Link>

            <span className="text-slate-300">/</span>

            <span className="font-medium text-slate-900">
              {order.order_number}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="overflow-hidden rounded-3xl bg-[#0f1f3d] text-white shadow-lg">
          <div className="p-5 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#d4af37]" />

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]">
                    Order Details
                  </p>
                </div>

                <h1 className="mt-2 break-all text-2xl font-bold sm:text-3xl">
                  {order.order_number}
                </h1>

                <p className="mt-2 text-sm text-slate-300">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>

              <div
                className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isCancelled
                    ? "bg-red-500/15 text-red-200 ring-1 ring-red-400/30"
                    : "bg-white/10 text-white ring-1 ring-white/20"
                }`}
              >
                {getStatusLabel(order.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Cancelled state */}
        {isCancelled && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-900">
                  This order has been cancelled.
                </p>

                <p className="mt-1 text-sm leading-5 text-red-700">
                  If you already made a payment, any applicable
                  refund will need to be handled according to the
                  store&apos;s refund process.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status progress */}
        {!isCancelled && (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Order Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track your order progress
                </p>
              </div>

              <Truck className="h-5 w-5 text-[#0f1f3d]" />
            </div>

            <div className="mt-7 overflow-x-auto pb-2">
              <div className="flex min-w-[620px]">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted =
                    currentStatusIndex >= index;
                  const isCurrent =
                    currentStatusIndex === index;

                  return (
                    <div
                      key={step.key}
                      className="relative flex-1"
                    >
                      {index < STATUS_STEPS.length - 1 && (
                        <div
                          className={`absolute left-1/2 right-0 top-4 h-0.5 ${
                            currentStatusIndex > index
                              ? "bg-[#0f1f3d]"
                              : "bg-slate-200"
                          }`}
                        />
                      )}

                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                            isCompleted
                              ? "border-[#0f1f3d] bg-[#0f1f3d] text-white"
                              : "border-slate-200 bg-white text-slate-400"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-current" />
                          )}
                        </div>

                        <p
                          className={`mt-3 text-xs font-semibold ${
                            isCurrent
                              ? "text-[#0f1f3d]"
                              : isCompleted
                                ? "text-slate-700"
                                : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Shipment / Tracking */}
        {hasShipment && shipment && (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#0f1f3d]" />

                  <h2 className="text-lg font-bold text-slate-900">
                    Shipment &amp; Tracking
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Track the delivery of your order.
                </p>
              </div>

              {shipment.delivery_partner && (
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                  {shipment.delivery_partner}
                </div>
              )}
            </div>

            {(shipment.tracking_number ||
              shipment.tracking_url) && (
              <div className="mt-5 rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tracking Number
                </p>

                {shipment.tracking_number && (
                  <p className="mt-1 break-all text-base font-bold text-slate-900">
                    {shipment.tracking_number}
                  </p>
                )}

                {shipment.tracking_url && (
                  <a
                    href={shipment.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#0f1f3d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172b52]"
                  >
                    Track Shipment
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            <ShipmentTimeline
              shipment={shipment}
              orderStatus={order.status}
            />

            {shipment.delivery_notes && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Delivery Notes
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {shipment.delivery_notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              Items
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {items.length}{" "}
              {items.length === 1 ? "item" : "items"} in this order
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-5 sm:p-6"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:h-24 sm:w-24">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-7 w-7 text-slate-300" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {item.product_name}
                  </p>

                  {item.product_sku && (
                    <p className="mt-1 text-xs text-slate-500">
                      SKU: {item.product_sku}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="text-slate-500">
                      Qty:{" "}
                      <span className="font-semibold text-slate-700">
                        {item.quantity}
                      </span>
                    </span>

                    <span className="text-slate-500">
                      {formatCurrency(item.unit_price)} each
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-bold text-slate-900">
                    {formatCurrency(item.total_price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary + customer/address */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Summary */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              Order Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Shipping</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(order.shipping_amount)}
                </span>
              </div>

              {order.discount_amount > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(order.discount_amount)}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-bold text-slate-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-[#0f1f3d]">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Payment method
                </span>

                <span className="text-right text-sm font-semibold text-slate-800">
                  {getPaymentMethodLabel(order.payment_method)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Payment status
                </span>

                <span
                  className={`text-sm font-semibold ${
                    order.payment_status === "PAID"
                      ? "text-green-600"
                      : order.payment_status === "FAILED"
                        ? "text-red-600"
                        : order.payment_status === "REFUNDED"
                          ? "text-purple-600"
                          : "text-amber-600"
                  }`}
                >
                  {getPaymentStatusLabel(order.payment_status)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer / address */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#0f1f3d]" />

              <h2 className="text-lg font-bold text-slate-900">
                Delivery Details
              </h2>
            </div>

            <div className="mt-5">
              <p className="font-semibold text-slate-900">
                {order.customer_name}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {order.customer_phone}
              </p>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-700">
                {order.shipping_address_line1}
                {order.shipping_address_line2 && (
                  <>
                    <br />
                    {order.shipping_address_line2}
                  </>
                )}
                <br />
                {order.shipping_city},{" "}
                {order.shipping_state}{" "}
                {order.shipping_postal_code}
                <br />
                {order.shipping_country}
              </p>
            </div>

            {order.notes && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Order Notes
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#0f1f3d] hover:text-[#0f1f3d]"
            >
              <ArrowLeft className="h-4 w-4" />
              My Orders
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f1f3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172b52]"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {canCancelOrder && (
            <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Need to cancel this order?
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Cancellation is available while your order has
                  not entered processing.
                </p>
              </div>

              <CancelOrderButton orderId={order.id} />
            </div>
          )}

          {isCancelled && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                This order has been cancelled.
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                If you already made a payment, any applicable refund
                will need to be handled according to the store&apos;s
                refund process.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}