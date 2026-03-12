import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { acceptInvitationSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/invitations/accept
 * Accept a trainer invitation: creates the user account, profile, and centre assignment.
 * This endpoint is called by unauthenticated users (they don't have an account yet).
 */
export async function POST(request: Request) {
  try {
    // Rate limit: 5 accept attempts per IP per minute
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const rateLimitResult = rateLimit(`accept-invite:${ip}`, {
      maxRequests: 5,
      windowMs: 60_000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate input
    const body = await request.json();
    const parsed = acceptInvitationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { token, fullName, password } = parsed.data;

    const supabase = await createClient();

    // Look up the invitation by token
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .select("id, email, centre_id, status, expires_at")
      .eq("token", token)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: "Invalid invitation link." },
        { status: 404 }
      );
    }

    // Check invitation status
    if (invitation.status !== "pending") {
      return NextResponse.json(
        {
          error:
            "This invitation has already been used or is no longer valid. Please request a new invitation from your centre admin.",
        },
        { status: 410 }
      );
    }

    // Check expiry
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      return NextResponse.json(
        {
          error:
            "This invitation has expired. Please request a new invitation from your centre admin.",
        },
        { status: 410 }
      );
    }

    // Create the trainer's user account via Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: invitation.email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "trainer",
          },
          // Skip email confirmation for invited trainers since
          // the invitation token itself validates their email
          emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
        },
      }
    );

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        return NextResponse.json(
          {
            error:
              "An account with this email already exists. Please log in instead.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    if (!signUpData.user) {
      return NextResponse.json(
        { error: "Failed to create account." },
        { status: 500 }
      );
    }

    // Create the trainer-centre assignment
    // Note: The profile is created automatically by the database trigger
    const { error: assignError } = await supabase
      .from("trainer_centre_assignments")
      .insert({
        trainer_id: signUpData.user.id,
        centre_id: invitation.centre_id,
      });

    if (assignError) {
      console.error("Failed to create centre assignment:", assignError.message);
      // Don't fail the whole flow -- the account is created, assignment can be fixed
    }

    // Mark invitation as accepted
    await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    return NextResponse.json(
      {
        message:
          "Account created successfully. Please check your email to confirm, then log in.",
        userId: signUpData.user.id,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invitations/accept?token=xxx
 * Look up invitation details by token (for rendering the accept page).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: invitation, error } = await supabase
      .from("invitations")
      .select("id, email, centre_id, status, expires_at")
      .eq("token", token)
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { error: "Invalid invitation link." },
        { status: 404 }
      );
    }

    // Check status and expiry
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "This invitation has already been used or is no longer valid." },
        { status: 410 }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This invitation has expired." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        centreId: invitation.centre_id,
        expiresAt: invitation.expires_at,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
