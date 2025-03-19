import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Scrapes the content from a given URL
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client for auth check
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { url } = await request.json();
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { message: 'URL is required' },
        { status: 400 }
      );
    }
    
    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        // Set user agent to avoid being blocked by some sites
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: `Failed to fetch URL: ${response.statusText}` },
        { status: 400 }
      );
    }
    
    // Get the text content of the page
    const content = await response.text();
    
    // Remove any script tags to clean the HTML
    const cleanContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    return NextResponse.json({ content: cleanContent });
  } catch (error) {
    console.error('Error in POST /api/scrape-url:', error);
    return NextResponse.json(
      { message: 'Failed to scrape URL. Please try again.' },
      { status: 500 }
    );
  }
}