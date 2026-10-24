import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureCustomerWelcomeNotification } from "@/lib/notifications/customer-welcome";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 },
      );
    }

    const firstLogin = await ensureCustomerWelcomeNotification(user.id);

    return NextResponse.json(
      { ok: true, firstLogin },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Welcome notification POST error:", error);
    return NextResponse.json(
      { error: "Unable to create the welcome notification." },
      { status: 500 },
    );
  }
}
