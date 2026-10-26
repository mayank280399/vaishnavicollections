
import "server-only";

import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

type PushNotificationInput = {
  userId: string;
  type: string;
  title: string;
  body: string;
  clickUrl?: string;
  metadata?: Record<string, unknown>;
};

let vapidConfigured = false;

function configureVapid() {
  if (vapidConfigured) return;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:support@vaishnavicollections.com";

  if (!publicKey || !privateKey) {
    throw new Error("Web Push VAPID configuration is missing.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

function safeClickUrl(value?: string) {
  if (!value) return "/account";

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vaishnavicollections.vercel.app";
    const url = new URL(value, siteUrl);

    if (
      url.origin !== siteUrl &&
      url.origin !== "https://vaishnavicollections.vercel.app"
    ) {
      return "/account";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/account";
  }
}

export async function sendPushNotification(
  input: PushNotificationInput,
) {
  const admin = createAdminClient();

  const { data: notification, error: insertError } = await admin
    .from("notifications")
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      click_url: safeClickUrl(input.clickUrl),
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (insertError || !notification) {
    throw new Error(
      `Could not save notification: ${insertError?.message ?? "Unknown error"}`,
    );
  }

  const { data: subscriptions, error: subscriptionError } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", input.userId)
    .is("disabled_at", null);

  if (subscriptionError) {
    throw new Error(
      `Could not load subscriptions: ${subscriptionError.message}`,
    );
  }

  if (!subscriptions?.length) {
    return { notificationId: notification.id, sent: 0 };
  }

  configureVapid();

  let sent = 0;
  let lastError: string | null = null;

  const payload = JSON.stringify({
    title: input.title,
    body: input.body,
    url: safeClickUrl(input.clickUrl),
    tag: `vc-${notification.id}`,
  });

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        payload,
      );

      sent += 1;

      await admin
        .from("push_subscriptions")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", subscription.id);
    } catch (error) {
      const statusCode =
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error
          ? Number(error.statusCode)
          : 0;

      lastError =
        error instanceof Error ? error.message : "Push delivery failed";

      if (statusCode === 404 || statusCode === 410) {
        await admin
          .from("push_subscriptions")
          .update({ disabled_at: new Date().toISOString() })
          .eq("id", subscription.id);
      }
    }
  }

  await admin
    .from("notifications")
    .update({
      push_sent_at: sent > 0 ? new Date().toISOString() : null,
      push_error: sent > 0 ? null : lastError,
    })
    .eq("id", notification.id);

  return { notificationId: notification.id, sent };
}
