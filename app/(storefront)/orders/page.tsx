"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  ExternalLink,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

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

type PaymentPlan =
  | "FULL"
  | "PARTIAL";

type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;

  payment_status: PaymentStatus;
  payment_method: string | null;
  payment_plan: PaymentPlan;

  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;

  amount_paid: number;
  amount_due: number;

  customer_name: string;
  created_at: string;
};

type OrderItem = {
  order_id: string;
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
  created_at: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
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
      return String(status);
  }
}

function getStatusClasses(status: OrderStatus) {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    case "OUT_FOR_DELIVERY":
      return "bg-orange-50 text-orange-700 border-orange-200";

    case "SHIPPED":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "CONFIRMED":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "PROCESSING":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "PENDING":
    default:
      return "bg-orange-50 text-orange-700 border-orange-200";
  }
}

function getPaymentStatusLabel(
  paymentStatus: PaymentStatus,
) {
  switch (paymentStatus) {
    case "PENDING":
      return "Payment Pending";

    case "PARTIALLY_PAID":
      return "Partially Paid";

    case "PAID":
      return "Paid";

    case "FAILED":
      return "Payment Failed";

    case "REFUNDED":
      return "Refunded";

    default:
      return String(paymentStatus);
  }
}

function getPaymentStatusClasses(
  paymentStatus: PaymentStatus,
) {
  switch (paymentStatus) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "PARTIALLY_PAID":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "REFUNDED":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "FAILED":
      return "bg-red-50 text-red-700 border-red-200";

    case "PENDING":
    default:
      return "bg-orange-50 text-orange-700 border-orange-200";
  }
}

function getPaymentLabel(paymentMethod: string | null) {
  if (!paymentMethod) {
    return "Not specified";
  }

  switch (paymentMethod.toUpperCase()) {
    case "CASH":
      return "Cash on Delivery";

    case "UPI":
      return "UPI";

    case "CARD":
      return "Card";

    case "BANK_TRANSFER":
      return "Bank Transfer";

    default:
      return paymentMethod
        .split("_")
        .join(" ");
  }
}

function getShipmentStatus(
  shipment: Shipment | undefined,
  orderStatus: OrderStatus,
) {
  if (
    shipment?.delivered_at ||
    orderStatus === "DELIVERED"
  ) {
    return {
      label: "Delivered",
      classes:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (
    shipment?.out_for_delivery_at ||
    orderStatus === "OUT_FOR_DELIVERY"
  ) {
    return {
      label: "Out for Delivery",
      classes:
        "bg-orange-50 text-orange-700 border-orange-200",
    };
  }

  if (
    shipment?.shipped_at ||
    orderStatus === "SHIPPED"
  ) {
    return {
      label: "Shipped",
      classes:
        "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  if (shipment) {
    return {
      label: "Shipment Created",
      classes:
        "bg-purple-50 text-purple-700 border-purple-200",
    };
  }

  return {
    label: "Not Dispatched",
    classes:
      "bg-slate-50 text-slate-600 border-slate-200",
  };
}

function getShipmentDescription(
  shipment: Shipment | undefined,
  orderStatus: OrderStatus,
) {
  if (
    shipment?.delivered_at ||
    orderStatus === "DELIVERED"
  ) {
    return "Your order has been delivered.";
  }

  if (
    shipment?.out_for_delivery_at ||
    orderStatus === "OUT_FOR_DELIVERY"
  ) {
    return "Your order is out for delivery.";
  }

  if (
    shipment?.shipped_at ||
    orderStatus === "SHIPPED"
  ) {
    return "Your order has been dispatched.";
  }

  if (shipment) {
    return "Shipment details are available.";
  }

  if (orderStatus === "PROCESSING") {
    return "Your order is being prepared.";
  }

  if (orderStatus === "CONFIRMED") {
    return "Your order has been confirmed and will be prepared soon.";
  }

  if (orderStatus === "PENDING") {
    return "Your order has been placed and is awaiting confirmation.";
  }

  if (orderStatus === "CANCELLED") {
    return "This order has been cancelled.";
  }

  return "Shipment details will appear after dispatch.";
}

export default function OrdersPage() {
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [itemCounts, setItemCounts] = useState<
    Record<string, number>
  >({});
  const [shipments, setShipments] = useState<
    Record<string, Shipment>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      setLoading(true);
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
          if (mounted) {
            setOrders([]);
            setItemCounts({});
            setShipments({});
            setLoading(false);
          }

          return;
        }

        const {
          data: orderData,
          error: ordersError,
        } = await supabase
          .from("orders")
          .select(`
            id,
            order_number,
            status,
            payment_status,
            payment_method,
            payment_plan,
            subtotal,
            shipping_amount,
            discount_amount,
            total_amount,
            amount_paid,
            amount_due,
            customer_name,
            created_at
          `)
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (ordersError) {
          throw ordersError;
        }

        type SupabaseOrderRow = {
          id: string;
          order_number: string;
          status: string;
          payment_status: string;
          payment_method: string | null;
          payment_plan: string | null;
          subtotal: number | string | null;
          shipping_amount: number | string | null;
          discount_amount: number | string | null;
          total_amount: number | string | null;
          amount_paid: number | string | null;
          amount_due: number | string | null;
          customer_name: string;
          created_at: string;
        };

        const rawOrders =
          (orderData ?? []) as SupabaseOrderRow[];

        const loadedOrders: Order[] =
          rawOrders.map(
            (order: SupabaseOrderRow) => ({
              id: order.id,
              order_number: order.order_number,

              status:
                order.status as OrderStatus,

              payment_status:
                order.payment_status as PaymentStatus,

              payment_method:
                order.payment_method,

              payment_plan:
                order.payment_plan === "PARTIAL"
                  ? "PARTIAL"
                  : "FULL",

              subtotal: Number(
                order.subtotal ?? 0,
              ),

              shipping_amount: Number(
                order.shipping_amount ?? 0,
              ),

              discount_amount: Number(
                order.discount_amount ?? 0,
              ),

              total_amount: Number(
                order.total_amount ?? 0,
              ),

              amount_paid: Number(
                order.amount_paid ?? 0,
              ),

              amount_due: Number(
                order.amount_due ?? 0,
              ),

              customer_name:
                order.customer_name,

              created_at:
                order.created_at,
            }),
          );

        if (!mounted) {
          return;
        }

        setOrders(loadedOrders);

        if (loadedOrders.length === 0) {
          setItemCounts({});
          setShipments({});
          return;
        }

        const orderIds = loadedOrders.map(
          (order: Order) => order.id,
        );

        /*
         * Load order item counts.
         */
        const {
          data: itemData,
          error: itemError,
        } = await supabase
          .from("order_items")
          .select("order_id")
          .in("order_id", orderIds);

        if (itemError) {
          console.error(
            "Unable to load order item counts:",
            itemError,
          );
        } else {
          const counts: Record<string, number> =
            {};

          (
            (itemData ?? []) as OrderItem[]
          ).forEach(
            (item: OrderItem) => {
              counts[item.order_id] =
                (counts[item.order_id] || 0) +
                1;
            },
          );

          if (mounted) {
            setItemCounts(counts);
          }
        }

        /*
         * Load shipment information.
         *
         * A shipment table currently allows more than
         * one shipment record per order, so we keep
         * the newest shipment for each order.
         */
        const {
          data: shipmentData,
          error: shipmentError,
        } = await supabase
          .from("order_shipments")
          .select(`
            id,
            order_id,
            delivery_partner,
            tracking_number,
            tracking_url,
            shipped_at,
            out_for_delivery_at,
            delivered_at,
            delivery_notes,
            created_at
          `)
          .in("order_id", orderIds)
          .order("created_at", {
            ascending: false,
          });

        if (shipmentError) {
          console.error(
            "Unable to load shipment information:",
            shipmentError,
          );
        } else {
          const shipmentMap: Record<
            string,
            Shipment
          > = {};

          (
            (shipmentData ?? []) as Shipment[]
          ).forEach(
            (shipment: Shipment) => {
              /*
               * Because the query is ordered newest
               * first, only keep the first shipment
               * for each order.
               */
              if (
                !shipmentMap[shipment.order_id]
              ) {
                shipmentMap[shipment.order_id] =
                  shipment;
              }
            },
          );

          if (mounted) {
            setShipments(shipmentMap);
          }
        }
      } catch (err) {
        console.error(
          "Orders page error:",
          err,
        );

        if (mounted) {
          setError(
            "Unable to load your orders. Please try again.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-40 rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-64 rounded bg-slate-100" />

            <div className="mt-8 space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="h-5 w-48 rounded bg-slate-200" />
                  <div className="mt-4 h-4 w-32 rounded bg-slate-100" />
                  <div className="mt-3 h-10 rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[70vh] bg-white">
        <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4">
          <div className="w-full rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Package className="h-6 w-6 text-red-600" />
            </div>

            <h1 className="mt-4 text-xl font-semibold text-slate-900">
              Unable to load orders
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-5 rounded-xl bg-[#0f1f3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172b52]"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-[#0f1f3d]"
            >
              Home
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-slate-800">
              My Orders
            </span>
          </div>

          <div className="mt-5">
            <h1 className="text-2xl font-bold tracking-tight text-[#0f1f3d] sm:text-3xl">
              My Orders
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Track and manage your Vaishnavi Collections
              orders.
            </p>
          </div>
        </div>
      </section>

      {/* Orders */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {orders.length === 0 ? (
          <div className="flex min-h-[45vh] items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0f1f3d]/5">
                <ShoppingBag className="h-7 w-7 text-[#0f1f3d]" />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-slate-900">
                No orders yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                You haven't placed an order with
                Vaishnavi Collections yet.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f1f3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172b52]"
              >
                Start Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(
              (order: Order) => {
                const itemCount =
                  itemCounts[order.id] || 0;

                const shipment =
                  shipments[order.id];

                const shipmentStatus =
                  getShipmentStatus(
                    shipment,
                    order.status,
                  );

                const shipmentDescription =
                  getShipmentDescription(
                    shipment,
                    order.status,
                  );

                const amountPaid = Number(
                  order.amount_paid ?? 0,
                );

                const amountDue = Number(
                  order.amount_due ?? 0,
                );

                const isPartialPayment =
                  order.payment_plan ===
                    "PARTIAL" ||
                  order.payment_status ===
                    "PARTIALLY_PAID";

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#d4af37]/50 hover:shadow-md sm:p-5"
                  >
                    {/* Top */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-bold text-[#0f1f3d] sm:text-lg">
                            {order.order_number}
                          </h2>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                              order.status,
                            )}`}
                          >
                            {getStatusLabel(
                              order.status,
                            )}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDate(
                              order.created_at,
                            )}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5" />
                            {itemCount}{" "}
                            {itemCount === 1
                              ? "item"
                              : "items"}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-lg font-bold text-[#0f1f3d]">
                          {formatCurrency(
                            Number(
                              order.total_amount,
                            ),
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {getPaymentLabel(
                            order.payment_method,
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              Payment
                            </p>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getPaymentStatusClasses(
                                order.payment_status,
                              )}`}
                            >
                              {getPaymentStatusLabel(
                                order.payment_status,
                              )}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {isPartialPayment
                              ? "Partial UPI payment"
                              : "Full payment"}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs text-slate-500">
                            Order Total
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-[#0f1f3d]">
                            {formatCurrency(
                              Number(
                                order.total_amount,
                              ),
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-200/70 pt-3">
                        <div>
                          <p className="text-[11px] text-slate-500">
                            Amount Paid
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-emerald-700">
                            {formatCurrency(
                              amountPaid,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-slate-500">
                            Amount Due
                          </p>

                          <p
                            className={`mt-0.5 text-sm font-semibold ${
                              amountDue > 0
                                ? "text-amber-700"
                                : "text-emerald-700"
                            }`}
                          >
                            {formatCurrency(
                              amountDue,
                            )}
                          </p>
                        </div>
                      </div>

                      {order.payment_status ===
                      "PAID" ? (
                        <p className="mt-3 text-xs font-medium text-emerald-600">
                          Payment received. Your
                          order is confirmed.
                        </p>
                      ) : order.payment_status ===
                        "PARTIALLY_PAID" ? (
                        <p className="mt-3 text-xs font-medium text-amber-700">
                          Your advance payment has
                          been received. The remaining
                          balance is due.
                        </p>
                      ) : order.payment_status ===
                        "REFUNDED" ? (
                        <p className="mt-3 text-xs font-medium text-purple-700">
                          Your payment has been
                          refunded.
                        </p>
                      ) : order.payment_status ===
                        "FAILED" ? (
                        <p className="mt-3 text-xs font-medium text-red-600">
                          Payment could not be verified.
                        </p>
                      ) : (
                        <p className="mt-3 text-xs text-slate-500">
                          Your payment is awaiting
                          verification.
                        </p>
                      )}
                    </div>

                    {/* Shipment */}
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f1f3d]/5">
                            <Truck className="h-5 w-5 text-[#0f1f3d]" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">
                                Delivery
                              </p>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${shipmentStatus.classes}`}
                              >
                                {
                                  shipmentStatus.label
                                }
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                shipmentDescription
                              }
                            </p>
                          </div>
                        </div>

                        {shipment?.tracking_url ? (
                          <a
                            href={
                              shipment.tracking_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#d4af37]/40 bg-white px-3 py-2 text-xs font-semibold text-[#0f1f3d] transition hover:border-[#d4af37] hover:bg-[#fffdf5]"
                          >
                            Track Shipment
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                      </div>

                      {shipment &&
                      (shipment.delivery_partner ||
                        shipment.tracking_number) ? (
                        <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/70 pt-3 text-xs sm:flex-row sm:items-center sm:gap-6">
                          {shipment.delivery_partner ? (
                            <div>
                              <span className="text-slate-500">
                                Courier
                              </span>

                              <p className="mt-0.5 font-semibold text-slate-800">
                                {
                                  shipment.delivery_partner
                                }
                              </p>
                            </div>
                          ) : null}

                          {shipment.tracking_number ? (
                            <div>
                              <span className="text-slate-500">
                                Tracking / AWB
                              </span>

                              <p className="mt-0.5 break-all font-semibold text-slate-800">
                                {
                                  shipment.tracking_number
                                }
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    {/* Divider */}
                    <div className="my-4 h-px bg-slate-100" />

                    {/* Bottom */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-slate-500">
                        {order.status ===
                        "CANCELLED" ? (
                          <span className="font-medium text-red-600">
                            This order has been
                            cancelled.
                          </span>
                        ) : order.payment_status ===
                          "PAID" ? (
                          <span className="font-medium text-emerald-600">
                            Payment received
                          </span>
                        ) : order.payment_status ===
                          "PARTIALLY_PAID" ? (
                          <span className="font-medium text-amber-700">
                            {formatCurrency(
                              amountDue,
                            )}{" "}
                            remaining
                          </span>
                        ) : order.payment_method ===
                          "CASH" ? (
                          <span>
                            Pay when your order is
                            delivered
                          </span>
                        ) : (
                          <span>
                            Payment:{" "}
                            {getPaymentStatusLabel(
                              order.payment_status,
                            )}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/orders/${order.id}`}
                        className="group inline-flex shrink-0 items-center justify-center gap-1.5 text-sm font-semibold text-[#0f1f3d] transition hover:text-[#8b6f16]"
                      >
                        View Order
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>
    </main>
  );
}