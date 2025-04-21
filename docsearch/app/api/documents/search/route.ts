import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const fileTypes = searchParams.get('types')?.split(',') || [];
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // Build the Supabase query
    let supabaseQuery = supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });

    // Apply search query if provided
    if (query) {
      supabaseQuery = supabaseQuery.textSearch('content_vector', query, {
        config: 'english',
        type: 'websearch',
      });
    }

    // Apply filters
    if (fileTypes.length > 0) {
      supabaseQuery = supabaseQuery.in('file_type', fileTypes);
    }

    if (dateFrom) {
      supabaseQuery = supabaseQuery.gte('uploaded_at', dateFrom);
    }

    if (dateTo) {
      supabaseQuery = supabaseQuery.lte('uploaded_at', dateTo);
    }

    // Apply pagination
    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

    // Execute the query
    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: `Error searching documents: ${error.message}` },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
    }

    // Process results to include highlights if search query was provided
    const results = data.map((doc: any) => {
      // If search query was provided, generate a highlight
      if (query && doc.content_text) {
        // Simple highlight generation - in a real app, you'd use a more sophisticated approach
        const contentLowerCase = doc.content_text.toLowerCase();
        const queryLowerCase = query.toLowerCase();
        const index = contentLowerCase.indexOf(queryLowerCase);
        
        if (index !== -1) {
          // Extract a snippet around the match
          const start = Math.max(0, index - 100);
          const end = Math.min(doc.content_text.length, index + query.length + 100);
          let highlight = doc.content_text.substring(start, end);
          
          // Add ellipsis if we're not at the beginning or end
          if (start > 0) highlight = '...' + highlight;
          if (end < doc.content_text.length) highlight += '...';
          
          // Highlight the matching text
          const highlightedText = highlight.replace(
            new RegExp(query, 'gi'),
            (match) => `<mark>${match}</mark>`
          );
          
          doc.highlight = highlightedText;
        }
      }
      
      return doc;
    });

    return NextResponse.json({
      results,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: totalCount ? Math.ceil(totalCount / limit) : 0,
      },
    });
  } catch (error) {
    console.error('Error processing search:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
