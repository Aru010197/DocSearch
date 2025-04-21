import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Fetch document metadata
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      return NextResponse.json(
        { error: `Error fetching document: ${error.message}` },
        { status: 500 }
      );
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Generate a signed URL for downloading the document
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('documents')
      .createSignedUrl(document.storage_path, 60); // URL valid for 60 seconds

    if (urlError) {
      console.error('Error generating download URL:', urlError);
      return NextResponse.json(
        { error: `Error generating download URL: ${urlError.message}` },
        { status: 500 }
      );
    }

    // Return document with download URL
    return NextResponse.json({
      document,
      downloadUrl: urlData.signedUrl,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get document storage path before deleting
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching document:', fetchError);
      return NextResponse.json(
        { error: `Error fetching document: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete document from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting document from database:', deleteError);
      return NextResponse.json(
        { error: `Error deleting document: ${deleteError.message}` },
        { status: 500 }
      );
    }

    // Delete file from storage
    const { error: storageError } = await supabase
      .storage
      .from('documents')
      .remove([document.storage_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // We don't return an error here since the database record is already deleted
      // In a production app, you might want to log this for cleanup later
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
