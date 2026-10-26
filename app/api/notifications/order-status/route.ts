import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { notifyCustomerOrderStatusChanged } from "@/lib/notifications/order-events";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Unable to verify staff permissions." }, { status: 403 });
    }

    if (!["ADMIN", "OWNER", "STAFF"].includes(String(profile.role).toUpperCase())) {
      return NextResponse.json({ error: "Staff access required." }, { status: 403 });
    }

    let body: { orderId?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    if (typeof body.orderId !== "string" || !body.orderId.trim()) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    await notifyCustomerOrderStatusChanged(body.orderId.trim());
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order status notification failed:", error);
    // Status updates already saved in the database must not be rolled back by a notification outage.
    return NextResponse.json({ error: "Could not send the order status notification." }, { status: 500 });
  }
}
