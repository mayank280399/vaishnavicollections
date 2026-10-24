
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function validSubscription(value: unknown): value is {
  endpoint: string;
  keys: { p256dh: string; auth: string };
} {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;
  const keys = item.keys as Record<string, unknown> | undefined;

  if (
    typeof item.endpoint !== "string" ||
    typeof keys?.p256dh !== "string" ||
    typeof keys?.auth !== "string"
  ) {
    return false;
  }

  try {
    const endpoint = new URL(item.endpoint);
    return (
      endpoint.protocol === "https:" &&
      item.endpoint.length <= 4096 &&
      keys.p256dh.length <= 512 &&
      keys.auth.length <= 512
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;

  if (!validSubscription(input.subscription)) {
    return NextResponse.json(
      { error: "Invalid browser subscription." },
      { status: 400 },
    );
  }

  const subscription = input.subscription;
  const admin = createAdminClient();

  const { data: existing, error: lookupError } = await admin
    .from("push_subscriptions")
    .select("id, user_id")
    .eq("endpoint", subscription.endpoint)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json(
      { error: "Could not verify the subscription." },
      { status: 500 },
    );
  }

  if (existing && existing.user_id !== user.id) {
    return NextResponse.json(
      { error: "This browser subscription belongs to another account." },
      { status: 409 },
    );
  }

  const { error } = await admin.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: request.headers.get("user-agent"),
      updated_at: new Date().toISOString(),
      disabled_at: null,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return NextResponse.json(
      { error: "Could not save the subscription." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let endpoint: unknown;

  try {
    endpoint = (await request.json()).endpoint;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof endpoint !== "string" || endpoint.length > 4096) {
    return NextResponse.json({ error: "Invalid endpoint." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json(
      { error: "Could not remove the subscription." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
