import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureCustomerWelcomeNotification } from "@/lib/notifications/customer-welcome";

function getSafeNext(value: string | null) {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const supabase = await createClient();
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("OAuth callback error:", exchangeError);
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile lookup error:", profileError);
    return NextResponse.redirect(`${origin}/login?error=profile`);
  }

  if (!profile) {
    console.error("Authenticated user has no application profile:", user.id);
    return NextResponse.redirect(`${origin}/login?error=profile`);
  }

  const role = String(profile.role ?? "").toUpperCase();

  if (role === "STAFF" || role === "ADMIN" || role === "OWNER") {
    return NextResponse.redirect(`${origin}/admin`);
  }

  try {
    const firstLogin = await ensureCustomerWelcomeNotification(user.id);
    if (firstLogin) {
      return NextResponse.redirect(`${origin}/account`);
    }
  } catch (welcomeError) {
    // Do not prevent a valid OAuth login if notification storage fails.
    console.error("OAuth welcome notification error:", welcomeError);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
