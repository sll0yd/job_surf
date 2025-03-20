import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

// Helper to check if user has access to job
async function checkJobAccess(
  supabase: ReturnType<typeof createRouteHandlerClient<Database>>, 
  jobId: string, 
  userId: string
) {
  const { data, error } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', jobId)
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    return false;
  }
  
  return true;
}

/**
 * GET /api/jobs/[id] - Get a specific job by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
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
    
    // Check if job exists and belongs to user
    const hasAccess = await checkJobAccess(supabase, jobId, session.user.id);
    
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Get the job
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (error) {
      console.error('Error fetching job:', error);
      return NextResponse.json(
        { message: 'Failed to fetch job' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in GET /api/jobs/[id]:`, error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/jobs/[id] - Update a job
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
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
    
    // Check if job exists and belongs to user
    const hasAccess = await checkJobAccess(supabase, jobId, session.user.id);
    
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const updates = await request.json();
    
    // Don't allow updating user_id
    delete updates.user_id;
    delete updates.id;
    
    // Update the job
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating job:', error);
      return NextResponse.json(
        { message: 'Failed to update job' },
        { status: 500 }
      );
    }
    
    // Log activity
    await supabase
      .from('activities')
      .insert({
        user_id: session.user.id,
        job_id: jobId,
        activity_type: 'job_updated',
        description: `Updated ${data.position} at ${data.company}`
      });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in PUT /api/jobs/[id]:`, error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/jobs/[id] - Delete a job
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
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
    
    // Check if job exists and belongs to user
    const hasAccess = await checkJobAccess(supabase, jobId, session.user.id);
    
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Delete the job
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);
    
    if (error) {
      console.error('Error deleting job:', error);
      return NextResponse.json(
        { message: 'Failed to delete job' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Job deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/jobs/[id]:`, error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}