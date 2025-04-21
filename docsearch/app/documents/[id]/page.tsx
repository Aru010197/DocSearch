'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

type Document = {
  id: string
  filename: string
  file_type: string
  file_size: number
  storage_path: string
  title: string
  author?: string
  uploaded_at: string
  content_text?: string
}

export default function DocumentPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return
    
    const fetchDocument = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch document metadata
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) {
          throw new Error(`Error fetching document: ${error.message}`)
        }

        if (!data) {
          throw new Error('Document not found')
        }

        setDocument(data)

        // Get download URL
        const { data: urlData, error: urlError } = await supabase
          .storage
          .from('documents')
          .createSignedUrl(data.storage_path, 60) // URL valid for 60 seconds

        if (urlError) {
          console.error('Error getting download URL:', urlError)
        } else {
          setDownloadUrl(urlData.signedUrl)
        }
      } catch (error) {
        console.error('Error:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [params.id])

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return (
          <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'docx':
        return (
          <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'pptx':
        return (
          <svg className="h-12 w-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'xlsx':
        return (
          <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return (
          <svg className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Document Details</h1>
            <Link href="/search" className="text-primary-600 hover:text-primary-700">
              Back to Search
            </Link>
          </div>
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Document Details</h1>
            <Link href="/search" className="text-primary-600 hover:text-primary-700">
              Back to Search
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || 'Document not found'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Document Details</h1>
          <Link href="/search" className="text-primary-600 hover:text-primary-700">
            Back to Search
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-start">
              <div className="mr-6">
                {getFileIcon(document.file_type)}
              </div>
              <div className="flex-grow">
                <h2 className="text-xl font-bold text-gray-900">{document.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {document.filename} • {(document.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
                {document.author && (
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Author:</span> {document.author}
                  </p>
                )}
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Uploaded:</span> {formatDate(document.uploaded_at)}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex space-x-4">
                {downloadUrl && (
                  <a 
                    href={downloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-primary"
                  >
                    Download Document
                  </a>
                )}
                <button
                  onClick={() => router.push('/search')}
                  className="btn-secondary"
                >
                  Back to Search
                </button>
              </div>
            </div>

            {document.content_text && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Document Content</h3>
                <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-800 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {document.content_text}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
