import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { Session } from "next-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const subjectId = id;

    // First, check if the subject belongs to the user
    const { data: subject, error: fetchError } = await supabaseAdmin
      .from("subjects")
      .select("code")
      .eq("id", subjectId)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check if there are any files in this subject folder
    const { data: files, error: filesError } = await supabaseAdmin
      .from("files")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("folder", subject.code)
      .limit(1);

    if (filesError) {
      console.error("Error checking files:", filesError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (files && files.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete subject that contains files. Please delete or move files first.",
        },
        { status: 400 }
      );
    }

    // Delete the subject
    const { error: deleteError } = await supabaseAdmin
      .from("subjects")
      .delete()
      .eq("id", subjectId)
      .eq("user_id", session.user.id);

    if (deleteError) {
      console.error("Database error:", deleteError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
