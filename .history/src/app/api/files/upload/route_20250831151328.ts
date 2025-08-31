import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { FileEncryption } from "@/lib/encryption";
import type { Session } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Encrypt the file
    const { encryptedData, encryptionKey, originalName } =
      await FileEncryption.encryptFile(file);
    const encryptedFileName =
      FileEncryption.generateRandomFileName(originalName);

    // Upload to Supabase Storage using admin client
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("user-files")
      .upload(`${session.user.id}/${encryptedFileName}`, encryptedData);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // Save file metadata to database using admin client
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("files")
      .insert({
        user_id: session.user.id,
        original_name: originalName,
        encrypted_name: encryptedFileName,
        file_size: file.size,
        file_type: file.type,
        encryption_key: encryptionKey,
        storage_path: uploadData.path,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Clean up uploaded file if database insert fails
      await supabaseAdmin.storage.from("user-files").remove([uploadData.path]);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({
      message: "File uploaded successfully",
      fileId: dbData.id,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
