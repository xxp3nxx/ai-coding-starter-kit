import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createInvitationSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/invitations
 * Create a trainer invitation. Only centre_admin users can call this.
 * Returns an invite link that the admin can copy and share manually.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    // Verify role is centre_admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "centre_admin") {
      return NextResponse.json(
        { error: "Only centre admins can invite trainers." },
        { status: 403 }
      );
    }

    // Rate limit: 10 invitations per admin per minute
    const rateLimitResult = rateLimit(`invite:${user.id}`, {
      maxRequests: 10,
      windowMs: 60_000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many invitation requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate input
    const body = await request.json();
    const parsed = createInvitationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, centreId } = parsed.data;

    // Check if there's already a pending invitation for this email + centre
    const { data: existing } = await supabase
      .from("invitations")
      .select("id, status, expires_at")
      .eq("email", email)
      .eq("centre_id", centreId)
      .eq("status", "pending")
      .single();

    if (existing) {
      const isExpired = new Date(existing.expires_at) < new Date();
      if (!isExpired) {
        return NextResponse.json(
          {
            error:
              "A pending invitation already exists for this email and centre.",
          },
          { status: 409 }
        );
      }
      // Mark expired invitation
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", existing.id);
    }

    // Check if this email is already registered as a trainer at this centre
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("role", "trainer")
      .limit(1);

    if (existingUser && existingUser.length > 0) {
      // Check if any of these trainers are already assigned to this centre
      for (const trainer of existingUser) {
        const { data: assignment } = await supabase
          .from("trainer_centre_assignments")
          .select("id")
          .eq("trainer_id", trainer.id)
          .eq("centre_id", centreId)
          .single();

        if (assignment) {
          // We can't easily check email here without auth admin access,
          // so we'll let the accept flow handle duplicates
          break;
        }
      }
    }

    // Create the invitation
    const { data: invitation, error } = await supabase
      .from("invitations")
      .insert({
        email,
        centre_id: centreId,
        invited_by: user.id,
      })
      .select("id, token, expires_at")
      .single();

    if (error) {
      console.error("Failed to create invitation:", error.message);
      return NextResponse.json(
        { error: "Failed to create invitation." },
        { status: 500 }
      );
    }

    // Generate the invite link (no email sending -- admin copies this manually)
    const origin = new URL(request.url).origin;
    const inviteLink = `${origin}/invite/${invitation.token}`;

    return NextResponse.json(
      {
        message: "Invitation created successfully.",
        invitation: {
          id: invitation.id,
          email,
          inviteLink,
          expiresAt: invitation.expires_at,
        },
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
 * GET /api/invitations
 * List invitations created by the current centre_admin.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    // Verify role is centre_admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "centre_admin") {
      return NextResponse.json(
        { error: "Only centre admins can view invitations." },
        { status: 403 }
      );
    }

    const { data: invitations, error } = await supabase
      .from("invitations")
      .select("id, email, centre_id, status, expires_at, created_at")
      .eq("invited_by", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch invitations." },
        { status: 500 }
      );
    }

    return NextResponse.json({ invitations });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
