'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase/client'

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadError, setUploadError] = useState<string | null>(null)

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadError(null)

    try {
      for (const file of files) {
        // Create a unique file name
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `documents/${fileName}`

        // Upload file to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Error uploading file: ${uploadError.message}`)
        }

        // Here we would normally process the document to extract metadata and text
        // For now, we'll just store basic metadata
        const { error: metadataError } = await supabase
          .from('documents')
          .insert({
            filename: file.name,
            file_type: fileExt,
            file_size: file.size,
            storage_path: filePath,
            title: file.name.split('.')[0],
            uploaded_at: new Date().toISOString(),
          })

        if (metadataError) {
          throw new Error(`Error storing metadata: ${metadataError.message}`)
        }
      }

      // Clear files and redirect to search page
      setFiles([])
      router.push('/search')
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Back to Home
          </Link>
        </div>

        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg text-gray-600">
              {isDragActive ? 'Drop the files here' : 'Drag & drop files here, or click to select files'}
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, DOCX, PPTX, XLSX
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Selected Files</h2>
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between py-3 px-4">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(index)} 
                    className="text-red-500 hover:text-red-700"
                    disabled={uploading}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {uploadError}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
            className={`btn-primary ${
              files.length === 0 || uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>
    </div>
  )
}
