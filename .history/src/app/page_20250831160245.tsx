"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, Cloud, Lock, FileText, X } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/file-upload");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Cloud className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">UniCloud</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDeveloperModal(true)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Developer Info"
              >
                <p>Developer</p>
                <Shield className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/auth/signin")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-6xl">
            Secure University
            <span className="text-blue-600"> File Storage</span>
          </h2>
          <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
            Store your university assignments, research papers, and documents
            securely in the cloud. Your files are encrypted end-to-end and
            accessible from anywhere.
          </p>
          <div className="mt-10">
            <button
              onClick={() => router.push("/auth/signin")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium"
            >
              Get Started Free
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center">
                <Lock className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                End-to-End Encryption
              </h3>
              <p className="mt-2 text-gray-500">
                Your files are encrypted before upload and decrypted only when
                you download them. Even we can&apos;t see your content.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <Cloud className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Cloud Storage
              </h3>
              <p className="mt-2 text-gray-500">
                Access your files from any device, anywhere. No more running out
                of laptop storage for your university work.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                All File Types
              </h3>
              <p className="mt-2 text-gray-500">
                Upload any file type - documents, presentations, images, videos,
                and more. Perfect for all your university needs.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-20 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Built with 100% Free Technologies
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Frontend & Backend
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Next.js 15 (Full-stack framework)</li>
                <li>• NextAuth.js (Authentication)</li>
                <li>• TypeScript (Type safety)</li>
                <li>• Tailwind CSS (Styling)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Storage & Hosting
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Supabase (Database & File Storage)</li>
                <li>• GitHub OAuth (Free authentication)</li>
                <li>• Vercel (Free hosting)</li>
                <li>• Client-side encryption</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 UniCloud. Built for students, by students.</p>
          </div>
        </div>
      </footer>

      {/* Developer Info Modal */}
      {showDeveloperModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Developer Info
              </h3>
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
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Diwan Malla
                </h4>
                <p className="text-gray-600 mb-4">Full-Stack Developer</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">
                  About UniCloud
                </h5>
                <p className="text-sm text-gray-600 mb-3">
                  A secure, encrypted file storage platform built specifically
                  for university students. Features AES-256 encryption,
                  subject-based organization, and beautiful UI.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded p-2">
                    <strong>Framework:</strong> Next.js 15
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Database:</strong> Supabase
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Auth:</strong> GitHub OAuth
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Encryption:</strong> AES-256
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href="https://github.com/DiwanMalla"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  View GitHub Profile
                </a>
                <a
                  href="https://github.com/DiwanMalla/UniCloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
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
    </div>
  );
}
