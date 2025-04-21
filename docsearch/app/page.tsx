import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-primary-50">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            <span className="block">Document Search</span>
            <span className="block text-primary-600">Find what you need, instantly</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Upload, search, and manage your documents with ease. Supports PDF, DOCX, PPTX, and XLSX formats.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link href="/upload" className="btn-primary text-center">
            Upload Documents
          </Link>
          <Link href="/search" className="btn-secondary text-center">
            Search Documents
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-md overflow-hidden md:max-w-4xl mx-auto">
          <div className="md:flex">
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-primary-600 font-semibold">Features</div>
              <div className="mt-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Upload multiple document formats (PDF, DOCX, PPTX, XLSX)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Full-text search within document content</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Search by metadata (title, author, date)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Secure document storage and management</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
