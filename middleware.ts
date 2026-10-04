import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  /*
   * Refresh/validate the Supabase session.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  /*
   * Only protect the /admin area.
   */
  if (pathname.startsWith("/admin")) {
    /*
     * Not logged in → login page.
     */
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";

      return NextResponse.redirect(loginUrl);
    }

    /*
     * Read the application role from profiles.
     */
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Admin role lookup error:", error);

      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";

      return NextResponse.redirect(homeUrl);
    }

    const role = profile?.role?.toUpperCase();

    /*
     * Only these roles can access /admin.
     */
    const isAdminUser =
      role === "STAFF" ||
      role === "ADMIN" ||
      role === "OWNER";

    /*
     * CUSTOMER or any unknown/missing role → homepage.
     */
    if (!isAdminUser) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";

      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};