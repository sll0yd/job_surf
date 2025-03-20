import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

/**
 * GET /api/jobs - Get all jobs for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Build query
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('user_id', session.user.id);
    
    // Apply status filter if provided
    const status = request.nextUrl.searchParams.get('status');
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Apply search filter if provided
    const search = request.nextUrl.searchParams.get('search');
    if (search) {
      const searchTerms = search.toLowerCase();
      query = query.or(`company.ilike.%${searchTerms}%,position.ilike.%${searchTerms}%,location.ilike.%${searchTerms}%`);
    }
    
    // Apply sorting if provided
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'updated_at';
    const sortDirection = request.nextUrl.searchParams.get('sortDirection') || 'desc';
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { message: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs - Create a new job
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const jobData = await request.json();
    
    // Validate required fields
    if (!jobData.company || !jobData.position) {
      return NextResponse.json(
        { message: 'Company and position are required' },
        { status: 400 }
      );
    }
    
    // Add user_id to the job data
    jobData.user_id = session.user.id;
    
    // Insert the job
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating job:', error);
      return NextResponse.json(
        { message: 'Failed to create job' },
        { status: 500 }
      );
    }
    
    // Log activity
    await supabase
      .from('activities')
      .insert({
        user_id: session.user.id,
        job_id: data.id,
        activity_type: 'job_created',
        description: `Created ${data.position} at ${data.company}`
      });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/jobs:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}