'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Upload, File, Download, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FileRecord {
  id: string
  original_name: string
  file_size: number
  file_type: string
  created_at: string
}

export default function FileUpload() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileRecord[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load files on component mount
  useEffect(() => {
    if (session) {
      loadFiles()
    }
  }, [session])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files')
      const data = await response.json()
      if (response.ok) {
        setFiles(data.files)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)

    for (const file of selectedFiles) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          await loadFiles() // Reload the file list
        } else {
          const error = await response.json()
          alert(`Upload failed: ${error.error}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('Upload failed')
      }
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/download`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Download failed')
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Download failed')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SecureUni</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Secure File Storage
            </h1>
            <p className="text-sm text-gray-600">
              Your files are encrypted and stored securely in the cloud
            </p>
          </div>

          <div className="p-6">
            {/* Upload Section */}
            <div className="mb-8">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Upload files
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select files to upload securely to your cloud storage
                </p>
                <div className="mt-6">
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
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Choose Files'}
                  </button>
                </div>
              </div>
            </div>

            {/* Files List */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Your Files ({files.length})
              </h2>
              
              {files.length === 0 ? (
                <div className="text-center py-8">
                  <File className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No files uploaded yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start by uploading your first file
                  </p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {files.map((file) => (
                      <li key={file.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <File className="h-8 w-8 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {file.original_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.file_size)} • {formatDate(file.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDownload(file.id, file.original_name)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}