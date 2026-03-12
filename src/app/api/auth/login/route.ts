import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limit: 5 login attempts per IP per minute
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const rateLimitResult = rateLimit(`login:${ip}`, {
      maxRequests: 5,
      windowMs: 60_000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          retryAfter: Math.ceil(
            (rateLimitResult.resetAt - Date.now()) / 1000
          ),
        },
        { status: 429 }
      );
    }

    // Parse and validate input
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Get user profile to determine redirect
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", data.user.id)
      .single();

    let redirectTo = "/";
    if (profile?.role) {
      switch (profile.role) {
        case "athlete":
          redirectTo = "/classes";
          break;
        case "trainer":
          redirectTo = "/trainer/dashboard";
          break;
        case "centre_admin":
          redirectTo = "/centre/dashboard";
          break;
      }
    }

    return NextResponse.json({
      message: "Login successful.",
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role,
        fullName: profile?.full_name,
      },
      redirectTo,
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
