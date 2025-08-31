"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
  Upload,
  File,
  Download,
  Shield,
  Folder,
  FolderPlus,
  BookOpen,
  Calendar,
  Search,
  Grid,
  List,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  X,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface FileRecord {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  folder?: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  fileCount: number;
}

export default function FileUpload() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showNewSubjectModal, setShowNewSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);

  // Load files and subjects
  const loadFiles = useCallback(async () => {
    try {
      const response = await fetch("/api/files");
      const data = await response.json();
      if (response.ok) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error("Error loading files:", error);
    }
  }, []);

  const loadSubjects = useCallback(async () => {
    try {
      const response = await fetch("/api/subjects");
      const data = await response.json();
      if (response.ok) {
        setSubjects(data.subjects);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  }, []);

  const updateSubjectFileCounts = useCallback(() => {
    setSubjects((prev) =>
      prev.map((subject) => ({
        ...subject,
        fileCount: files.filter((file) => file.folder === subject.code).length,
      }))
    );
  }, [files]);

  useEffect(() => {
    if (session) {
      loadFiles();
      loadSubjects();
    }
  }, [session, loadFiles, loadSubjects]);

  useEffect(() => {
    updateSubjectFileCounts();
  }, [updateSubjectFileCounts]);

  useEffect(() => {
    if (files.length > 0 && subjects.length > 0) {
      setLoading(false);
    }
  }, [files, subjects]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (!selectedSubject) {
      alert("Please select a subject first!");
      return;
    }

    setUploading(true);

    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", selectedSubject.code);

        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          await loadFiles();
        } else {
          const error = await response.json();
          alert(`Upload failed: ${error.error}`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Upload failed");
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed");
    }
  };

  const addNewSubject = async () => {
    if (!newSubjectName || !newSubjectCode) return;

    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newSubjectName,
          code: newSubjectCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects((prev) => [...prev, data.subject]);
        setNewSubjectName("");
        setNewSubjectCode("");
        setShowNewSubjectModal(false);
      } else {
        const error = await response.json();
        alert(`Failed to add subject: ${error.error}`);
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      alert("Failed to add subject");
    }
  };

  const deleteSubject = async (subjectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this subject? This action cannot be undone and will fail if there are files in this subject."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
        // If the deleted subject was selected, reset to null
        if (selectedSubject?.id === subjectId) {
          setSelectedSubject(null);
        }
      } else {
        const error = await response.json();
        alert(`Failed to delete subject: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Failed to delete subject");
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/"))
      return <ImageIcon className="w-5 h-5 text-green-600" />;
    if (fileType.startsWith("video/"))
      return <Video className="w-5 h-5 text-red-600" />;
    if (fileType.startsWith("audio/"))
      return <Music className="w-5 h-5 text-purple-600" />;
    if (fileType.includes("pdf"))
      return <FileText className="w-5 h-5 text-red-600" />;
    if (fileType.includes("zip") || fileType.includes("rar"))
      return <Archive className="w-5 h-5 text-yellow-600" />;
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredFiles = files.filter(
    (file) =>
      file.folder === selectedSubject?.code &&
      file.original_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">UniCloud</h2>
          <p className="text-gray-600">Loading your secure files...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">UniCloud</h1>
                <p className="text-blue-100 text-sm">
                  Secure University File Storage
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDeveloperModal(true)}
                className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium border border-white/30 flex items-center gap-2 text-white hover:scale-105 transform shadow-lg"
                title="Developer Info"
              >
                <Shield className="w-4 h-4" />
                Developer
              </button>
              <div className="hidden sm:block text-right">
                <p className="text-sm text-blue-100">Welcome back,</p>
                <p className="font-semibold">{session?.user?.name}</p>
              </div>
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white/30"
                />
              )}
              <button
                onClick={() => signOut()}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium border border-white/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedSubject ? (
          // Subjects Dashboard
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
              <div className="text-center max-w-3xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <BookOpen className="w-16 h-16 mx-auto mb-6 text-blue-600" />
                  <h2 className="text-4xl font-bold mb-4">Your Academic Hub</h2>
                </div>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  Organize your university files by subject with military-grade
                  encryption. Upload assignments, notes, and resources safely to
                  the cloud.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/80">
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900">Encrypted</h3>
                    <p className="text-sm text-gray-600">AES-256 encryption</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/80">
                    <Folder className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900">Organized</h3>
                    <p className="text-sm text-gray-600">
                      Subject-based folders
                    </p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/80">
                    <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900">Easy Upload</h3>
                    <p className="text-sm text-gray-600">Drag & drop files</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {subjects.length}
                    </p>
                    <p className="text-sm text-gray-500">Subjects</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-lg p-3">
                    <File className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {files.length}
                    </p>
                    <p className="text-sm text-gray-500">Files Stored</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">100%</p>
                    <p className="text-sm text-gray-500">Encrypted</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-orange-100 rounded-lg p-3">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatFileSize(
                        files.reduce((total, file) => total + file.file_size, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Your Subjects
                </h3>
                <p className="text-gray-600 mt-1">
                  Click on a subject to view and manage files
                </p>
              </div>
              <button
                onClick={() => setShowNewSubjectModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FolderPlus className="w-5 h-5" />
                Add Subject
              </button>
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group relative"
                >
                  <div className={`h-2 ${subject.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Folder
                        className={`w-12 h-12 ${subject.color.replace(
                          "bg-",
                          "text-"
                        )}`}
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">
                          {subject.code}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSubject(subject.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700"
                          title="Delete subject"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div
                      onClick={() => setSelectedSubject(subject)}
                      className="cursor-pointer"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {subject.name}
                      </h3>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{subject.fileCount} files</span>
                        <span>Click to open</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Subject Files View
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Subjects
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">
                  {selectedSubject.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                  className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg"
                >
                  {viewMode === "grid" ? (
                    <List className="w-4 h-4" />
                  ) : (
                    <Grid className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload Files"}
                </button>
              </div>
            </div>

            {/* Files Display */}
            {filteredFiles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Folder className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No files in {selectedSubject.name}
                </h3>
                <p className="text-gray-500 mb-6">
                  Upload your assignments, notes, and resources for this subject
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload First File
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-2"
                }
              >
                {filteredFiles.map((file) =>
                  viewMode === "grid" ? (
                    <div
                      key={file.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        {getFileIcon(file.file_type)}
                        <button
                          onClick={() =>
                            handleDownload(file.id, file.original_name)
                          }
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                        {file.original_name}
                      </h4>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>{formatFileSize(file.file_size)}</div>
                        <div>{formatDate(file.created_at)}</div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={file.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.file_type)}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {file.original_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.file_size)} •{" "}
                            {formatDate(file.created_at)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDownload(file.id, file.original_name)
                        }
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Developer Info Modal */}
      {showDeveloperModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Developer Info</h3>
              <button
                onClick={() => setShowDeveloperModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Diwan Malla</h4>
                <p className="text-gray-600 mb-4">Full-Stack Developer</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">About UniCloud</h5>
                <p className="text-sm text-gray-600 mb-3">
                  A secure, encrypted file storage platform built specifically for university students. 
                  Features AES-256 encryption, subject-based organization, and beautiful UI.
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white rounded p-3 border border-gray-200">
                    <div className="font-semibold text-gray-900">Framework:</div>
                    <div className="text-blue-600 font-medium">Next.js 15</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-gray-200">
                    <div className="font-semibold text-gray-900">Database:</div>
                    <div className="text-green-600 font-medium">Supabase</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-gray-200">
                    <div className="font-semibold text-gray-900">Auth:</div>
                    <div className="text-purple-600 font-medium">GitHub OAuth</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-gray-200">
                    <div className="font-semibold text-gray-900">Encryption:</div>
                    <div className="text-red-600 font-medium">AES-256</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href="https://diwanmalla.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V7l-10-5z"/>
                  </svg>
                  View Portfolio
                </a>
                <a
                  href="https://github.com/DiwanMalla"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  View GitHub Profile
                </a>
                <a
                  href="https://github.com/DiwanMalla/UniCloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  View Project Repository
                </a>
              </div>
              
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Built with ❤️ for university students worldwide
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  © 2025 UniCloud. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Subject Modal */}
      {showNewSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Subject
              </h3>
              <button
                onClick={() => setShowNewSubjectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g., Computer Science"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  placeholder="e.g., CS101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowNewSubjectModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewSubject}
                  disabled={!newSubjectName || !newSubjectCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Subject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
