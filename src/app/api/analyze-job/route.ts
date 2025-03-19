// src/app/api/analyze-job/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { ParsedJobData } from '@/lib/openai-service';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * API route that analyzes job posting content using AI
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
    const { content, url } = await request.json() as { content: string; url: string };
    
    if (!content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Define the system prompt
    const systemPrompt = `
    You are an expert job posting analyzer. Extract structured information from job postings.
    Your task is to analyze the HTML content of a job posting and extract the following information:
    
    1. Company name
    2. Job position/title
    3. Location (including remote if specified)
    4. Salary information (if available)
    5. Job description (summarized in 3-4 sentences)
    6. Key requirements (as bullet points)
    7. Qualifications (as bullet points)
    
    Return the information in JSON format with the following keys:
    {
      "company": string,
      "position": string,
      "location": string,
      "salary": string or null if not found,
      "description": string,
      "requirements": array of strings,
      "qualifications": array of strings
    }
    
    If you cannot determine a particular field, use null for that field.
    Do not include any explanations or additional information outside the JSON object.
    `;
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or gpt-4 for better accuracy
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Job URL: ${url}\n\nHTML Content: ${content.substring(0, 15000)}` }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const responseText = completion.choices[0].message.content;
    let parsedData: ParsedJobData;
    
    try {
      parsedData = JSON.parse(responseText || '{}') as ParsedJobData;
    } catch (err) {
      console.error('Error parsing OpenAI response:', err);
      return NextResponse.json(
        { message: 'Failed to parse job information' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error in POST /api/analyze-job:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze job content';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}