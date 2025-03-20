import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

/**
 * POST /api/jobs/[id]/notes - Add a note to a job
 */
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const jobId = context.params.id;
    
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
    const { note } = await request.json();
    
    // Validate note
    if (!note || typeof note !== 'string' || note.trim() === '') {
      return NextResponse.json(
        { message: 'Note cannot be empty' },
        { status: 400 }
      );
    }
    
    // Format the note with timestamp
    const timestamp = new Date().toLocaleString();
    const formattedNote = `${timestamp}: ${note.trim()}`;
    
    // Append the note to existing notes or create new notes
    const updatedNotes = job.notes
      ? `${job.notes}\n\n${formattedNote}`
      : formattedNote;
    
    // Update the job
    const { data, error } = await supabase
      .from('jobs')
      .update({ notes: updatedNotes })
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding note:', error);
      return NextResponse.json(
        { message: 'Failed to add note' },
        { status: 500 }
      );
    }
    
    // Log activity
    await supabase
      .from('activities')
      .insert({
        user_id: session.user.id,
        job_id: jobId,
        activity_type: 'note_added',
        description: `Added note for ${job.position} at ${job.company}`
      });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in POST /api/jobs/[id]/notes:`, error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}