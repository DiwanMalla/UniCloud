'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Shield, Cloud, Lock, FileText } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/file-upload')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SecureUni</h1>
            </div>
            <button
              onClick={() => router.push('/auth/signin')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign In
            </button>
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
            Store your university assignments, research papers, and documents securely in the cloud. 
            Your files are encrypted end-to-end and accessible from anywhere.
          </p>
          <div className="mt-10">
            <button
              onClick={() => router.push('/auth/signin')}
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
                Your files are encrypted before upload and decrypted only when you download them. 
                Even we can&apos;t see your content.
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
                Access your files from any device, anywhere. No more running out of laptop storage 
                for your university work.
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
              <h4 className="font-semibold text-gray-900 mb-3">Frontend & Backend</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Next.js 15 (Full-stack framework)</li>
                <li>• NextAuth.js (Authentication)</li>
                <li>• TypeScript (Type safety)</li>
                <li>• Tailwind CSS (Styling)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Storage & Hosting</h4>
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
            <p>&copy; 2025 SecureUni. Built for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
