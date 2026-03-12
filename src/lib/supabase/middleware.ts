import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session - IMPORTANT: do not remove this
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/invite",
    "/auth/callback",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // API routes are handled by their own auth checks
  const isApiRoute = pathname.startsWith("/api/");

  // Static assets and Next.js internals
  const isStaticRoute =
    pathname.startsWith("/_next/") || pathname.startsWith("/favicon");

  if (isStaticRoute || isApiRoute) {
    return supabaseResponse;
  }

  // Unauthenticated user trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated user trying to access public auth routes (redirect to their dashboard)
  if (user && isPublicRoute && pathname !== "/auth/callback") {
    // Look up user role from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role) {
      const url = request.nextUrl.clone();
      switch (profile.role) {
        case "athlete":
          url.pathname = "/classes";
          break;
        case "trainer":
          url.pathname = "/trainer/dashboard";
          break;
        case "centre_admin":
          url.pathname = "/centre/dashboard";
          break;
        default:
          url.pathname = "/";
      }
      return NextResponse.redirect(url);
    }
  }

  // Role-based route protection for authenticated users
  if (user && !isPublicRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role) {
      const role = profile.role;
      let allowed = true;

      if (pathname.startsWith("/trainer/") && role !== "trainer") {
        allowed = false;
      } else if (pathname.startsWith("/centre/") && role !== "centre_admin") {
        allowed = false;
      }

      if (!allowed) {
        const url = request.nextUrl.clone();
        switch (role) {
          case "athlete":
            url.pathname = "/classes";
            break;
          case "trainer":
            url.pathname = "/trainer/dashboard";
            break;
          case "centre_admin":
            url.pathname = "/centre/dashboard";
            break;
        }
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
