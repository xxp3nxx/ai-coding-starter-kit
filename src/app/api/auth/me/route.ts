import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    // Fetch profile with role info
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, full_name, avatar_url, created_at")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    // For trainers, also fetch their centre assignments
    let centreAssignments: { centre_id: string; assigned_at: string }[] = [];
    if (profile.role === "trainer") {
      const { data: assignments } = await supabase
        .from("trainer_centre_assignments")
        .select("centre_id, assigned_at")
        .eq("trainer_id", user.id);

      centreAssignments = assignments ?? [];
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: profile.role,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
        ...(profile.role === "trainer" && { centreAssignments }),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
