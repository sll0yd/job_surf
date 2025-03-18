import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

/**
 * GET /api/jobs - Get all jobs for current user
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'updated_at';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    
    // Start building the query
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('user_id', session.user.id);
    
    // Apply filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`company.ilike.${searchTerm},position.ilike.${searchTerm}`);
    }
    
    // Apply sorting
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
    
    // Set the user ID
    const newJob = {
      ...jobData,
      user_id: session.user.id,
    };
    
    // Insert the job
    const { data, error } = await supabase
      .from('jobs')
      .insert(newJob)
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
        description: `Created ${data.position} position at ${data.company}`
      });
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/jobs:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}