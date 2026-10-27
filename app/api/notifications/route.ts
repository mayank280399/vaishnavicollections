
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * GET /api/notifications
 * Returns the signed-in user's latest notifications and unread count.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonError("Please sign in to view notifications.", 401);
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, click_url, metadata, created_at, read_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Notifications GET error:", error.message);
      return jsonError("Unable to load notifications.", 500);
    }

    const { count: unreadCount, error: countError } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (countError) {
      console.error("Notifications unread count error:", countError.message);
      return jsonError("Unable to load notification count.", 500);
    }

    return NextResponse.json(
      { notifications: data ?? [], unreadCount: unreadCount ?? 0 },
      {
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch (error) {
    console.error("Notifications GET exception:", error);
    return jsonError("Unable to load notifications.", 500);
  }
}

/**
 * PATCH /api/notifications
 * Marks one of the signed-in user's notifications as read.
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonError("Please sign in to update notifications.", 401);
    }

    let body: { id?: unknown };

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    if (typeof body.id !== "string" || !body.id.trim()) {
      return jsonError("A notification ID is required.", 400);
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", body.id)
      .eq("user_id", user.id)
      .select("id, read_at")
      .maybeSingle();

    if (error) {
      console.error("Notifications PATCH error:", error.message);
      return jsonError("Unable to update notification.", 500);
    }

    if (!data) {
      return jsonError("Notification not found.", 404);
    }

    return NextResponse.json({ notification: data });
  } catch (error) {
    console.error("Notifications PATCH exception:", error);
    return jsonError("Unable to update notification.", 500);
  }
}
