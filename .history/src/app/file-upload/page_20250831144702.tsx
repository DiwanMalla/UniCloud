"use client";
import { useState } from "react";
import { getSession } from "next-auth/react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      // Get session to access Google token
      const session = await getSession();
      const accessToken = session?.accessToken;
      if (!accessToken) {
        setMessage("No Google access token found. Please sign in again.");
        setUploading(false);
        return;
      }
      // Prepare file for upload
      const metadata = {
        name: file.name,
        mimeType: file.type,
      };
      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", file);
      // Upload to Google Drive
      const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });
      if (res.ok) {
        setMessage("File uploaded successfully!");
      } else {
        setMessage("Upload failed. Please try again.");
      }
    } catch (err) {
      setMessage("Error uploading file.");
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">Upload a file to Google Drive</h1>
      <input type="file" onChange={handleFileChange} className="mb-4" />
      <button
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={handleUpload}
        disabled={uploading || !file}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="mt-4 text-red-600">{message}</p>}
    </div>
  );
}
