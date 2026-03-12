import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback handler for Supabase email confirmation and password reset flows.
 * Supabase sends users here after clicking email links.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // For password reset flow, redirect to the reset-password page
      if (next === "/reset-password") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // For email confirmation, redirect to the appropriate dashboard
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role) {
          switch (profile.role) {
            case "athlete":
              return NextResponse.redirect(`${origin}/classes`);
            case "trainer":
              return NextResponse.redirect(`${origin}/trainer/dashboard`);
            case "centre_admin":
              return NextResponse.redirect(`${origin}/centre/dashboard`);
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth code exchange failed - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
