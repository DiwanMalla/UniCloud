import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";
import { supabase } from "@/lib/supabase";
import { FileEncryption } from "@/lib/encryption";
import type { Session } from "next-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.id;

    // Get file metadata
    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", session.user.id)
      .single();

    if (dbError || !fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Download encrypted file from storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from("user-files")
      .download(fileRecord.storage_path);

    if (storageError || !fileData) {
      return NextResponse.json(
        { error: "File download failed" },
        { status: 500 }
      );
    }

    // Decrypt the file
    const encryptedArrayBuffer = await fileData.arrayBuffer();
    const decryptedFile = await FileEncryption.decryptFile(
      encryptedArrayBuffer,
      fileRecord.encryption_key,
      fileRecord.original_name,
      fileRecord.file_type
    );

    // Create response with decrypted file
    const response = new NextResponse(await decryptedFile.arrayBuffer());
    response.headers.set("Content-Type", fileRecord.file_type);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${fileRecord.original_name}"`
    );

    return response;
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
