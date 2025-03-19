// src/app/api/analyze-job/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

// Define interface for parsed job data
interface ParsedJobData {
  company: string;
  position: string;
  location: string;
  description: string;
  salary?: string;
  requirements?: string[];
  qualifications?: string[];
}

/**
 * API route that analyzes job posting content
 * Note: In a production environment, this would use OpenAI or another AI service
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client for auth check - make sure to await cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
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
    const { content, url } = await request.json() as { content: string; url: string };
    
    if (!content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }

    // In a real app, this would use OpenAI or another AI service
    // For now, we'll use a simple parsing function to extract what we can
    
    // Simple extraction logic (just for demo purposes)
    const extractedData = simpleJobParser(content, url);
    
    return NextResponse.json(extractedData);
  } catch (error) {
    console.error('Error in POST /api/analyze-job:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze job content';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * A simple job parser that looks for common patterns in job postings
 * This is a very basic implementation and would be replaced by AI in production
 */
function simpleJobParser(content: string, url: string): ParsedJobData {
  // Convert to plain text and lowercase for easier parsing
  const plainText = content.replace(/<[^>]*>?/gm, ' ').toLowerCase();
  
  // Extract company name - look for common patterns
  let company = extractByPattern(plainText, [
    /company:\s*([^,\n.]+)/i,
    /at\s+([^,\n.]+)\s+we/i,
    /about\s+([^,\n.]+):/i
  ]);
  
  // If company not found, try to extract from URL
  if (!company) {
    try {
      const urlObj = new URL(url);
      company = urlObj.hostname.replace('www.', '').split('.')[0];
      // Capitalize the first letter
      company = company.charAt(0).toUpperCase() + company.slice(1);
    } catch {
      company = 'Unknown Company';
    }
  }
  
  // Extract position/job title
  let position = extractByPattern(plainText, [
    /job title:\s*([^,\n.]+)/i,
    /position:\s*([^,\n.]+)/i,
    /hiring\s+a\s+([^,\n.]+)/i,
    /hiring\s+([^,\n.]+)/i
  ]);
  
  if (!position) {
    // Find the first line that might be a job title (typically at the beginning)
    const lines = plainText.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      position = lines[0].trim();
      if (position.length > 50) position = position.substring(0, 50); // Truncate if too long
    } else {
      position = 'Unknown Position';
    }
  }
  
  // Extract location
  const location = extractByPattern(plainText, [
    /location:\s*([^,\n.]+)/i,
    /based in\s+([^,\n.]+)/i,
    /located in\s+([^,\n.]+)/i,
    /position is\s+([^,\n.]+)\s+based/i
  ]) || 'Remote / Not Specified';
  
  // Extract salary if available
  const salary = extractByPattern(plainText, [
    /salary:\s*([^,\n.]+)/i,
    /compensation:\s*([^,\n.]+)/i,
    /pay:\s*([^,\n.]+)/i,
    /\$([0-9,]+\s*-\s*[0-9,]+)/i,
    /\$([0-9,]+\s*per\s*year)/i,
    /\$([0-9,]+k\s*-\s*[0-9,]+k)/i
  ]);
  
  // Extract a short description (first paragraph that looks like a description)
  let description = '';
  const paragraphs = plainText.split('\n\n');
  for (const para of paragraphs) {
    if (para.length > 50 && para.length < 500 && !para.includes('requirements') && !para.includes('qualifications')) {
      description = para.trim();
      break;
    }
  }
  if (!description && paragraphs.length > 0) {
    description = paragraphs[0].trim();
  }
  
  // Find requirements section - using [\s\S] instead of the 's' flag for compatibility
  const requirementsMatch = plainText.match(/requirements:?([\s\S]*?)(?:responsibilities|qualifications|about you|what you'll do|what you will do|about the role|expected|we offer)/i);
  const requirements = requirementsMatch ? 
    extractBulletPoints(requirementsMatch[1]) : 
    [];
  
  // Find qualifications section - using [\s\S] instead of the 's' flag for compatibility
  const qualificationsMatch = plainText.match(/qualifications:?([\s\S]*?)(?:requirements|responsibilities|about you|what you'll do|what you will do|about the role|expected|we offer)/i);
  const qualifications = qualificationsMatch ? 
    extractBulletPoints(qualificationsMatch[1]) : 
    [];
  
  return {
    company,
    position,
    location,
    description: description || 'No description available',
    salary: salary || undefined,
    requirements: requirements.length > 0 ? requirements : undefined,
    qualifications: qualifications.length > 0 ? qualifications : undefined
  };
}

/**
 * Helper function to extract text using an array of regex patterns
 */
function extractByPattern(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Helper function to extract bullet points from text
 */
function extractBulletPoints(text: string): string[] {
  if (!text) return [];
  
  // Split by common bullet point markers
  const lines = text.split(/[\n•\-\*]+/).map(line => line.trim()).filter(line => line.length > 0);
  
  // Keep only reasonably sized bullet points (not too short, not too long)
  return lines
    .filter(line => line.length > 10 && line.length < 200)
    .map(line => line.charAt(0).toUpperCase() + line.slice(1)) // Capitalize first letter
    .slice(0, 5); // Limit to 5 bullet points
}