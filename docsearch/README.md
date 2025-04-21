# DocSearch - Document Search Application

A modern document search application built with Next.js, Supabase, and Vercel. Upload, search, and manage your documents with ease.

## Features

- Upload multiple document formats (PDF, DOCX, PPTX, XLSX)
- Full-text search within document content
- Search by metadata (title, author, date)
- Filter by document type and date
- Document preview and download
- Responsive design with light green and white theme

## Tech Stack

- **Frontend**: Next.js 14+, React 18+, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (optional for deployment)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/docsearch.git
cd docsearch
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [https://app.supabase.io/](https://app.supabase.io/)
2. Go to Project Settings > API to get your Supabase URL and anon key
3. Create a new storage bucket named `documents` with the following settings:
   - Public access: OFF
   - File size limit: 50MB (or your preferred limit)
4. Run the database setup script:
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/schema.sql` and run it

### 4. Configure environment variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

### Deploy to Vercel

The easiest way to deploy the application is using Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure the environment variables
4. Deploy

### Manual Deployment

To build the application for production:

```bash
npm run build
npm start
```

## Project Structure

```
/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   ├── api/                  # API routes
│   │   └── documents/        # Document API endpoints
│   ├── documents/            # Document viewer
│   ├── search/               # Search interface
│   └── upload/               # Upload interface
├── components/               # React components
├── lib/                      # Utility functions
│   ├── supabase/             # Supabase client
│   └── documents/            # Document processing
├── public/                   # Static assets
└── supabase/                 # Supabase configuration
    └── schema.sql            # Database schema
```

## Document Processing

The application processes documents to extract text and metadata:

- **PDF**: Extracts text, title, author, creation date, and page count
- **DOCX**: Extracts text content
- **XLSX**: Extracts text from cells across all sheets
- **PPTX**: Basic text extraction (placeholder implementation)

## Search Implementation

The search functionality uses PostgreSQL's full-text search capabilities:

- Text search using `tsvector` and `tsquery`
- Filtering by document type and date range
- Result highlighting
- Pagination

## Authentication (Future Enhancement)

The database schema includes tables and policies for user authentication and document permissions. To implement authentication:

1. Enable Supabase Auth in your project
2. Update the frontend to include sign-in/sign-up functionality
3. Modify API routes to use the authenticated user ID




