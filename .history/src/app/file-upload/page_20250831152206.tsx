"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
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
  X
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
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "1", name: "Data Structures & Algorithms", code: "CS301", color: "bg-blue-500", fileCount: 0 },
    { id: "2", name: "Database Management", code: "CS302", color: "bg-green-500", fileCount: 0 },
    { id: "3", name: "Web Development", code: "CS303", color: "bg-purple-500", fileCount: 0 },
    { id: "4", name: "Software Engineering", code: "CS304", color: "bg-orange-500", fileCount: 0 },
    { id: "5", name: "Computer Networks", code: "CS305", color: "bg-red-500", fileCount: 0 },
    { id: "6", name: "Operating Systems", code: "CS306", color: "bg-indigo-500", fileCount: 0 },
  ]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showNewSubjectModal, setShowNewSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");

  // Load files on component mount
  const loadFiles = useCallback(async () => {
    try {
      const response = await fetch("/api/files");
      const data = await response.json();
      if (response.ok) {
        setFiles(data.files);
        // Update file counts for subjects
        const updatedSubjects = subjects.map(subject => ({
          ...subject,
          fileCount: data.files.filter((file: FileRecord) => file.folder === subject.code).length
        }));
        setSubjects(updatedSubjects);
      }
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  }, [subjects]);

  useEffect(() => {
    if (session) {
      loadFiles();
    }
  }, [session, loadFiles]);

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

  const addNewSubject = () => {
    if (!newSubjectName || !newSubjectCode) return;
    
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-red-500", "bg-indigo-500", "bg-pink-500", "bg-yellow-500"];
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: newSubjectName,
      code: newSubjectCode,
      color: colors[Math.floor(Math.random() * colors.length)],
      fileCount: 0
    };
    
    setSubjects([...subjects, newSubject]);
    setNewSubjectName("");
    setNewSubjectCode("");
    setShowNewSubjectModal(false);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-green-600" />;
    if (fileType.startsWith("video/")) return <Video className="w-5 h-5 text-red-600" />;
    if (fileType.startsWith("audio/")) return <Music className="w-5 h-5 text-purple-600" />;
    if (fileType.includes("pdf")) return <FileText className="w-5 h-5 text-red-600" />;
    if (fileType.includes("zip") || fileType.includes("rar")) return <Archive className="w-5 h-5 text-yellow-600" />;
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
    return new Date(dateString).toLocaleDateString();
  };

  const filteredFiles = selectedSubject 
    ? files.filter(file => 
        file.folder === selectedSubject.code && 
        file.original_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : files.filter(file => 
        file.original_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SecureUni</h1>
                <p className="text-sm text-gray-500">Secure University File Storage</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-semibold">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-gray-700 mr-3">
                  {session?.user?.name || session?.user?.email}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedSubject ? (
          // Subjects Dashboard
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">My Subjects</h2>
                <p className="text-gray-600 mt-1">Organize your assignments by subject</p>
              </div>
              <button
                onClick={() => setShowNewSubjectModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                Add Subject
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">{subjects.length}</h3>
                    <p className="text-gray-600">Total Subjects</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <File className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">{files.length}</h3>
                    <p className="text-gray-600">Total Files</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {files.length > 0 ? formatDate(files[0].created_at) : "No files"}
                    </h3>
                    <p className="text-gray-600">Last Upload</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 overflow-hidden group"
                >
                  <div className={`h-2 ${subject.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Folder className={`w-12 h-12 ${subject.color.replace('bg-', 'text-')}`} />
                      <span className="text-sm font-medium text-gray-500">{subject.code}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {subject.name}
                    </h3>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{subject.fileCount} files</span>
                      <span>Click to open</span>
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
                  My Subjects
                </button>
                <span className="text-gray-400">/</span>
                <div className="flex items-center">
                  <div className={`w-4 h-4 ${selectedSubject.color} rounded mr-2`}></div>
                  <span className="text-gray-900 font-medium">{selectedSubject.name}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Upload */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
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
              <div className={viewMode === "grid" ? 
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : 
                "space-y-2"
              }>
                {filteredFiles.map((file) => (
                  viewMode === "grid" ? (
                    <div
                      key={file.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        {getFileIcon(file.file_type)}
                        <button
                          onClick={() => handleDownload(file.id, file.original_name)}
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
                          <h4 className="font-medium text-gray-900">{file.original_name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.file_size)} • {formatDate(file.created_at)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(file.id, file.original_name)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Subject Modal */}
      {showNewSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Subject</h3>
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
                  placeholder="e.g., Machine Learning"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
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
                  placeholder="e.g., CS401"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowNewSubjectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewSubject}
                  disabled={!newSubjectName || !newSubjectCode}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
