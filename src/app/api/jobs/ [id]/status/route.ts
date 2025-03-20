import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

/**
 * PUT /api/jobs/[id]/status - Update a job's status
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
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', session.user.id)
      .single();
    
    if (jobError || !job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const { status } = await request.json();
    
    // Validate status
    const validStatuses = ['saved', 'applied', 'interview', 'offer', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }
    
    // Prepare updates including date fields
    const updates: Record<string, string> = { status };
    
    // Set date field based on status
    if (status === 'applied' && !job.applied_date) {
      updates.applied_date = new Date().toISOString();
    } else if (status === 'interview' && !job.interview_date) {
      updates.interview_date = new Date().toISOString();
    } else if (status === 'offer' && !job.offer_date) {
      updates.offer_date = new Date().toISOString();
    } else if (status === 'rejected' && !job.rejected_date) {
      updates.rejected_date = new Date().toISOString();
    }
    
    // Update the job
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating job status:', error);
      return NextResponse.json(
        { message: 'Failed to update job status' },
        { status: 500 }
      );
    }
    
    // Log activity
    await supabase
      .from('activities')
      .insert({
        user_id: session.user.id,
        job_id: jobId,
        activity_type: 'status_changed',
        description: `Changed status from ${job.status} to ${status}`
      });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in PUT /api/jobs/[id]/status:`, error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}