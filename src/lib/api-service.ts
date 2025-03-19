import { supabase } from './supabase';
import { Job, JobFormData, ActivityData, StatsData } from './types';

/**
 * Jobs API service - handles all interactions with the Supabase database
 */
export const jobsService = {
  /**
   * Fetch all jobs for the current user
   */
  async getJobs(filters?: { status?: string; search?: string }): Promise<Job[]> {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Start building the query
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('user_id', session.user.id);

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(`company.ilike.${searchTerm},position.ilike.${searchTerm}`);
    }

    // Order by updated_at descending by default
    query = query.order('updated_at', { ascending: false });

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      throw new Error(error.message);
    }

    return data as Job[];
  },

  /**
   * Get a job by ID
   */
  async getJob(id: string): Promise<Job> {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      throw new Error(error.message);
    }

    return data as Job;
  },

  /**
   * Create a new job
   */
  async createJob(job: JobFormData): Promise<Job> {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Add user_id to job data
    const jobWithUser = {
      ...job,
      user_id: session.user.id
    };

    const { data, error } = await supabase
      .from('jobs')
      .insert(jobWithUser)
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw new Error(error.message);
    }

    // Log activity
    await this.logActivity({
      activity_type: 'job_created',
      job_id: data.id,
      description: `Added ${data.position} at ${data.company}`
    });

    return data as Job;
  },

  /**
   * Update a job
   */
  async updateJob(id: string, updates: Partial<JobFormData>): Promise<Job> {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      throw new Error(error.message);
    }

    // Log activity
    await this.logActivity({
      activity_type: 'job_updated',
      job_id: id,
      description: `Updated ${data.position} at ${data.company}`
    });

    return data as Job;
  },

  /**
   * Delete a job
   */
  async deleteJob(id: string): Promise<boolean> {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Get job before deleting (for activity log)
    const { data: job } = await supabase
      .from('jobs')
      .select('position, company')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting job:', error);
      throw new Error(error.message);
    }

    // Log activity if we got the job data
    if (job) {
      await this.logActivity({
        activity_type: 'job_deleted',
        description: `Deleted ${job.position} at ${job.company}`
      });
    }

    return true;
  },

  /**
   * Update a job's status
   */
  async updateJobStatus(id: string, status: string): Promise<Job> {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Get current job to see the previous status
    const { data: currentJob } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (!currentJob) {
      throw new Error('Job not found');
    }

    // Prepare updates object with dates for specific statuses
    const updates: Record<string, string> = { status };
    
    // Set date fields based on new status
    if (status === 'applied' && !currentJob.applied_date) {
      updates.applied_date = new Date().toISOString();
    } else if (status === 'interview' && !currentJob.interview_date) {
      updates.interview_date = new Date().toISOString();
    } else if (status === 'offer' && !currentJob.offer_date) {
      updates.offer_date = new Date().toISOString();
    } else if (status === 'rejected' && !currentJob.rejected_date) {
      updates.rejected_date = new Date().toISOString();
    }

    // Update the job
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job status:', error);
      throw new Error(error.message);
    }

    // Log activity
    await this.logActivity({
      activity_type: 'status_changed',
      job_id: id,
      description: `Changed status from ${currentJob.status} to ${status} for ${data.position} at ${data.company}`
    });

    return data as Job;
  },

  /**
   * Add a note to a job
   */
  async addNote(id: string, note: string): Promise<Job> {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Get current job
    const { data: currentJob } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (!currentJob) {
      throw new Error('Job not found');
    }

    // Format the new note with timestamp
    const timestamp = new Date().toLocaleString();
    const formattedNote = `${timestamp}: ${note}`;
    
    // Append to existing notes or create new notes
    const updatedNotes = currentJob.notes
      ? `${currentJob.notes}\n\n${formattedNote}`
      : formattedNote;
    
    // Update the job with new notes
    const { data, error } = await supabase
      .from('jobs')
      .update({ notes: updatedNotes })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error adding note:', error);
      throw new Error(error.message);
    }

    // Log activity
    await this.logActivity({
      activity_type: 'note_added',
      job_id: id,
      description: `Added note to ${data.position} at ${data.company}`
    });

    return data as Job;
  },

  /**
   * Get dashboard stats
   */
  async getDashboardStats(): Promise<StatsData> {
    // Get all jobs first
    const jobs = await this.getJobs();
    
    // Count jobs by status
    const total = jobs.length;
    const saved = jobs.filter(job => job.status === 'saved').length;
    const applied = jobs.filter(job => job.status === 'applied').length;
    const interview = jobs.filter(job => job.status === 'interview').length;
    const offer = jobs.filter(job => job.status === 'offer').length;
    const rejected = jobs.filter(job => job.status === 'rejected').length;
    
    return {
      total,
      saved,
      applied,
      interview,
      offer,
      rejected
    };
  },

  /**
   * Get recent activities
   */
  async getActivities(limit = 10): Promise<ActivityData[]> {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        jobs:job_id (
          id,
          company,
          position
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities:', error);
      throw new Error(error.message);
    }

    return data.map(activity => ({
      id: activity.id,
      user_id: activity.user_id,
      activity_type: activity.activity_type,
      job_id: activity.job_id,
      description: activity.description,
      created_at: activity.created_at,
      job: activity.jobs ? {
        id: activity.jobs.id,
        company: activity.jobs.company,
        position: activity.jobs.position
      } : undefined
    })) as ActivityData[];
  },

  /**
   * Log a user activity
   */
  async logActivity({ activity_type, job_id, description }: { 
    activity_type: string; 
    job_id?: string; 
    description: string;
  }) {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: session.user.id,
        activity_type,
        job_id,
        description
      });

    if (error) {
      console.error('Error logging activity:', error);
      // Don't throw here, just log the error
    }
  }
};