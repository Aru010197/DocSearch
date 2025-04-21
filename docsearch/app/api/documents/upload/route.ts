import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { processDocument } from '@/lib/documents/processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['pdf', 'docx', 'pptx', 'xlsx'];
    
    if (!fileType || !allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Allowed types: PDF, DOCX, PPTX, XLSX' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const fileName = `${uniqueId}.${fileType}`;
    const filePath = `documents/${fileName}`;

    // Convert file to buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process document to extract text and metadata
    const { text, metadata } = await processDocument(buffer, fileType);

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: `Error uploading file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Store document metadata in database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        filename: file.name,
        file_type: fileType,
        file_size: file.size,
        storage_path: filePath,
        title: metadata.title || file.name.split('.')[0],
        author: metadata.author || null,
        created_at: metadata.creationDate || null,
        modified_at: null,
        uploaded_at: new Date().toISOString(),
        content_text: text,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error storing document metadata:', dbError);
      return NextResponse.json(
        { error: `Error storing document metadata: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      document 
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
