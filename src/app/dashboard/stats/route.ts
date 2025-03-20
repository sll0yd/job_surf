import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

/**
 * GET /api/dashboard/stats - Get dashboard statistics for the current user
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
    
    // Get all jobs for the user
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error fetching jobs for stats:', error);
      return NextResponse.json(
        { message: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }
    
    // Count jobs by status
    const saved = jobs.filter(job => job.status === 'saved').length;
    const applied = jobs.filter(job => job.status === 'applied').length;
    const interview = jobs.filter(job => job.status === 'interview').length;
    const offer = jobs.filter(job => job.status === 'offer').length;
    const rejected = jobs.filter(job => job.status === 'rejected').length;
    
    // Calculate application rate (applications per week)
    const jobsWithAppliedDate = jobs.filter(job => job.applied_date !== null);
    let applicationRate = 0;
    
    if (jobsWithAppliedDate.length > 0) {
      // Find the earliest application date
      const oldestDate = new Date(
        Math.min(...jobsWithAppliedDate.map(job => new Date(job.applied_date!).getTime()))
      );
      
      const now = new Date();
      const totalDays = Math.max(
        1, 
        Math.round((now.getTime() - oldestDate.getTime()) / (24 * 60 * 60 * 1000))
      );
      
      const totalWeeks = Math.max(1, totalDays / 7);
      applicationRate = Math.round((applied + interview + offer + rejected) / totalWeeks * 10) / 10;
    }
    
    // Calculate response rate (percentage of applications with responses)
    const totalApplied = applied + interview + offer + rejected;
    const responsesReceived = interview + offer + rejected;
    const responseRate = totalApplied > 0 
      ? Math.round((responsesReceived / totalApplied) * 100)
      : 0;
    
    // Calculate interview rate
    const interviewRate = totalApplied > 0
      ? Math.round(((interview + offer) / totalApplied) * 100)
      : 0;
    
    // Stats object
    const stats = {
      total: jobs.length,
      saved,
      applied,
      interview,
      offer,
      rejected,
      applicationRate,
      responseRate,
      interviewRate
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in GET /api/dashboard/stats:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}