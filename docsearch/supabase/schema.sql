-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  title TEXT,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  modified_at TIMESTAMP WITH TIME ZONE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID,
  content_text TEXT,
  content_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce(title, '') || ' ' || 
      coalesce(author, '') || ' ' || 
      coalesce(content_text, '')
    )
  ) STORED
);

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS documents_content_vector_idx ON documents USING GIN (content_vector);

-- Create index for file type filtering
CREATE INDEX IF NOT EXISTS documents_file_type_idx ON documents (file_type);

-- Create index for date filtering
CREATE INDEX IF NOT EXISTS documents_uploaded_at_idx ON documents (uploaded_at);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_tags junction table
CREATE TABLE IF NOT EXISTS document_tags (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag_id)
);

-- Create users table (if not already created by Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sign_in TIMESTAMP WITH TIME ZONE
);

-- Create document_permissions table for access control
CREATE TABLE IF NOT EXISTS document_permissions (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('read', 'write', 'admin')),
  PRIMARY KEY (document_id, user_id)
);

-- Create storage bucket for documents if it doesn't exist
-- Note: This needs to be done via the Supabase dashboard or API,
-- as SQL doesn't have direct access to storage buckets

-- Create Row Level Security (RLS) policies
-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy for selecting documents (read access)
CREATE POLICY "Users can view their own documents" 
  ON documents FOR SELECT 
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM document_permissions 
      WHERE document_id = documents.id AND user_id = auth.uid()
    )
  );

-- Policy for inserting documents
CREATE POLICY "Users can insert their own documents" 
  ON documents FOR INSERT 
  WITH CHECK (uploaded_by = auth.uid());

-- Policy for updating documents
CREATE POLICY "Users can update their own documents" 
  ON documents FOR UPDATE 
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM document_permissions 
      WHERE document_id = documents.id AND user_id = auth.uid() AND permission_level IN ('write', 'admin')
    )
  );

-- Policy for deleting documents
CREATE POLICY "Users can delete their own documents" 
  ON documents FOR DELETE 
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM document_permissions 
      WHERE document_id = documents.id AND user_id = auth.uid() AND permission_level = 'admin'
    )
  );

-- Enable RLS on document_permissions table
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;

-- Policy for managing document permissions
CREATE POLICY "Document owners can manage permissions" 
  ON document_permissions 
  USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE id = document_permissions.document_id AND uploaded_by = auth.uid()
    )
  );
