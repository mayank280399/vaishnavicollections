import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(value: string | null) {
  if (!value) {
    return "/";
  }

  /*
   * Only allow internal paths.
   *
   * Prevent:
   * https://external-site.com
   * //external-site.com
   */
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = getSafeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=oauth`,
    );
  }

  const supabase = await createClient();

  /*
   * Exchange the Google OAuth code for a Supabase session.
   */
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error(
      "OAuth callback error:",
      exchangeError,
    );

    return NextResponse.redirect(
      `${origin}/login?error=oauth`,
    );
  }

  /*
   * Get the authenticated user.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?error=oauth`,
    );
  }

  /*
   * The database trigger creates the profile automatically
   * when a new auth.users record is created.
   *
   * New users are always CUSTOMER.
   *
   * Therefore, the OAuth callback should NOT create or
   * update profiles.
   */
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    console.error(
      "Profile lookup error:",
      profileError,
    );

    return NextResponse.redirect(
      `${origin}/login?error=profile`,
    );
  }

  /*
   * If the profile is missing, something went wrong with
   * the database trigger/profile creation.
   */
  if (!profile) {
    console.error(
      "Authenticated user has no application profile:",
      user.id,
    );

    return NextResponse.redirect(
      `${origin}/login?error=profile`,
    );
  }

  /*
   * Redirect staff/admin/owner users to the admin panel.
   */
  const role = profile.role?.toUpperCase();

  if (
    role === "STAFF" ||
    role === "ADMIN" ||
    role === "OWNER"
  ) {
    return NextResponse.redirect(
      `${origin}/admin`,
    );
  }

  /*
   * Customers go to the requested internal destination.
   *
   * Example:
   * /auth/callback?next=/account
   *
   * → /account
   */
  return NextResponse.redirect(
    `${origin}${next}`,
  );
}