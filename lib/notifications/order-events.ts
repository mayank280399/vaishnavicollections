import "server-only";

import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

type OrderSnapshot = {
  id: string;
  user_id: string | null;
  order_number: string | null;
  status: string | null;
  payment_status: string | null;
  customer_name: string | null;
  updated_at: string | null;
};

type NotificationInput = {
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

function getPushSubscription(row: Record<string, unknown>) {
  const nested =
    (row.subscription as Record<string, unknown> | null) ??
    (row.push_subscription as Record<string, unknown> | null) ??
    (row.subscription_json as Record<string, unknown> | null);

  const source = nested ?? row;
  const endpoint = source.endpoint;
  const keys = (source.keys as Record<string, unknown> | undefined) ?? {};

  const p256dh = keys.p256dh ?? source.p256dh;
  const auth = keys.auth ?? source.auth;

  if (
    typeof endpoint !== "string" ||
    typeof p256dh !== "string" ||
    typeof auth !== "string"
  ) {
    return null;
  }

  return {
    endpoint,
    keys: { p256dh, auth },
  };
}

async function sendBrowserPush(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  input: Pick<NotificationInput, "title" | "body" | "clickUrl" | "eventKey">,
) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    // In-app notifications are still stored when push is not configured.
    return;
  }

  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:support@vaishnavicollections.com",
      publicKey,
      privateKey,
    );

    const { data: rows, error } = await admin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Could not load push subscriptions:", error.message);
      return;
    }

    await Promise.all(
      (rows ?? []).map(async (row: Record<string, unknown>) => {
        const subscription = getPushSubscription(row);
        if (!subscription) {
          console.warn("Skipping an invalid push subscription row.");
          return;
        }

        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title: input.title,
              body: input.body,
              url: input.clickUrl,
              tag: input.eventKey,
            }),
          );
        } catch (error) {
          const statusCode =
            typeof error === "object" && error !== null && "statusCode" in error
              ? Number((error as { statusCode?: unknown }).statusCode)
              : 0;

          // Remove expired browser subscriptions so they do not fail on every event.
          if ((statusCode === 404 || statusCode === 410) && row.id) {
            const { error: deleteError } = await admin
              .from("push_subscriptions")
              .delete()
              .eq("id", row.id);

            if (deleteError) {
              console.warn("Could not remove an expired push subscription:", deleteError.message);
            }
          } else {
            console.error("Browser push delivery failed:", error);
          }
        }
      }),
    );
  } catch (error) {
    // A push provider failure must never undo a valid order/payment update.
    console.error("Browser push notification error:", error);
  }
}

async function createNotification(input: NotificationInput) {
  const admin = createAdminClient();

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

  const { error: insertError } = await admin.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    click_url: input.clickUrl,
    metadata: {
      event_key: input.eventKey,
      event: input.event,
      order_id: input.orderId,
      order_number: input.orderNumber,
    },
  });

  if (insertError) {
    if (insertError.code !== "23505") {
      console.error("Could not create order notification:", insertError.message);
    }
    return;
  }

  await sendBrowserPush(admin, input.userId, input);
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
      createNotification({
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
  if (!order || !order.user_id) return;

  const orderNumber = order.order_number || order.id;
  const eventKey = `order:paid:${order.id}`;
  const body = `Payment for order ${orderNumber} has been verified successfully.`;

  const customerNotification = createNotification({
    userId: order.user_id,
    type: "PAYMENT_SUCCESS",
    title: "Payment successful",
    body,
    clickUrl: `/orders/${encodeURIComponent(order.id)}`,
    eventKey,
    orderId: order.id,
    orderNumber,
    event: "payment_verified",
  });

  const staffRecipients = await getStaffIds();
  await Promise.all([
    customerNotification,
    ...staffRecipients.map((userId) =>
      createNotification({
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

export async function notifyCustomerOrderStatusChanged(
  orderId: string,
  eventKey?: string,
) {
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

  const stableEventKey =
    eventKey ||
    `order:status:${order.id}:${status}:${order.updated_at || "unknown"}`;

  await createNotification({
    userId: order.user_id,
    type: "ORDER_STATUS",
    title: message.title,
    body: message.body,
    clickUrl: `/orders/${encodeURIComponent(order.id)}`,
    eventKey: stableEventKey,
    orderId: order.id,
    orderNumber,
    event: `order_status_${status.toLowerCase()}`,
  });
}
