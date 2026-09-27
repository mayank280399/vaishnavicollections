import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

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

  /*
   * Find the application profile.
   */
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, display_name, role")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    console.error("Profile lookup error:", profileError);
  }

  /*
   * A first-time Google user should become a CUSTOMER.
   */
  if (!profile) {
    const displayName =
      user.user_metadata?.display_name ??
      user.user_metadata?.full_name ??
      user.email?.split("@")[0] ??
      "Customer";

    const { error: createProfileError } =
      await supabase.from("profiles").insert({
        id: user.id,
        display_name: displayName,
        role: "CUSTOMER",
      });

    if (createProfileError) {
      console.error(
        "Google customer profile creation error:",
        createProfileError
      );

      return NextResponse.redirect(
        `${origin}/login?error=profile`
      );
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  const role = profile.role?.toUpperCase();

  if (
    role === "STAFF" ||
    role === "ADMIN" ||
    role === "OWNER"
  ) {
    return NextResponse.redirect(`${origin}/admin`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}