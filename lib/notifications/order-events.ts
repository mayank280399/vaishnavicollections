import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNotification } from "@/lib/notifications/push-server";

type OrderSnapshot = {
  id: string;
  user_id: string | null;
  order_number: string | null;
  status: string | null;
  payment_status: string | null;
  customer_name: string | null;
  updated_at: string | null;
};

type EventNotification = {
  userId: string;
  type: string;
  title: string;
  body: string;
  clickUrl: string;
  eventKey: string;
  orderId: string;
  orderNumber: string;
  event: string;
};

async function createOnce(input: EventNotification) {
  const admin = createAdminClient();

  // Stable event keys make retries safe and avoid duplicate in-app/push alerts.
  const { data: existing, error: lookupError } = await admin
    .from("notifications")
    .select("id")
    .eq("user_id", input.userId)
    .contains("metadata", { event_key: input.eventKey })
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error("Notification idempotency check failed:", lookupError.message);
    return;
  }

  if (existing) return;

  try {
    await sendPushNotification({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      clickUrl: input.clickUrl,
      metadata: {
        event_key: input.eventKey,
        event: input.event,
        order_id: input.orderId,
        order_number: input.orderNumber,
      },
    });
  } catch (error) {
    // Do not undo an order or payment because notification delivery failed.
    console.error("Could not send order notification:", error);
  }
}

async function getOrder(orderId: string): Promise<OrderSnapshot | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("id, user_id, order_number, status, payment_status, customer_name, updated_at")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("Could not load order for notifications:", error.message);
    return null;
  }

  return (data as OrderSnapshot | null) ?? null;
}

async function getStaffIds() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, role")
    .in("role", ["ADMIN", "OWNER", "STAFF"]);

  if (error) {
    console.error("Could not load staff notification recipients:", error.message);
    return [];
  }

  return (data ?? [])
    .map((profile: { id: string }) => profile.id)
    .filter((id: string) => Boolean(id));
}

export async function notifyStaffNewOrder(orderId: string) {
  const order = await getOrder(orderId);
  if (!order) return;

  const orderNumber = order.order_number || order.id;
  const eventKey = `order:new:${order.id}`;
  const recipients = await getStaffIds();

  await Promise.all(
    recipients.map((userId) =>
      createOnce({
        userId,
        type: "NEW_ORDER",
        title: "New order received",
        body: `Order ${orderNumber} has been placed by ${order.customer_name || "a customer"}.`,
        clickUrl: "/admin/orders",
        eventKey,
        orderId: order.id,
        orderNumber,
        event: "order_created",
      }),
    ),
  );
}

export async function notifyOrderPaymentReceived(orderId: string) {
  const order = await getOrder(orderId);
  if (!order || !order.user_id || order.payment_status !== "PAID") return;

  const orderNumber = order.order_number || order.id;
  const eventKey = `order:paid:${order.id}`;
  const body = `Payment for order ${orderNumber} has been verified successfully.`;

  const staffRecipients = await getStaffIds();
  await Promise.all([
    createOnce({
      userId: order.user_id,
      type: "PAYMENT_SUCCESS",
      title: "Payment successful",
      body,
      clickUrl: `/orders/${encodeURIComponent(order.id)}`,
      eventKey,
      orderId: order.id,
      orderNumber,
      event: "payment_verified",
    }),
    ...staffRecipients.map((userId) =>
      createOnce({
        userId,
        type: "PAYMENT_RECEIVED",
        title: "Payment received",
        body,
        clickUrl: "/admin/orders",
        eventKey,
        orderId: order.id,
        orderNumber,
        event: "payment_verified",
      }),
    ),
  ]);
}

export async function notifyCustomerOrderStatusChanged(orderId: string) {
  const order = await getOrder(orderId);
  if (!order || !order.user_id) return;

  const status = String(order.status || "").toUpperCase();
  const orderNumber = order.order_number || order.id;
  const labels: Record<string, { title: string; body: string }> = {
    CONFIRMED: {
      title: "Order confirmed",
      body: `Your order ${orderNumber} has been confirmed by Vaishnavi Collections.`,
    },
    PROCESSING: {
      title: "Your order is being prepared",
      body: `We are preparing your order ${orderNumber}.`,
    },
    SHIPPED: {
      title: "Your order has been shipped",
      body: `Your order ${orderNumber} has been shipped.`,
    },
    OUT_FOR_DELIVERY: {
      title: "Your order is out for delivery",
      body: `Your order ${orderNumber} is out for delivery.`,
    },
    DELIVERED: {
      title: "Order delivered",
      body: `Your order ${orderNumber} has been marked as delivered. Thank you for shopping with us!`,
    },
    CANCELLED: {
      title: "Order cancelled",
      body: `Your order ${orderNumber} has been cancelled. Please contact us if you need help.`,
    },
  };

  const message = labels[status];
  if (!message) return;

  await createOnce({
    userId: order.user_id,
    type: "ORDER_STATUS",
    title: message.title,
    body: message.body,
    clickUrl: `/orders/${encodeURIComponent(order.id)}`,
    eventKey: `order:status:${order.id}:${status}:${order.updated_at || "unknown"}`,
    orderId: order.id,
    orderNumber,
    event: `order_status_${status.toLowerCase()}`,
  });
}
