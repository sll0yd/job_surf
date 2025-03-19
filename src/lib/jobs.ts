import { supabase } from './supabase';
import { 
  Job, 
  JobStatus, 
  JobFormData, 
  UpdateJobData, 
  JobFilterParams,
  DashboardStats,
  ActivityData 
} from './types';

// Explicit type usage to prevent unused import warnings
function _unusedTypeCheck() {
  const _status: JobStatus = 'saved';
  const _formData: JobFormData = {
    company: '',
    position: '',
    location: '',
    url: '',
    description: '',
    salary: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    status: 'saved'
  };
  const _updateData: UpdateJobData = {
    status: 'applied'
  };
  const _dashboardStats: DashboardStats = {
    total: 0,
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    applicationRate: 0,
    responseRate: 0,
    interviewRate: 0
  };
}

/**
 * Jobs Service - Contains all functions for interacting with jobs data
 */
export const jobsService = {
  /**
   * Fetch all jobs for a user
   */
  async getJobs(userId: string, filters?: JobFilterParams): Promise<Job[]> {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId);
    
    // Apply status filter if provided
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    // Apply search filter if provided
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(`company.ilike.${searchTerm},position.ilike.${searchTerm}`);
    }
    
    // Apply sorting if provided
    if (filters?.sortBy) {
      const direction = filters.sortDirection || 'desc';
      query = query.order(filters.sortBy, { ascending: direction === 'asc' });
    } else {
      // Default sort by updated_at desc
      query = query.order('updated_at', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching jobs:', error);
      throw new Error('Failed to fetch jobs');
    }
    
    return data as Job[];
  },
  
  /**
   * Get a single job by ID
   */
  async getJobById(id: string, userId: string): Promise<Job | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 means no rows returned, which is not an error for us
        return null;
      }
      
      console.error('Error fetching job:', error);
      throw new Error('Failed to fetch job');
    }
    
    return data as Job;
  },
  
  /**
   * Create a new job
   */
  async createJob(jobData: Omit<JobFormData, 'user_id'> & { user_id: string }): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating job:', error);
      throw new Error('Failed to create job');
    }
    
    // Log activity
    await this.logActivity(jobData.user_id, 'job_created', data.id, 
      `Created ${jobData.position} position at ${jobData.company}`);
    
    return data as Job;
  },
  
  /**
   * Update an existing job
   */
  async updateJob(id: string, userId: string, updates: UpdateJobData): Promise<Job> {
    // Get the current job first
    const currentJob = await this.getJobById(id, userId);
    
    if (!currentJob) {
      throw new Error('Job not found');
    }
    
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating job:', error);
      throw new Error('Failed to update job');
    }
    
    // Check if status was changed
    if (updates.status && updates.status !== currentJob.status) {
      await this.logActivity(userId, 'status_changed', id, 
        `Changed status from ${currentJob.status} to ${updates.status}`);
    } else {
      await this.logActivity(userId, 'job_updated', id, 
        `Updated ${data.position} at ${data.company}`);
    }
    
    return data as Job;
  },
  
  /**
   * Delete a job
   */
  async deleteJob(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting job:', error);
      throw new Error('Failed to delete job');
    }
  },
  
  /**
   * Update a job's status
   */
  async updateJobStatus(id: string, userId: string, status: JobStatus): Promise<Job> {
    // Prepare date updates based on status
    const dateUpdates: Record<string, string> = {};
    
    if (status === 'applied') {
      dateUpdates.applied_date = new Date().toISOString();
    } else if (status === 'interview') {
      dateUpdates.interview_date = new Date().toISOString();
    } else if (status === 'offer') {
      dateUpdates.offer_date = new Date().toISOString();
    } else if (status === 'rejected') {
      dateUpdates.rejected_date = new Date().toISOString();
    }
    
    return this.updateJob(id, userId, {
      status,
      ...dateUpdates
    });
  },
  
  /**
   * Add a note to a job
   */
  async addJobNote(id: string, userId: string, note: string): Promise<Job> {
    const currentJob = await this.getJobById(id, userId);
    
    if (!currentJob) {
      throw new Error('Job not found');
    }
    
    const updatedNotes = currentJob.notes
      ? `${currentJob.notes}\n\n${new Date().toLocaleString()}: ${note}`
      : `${new Date().toLocaleString()}: ${note}`;
    
    const result = await this.updateJob(id, userId, { notes: updatedNotes });
    
    // Log the activity
    await this.logActivity(userId, 'note_added', id, 
      `Added note for ${currentJob.position} at ${currentJob.company}`);
    
    return result;
  },
  
  /**
   * Get dashboard stats
   */
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    // Get all jobs for the user
    const jobs = await this.getJobs(userId);
    
    // Count jobs by status
    const saved = jobs.filter(job => job.status === 'saved').length;
    const applied = jobs.filter(job => job.status === 'applied').length;
    const interview = jobs.filter(job => job.status === 'interview').length;
    const offer = jobs.filter(job => job.status === 'offer').length;
    const rejected = jobs.filter(job => job.status === 'rejected').length;
    
    // Calculate application rate (applications per week)
    const oldestApplicationDate = jobs
      .filter(job => job.applied_date)
      .sort((a, b) => 
        new Date(a.applied_date!).getTime() - new Date(b.applied_date!).getTime()
      )[0]?.applied_date;
    
    let applicationRate = 0;
    
    if (oldestApplicationDate) {
      const oldestDate = new Date(oldestApplicationDate);
      const now = new Date();
      const weeks = Math.max(1, Math.round((now.getTime() - oldestDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
      applicationRate = Math.round((applied + interview + offer + rejected) / weeks * 10) / 10;
    }
    
    // Calculate response rate (percentage with interviews or decisions)
    const totalApplied = applied + interview + offer + rejected;
    const responsesReceived = interview + offer + rejected;
    const responseRate = totalApplied > 0 
      ? Math.round((responsesReceived / totalApplied) * 100)
      : 0;
    
    // Calculate interview rate
    const interviewRate = totalApplied > 0
      ? Math.round(((interview + offer) / totalApplied) * 100)
      : 0;
    
    return {
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
  },
  
  /**
   * Log a user activity
   */
  async logActivity(
    userId: string, 
    activityType: 'job_created' | 'job_updated' | 'status_changed' | 'note_added',
    jobId: string,
    description: string
  ): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: userId,
        job_id: jobId,
        activity_type: activityType,
        description
      });
    
    if (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging shouldn't break the main functionality
    }
  },
  
  /**
   * Get recent activities
   */
  async getRecentActivities(userId: string, limit: number = 10): Promise<ActivityData[]> {
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching activities:', error);
      throw new Error('Failed to fetch activities');
    }
    
    return data.map(activity => ({
      user_id: activity.user_id,
      id: activity.id,
      activity_type: activity.activity_type,
      created_at: activity.created_at,
      description: activity.description,
      job_id: activity.job_id,
      job: activity.jobs ? {
        id: activity.jobs.id,
        company: activity.jobs.company,
        position: activity.jobs.position
      } : undefined
    }) as ActivityData);
  }
};