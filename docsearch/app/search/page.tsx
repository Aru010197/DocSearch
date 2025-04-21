'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

type Document = {
  id: string
  filename: string
  file_type: string
  file_size: number
  title: string
  uploaded_at: string
  content_text?: string
  highlight?: string
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    fileTypes: [] as string[],
    dateFrom: '',
    dateTo: '',
  })

  // Load initial documents on page load
  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async (query = '') => {
    setLoading(true)
    setError(null)

    try {
      let supabaseQuery = supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false })

      // Apply search query if provided
      if (query) {
        supabaseQuery = supabaseQuery.textSearch('content_vector', query)
      }

      // Apply filters
      if (filters.fileTypes.length > 0) {
        supabaseQuery = supabaseQuery.in('file_type', filters.fileTypes)
      }

      if (filters.dateFrom) {
        supabaseQuery = supabaseQuery.gte('uploaded_at', filters.dateFrom)
      }

      if (filters.dateTo) {
        supabaseQuery = supabaseQuery.lte('uploaded_at', filters.dateTo)
      }

      // Limit results
      supabaseQuery = supabaseQuery.limit(20)

      const { data, error } = await supabaseQuery

      if (error) {
        throw new Error(`Error fetching documents: ${error.message}`)
      }

      setDocuments(data || [])
    } catch (error) {
      console.error('Search error:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchDocuments(searchQuery)
  }

  const toggleFileTypeFilter = (fileType: string) => {
    setFilters(prev => {
      const fileTypes = prev.fileTypes.includes(fileType)
        ? prev.fileTypes.filter(type => type !== fileType)
        : [...prev.fileTypes, fileType]
      
      return { ...prev, fileTypes }
    })
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return (
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'docx':
        return (
          <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'pptx':
        return (
          <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'xlsx':
        return (
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return (
          <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Documents</h1>
        <Link href="/" className="text-primary-600 hover:text-primary-700">
          Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="font-medium text-lg mb-4">Filters</h2>
          
          <div className="mb-4">
            <h3 className="font-medium text-sm text-gray-700 mb-2">Document Type</h3>
            <div className="space-y-2">
              {['pdf', 'docx', 'pptx', 'xlsx'].map(type => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.fileTypes.includes(type)}
                    onChange={() => toggleFileTypeFilter(type)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-sm text-gray-700 mb-2">Upload Date</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="input-field w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="input-field w-full text-sm"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => fetchDocuments(searchQuery)}
            className="w-full btn-secondary text-sm"
          >
            Apply Filters
          </button>
        </div>

        {/* Search and results */}
        <div className="md:col-span-3">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field flex-grow"
              />
              <button type="submit" className="btn-primary ml-2">
                Search
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex">
                    <div className="mr-4 flex-shrink-0">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium text-gray-900">{doc.title}</h3>
                      <p className="text-sm text-gray-500">
                        {doc.filename} • {(doc.file_size / 1024 / 1024).toFixed(2)} MB • Uploaded {formatDate(doc.uploaded_at)}
                      </p>
                      {doc.highlight && (
                        <p className="mt-2 text-sm text-gray-700">
                          <span dangerouslySetInnerHTML={{ __html: doc.highlight }} />
                        </p>
                      )}
                      <div className="mt-2 flex space-x-2">
                        <Link href={`/documents/${doc.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          View
                        </Link>
                        <a href="#" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Try a different search term or upload new documents.' : 'Upload some documents to get started.'}
              </p>
              <div className="mt-6">
                <Link href="/upload" className="btn-primary">
                  Upload Documents
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
