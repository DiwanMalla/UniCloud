import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { Session } from "next-auth";

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: subjects, error } = await supabaseAdmin
      .from("subjects")
      .select("id, name, code, color, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // If no subjects exist, create default ones
    if (!subjects || subjects.length === 0) {
      const defaultSubjects = [
        {
          name: "Data Structures & Algorithms",
          code: "CS301",
          color: "bg-blue-500",
        },
        { name: "Database Management", code: "CS302", color: "bg-green-500" },
        { name: "Web Development", code: "CS303", color: "bg-purple-500" },
        { name: "Software Engineering", code: "CS304", color: "bg-orange-500" },
        { name: "Computer Networks", code: "CS305", color: "bg-red-500" },
        { name: "Operating Systems", code: "CS306", color: "bg-indigo-500" },
      ];

      const { data: newSubjects, error: insertError } = await supabaseAdmin
        .from("subjects")
        .insert(
          defaultSubjects.map((subject) => ({
            ...subject,
            user_id: session.user.id,
          }))
        )
        .select();

      if (insertError) {
        console.error("Error creating default subjects:", insertError);
        return NextResponse.json({ subjects: [] });
      }

      return NextResponse.json({ subjects: newSubjects });
    }

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, code, color } = await request.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    const { data: subject, error } = await supabaseAdmin
      .from("subjects")
      .insert({
        user_id: session.user.id,
        name,
        code,
        color: color || "bg-blue-500",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "Subject code already exists" },
          { status: 400 }
        );
      }
      console.error("Database error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ subject });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
