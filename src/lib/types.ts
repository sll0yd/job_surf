// Types for the Job Application Tracker

// Job Status type 
export type JobStatus = 
  | 'saved'      // Job saved for later application
  | 'applied'    // Application submitted
  | 'interview'  // Interview scheduled/completed
  | 'offer'      // Received job offer
  | 'rejected';  // Application rejected

// Base Job type with all properties
export interface Job {
  id: string;
  user_id: string;
  company: string;
  position: string;
  location: string;
  url: string;
  description: string;
  salary: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
  status: JobStatus;
  applied_date: string | null;
  interview_date: string | null;
  offer_date: string | null;
  rejected_date: string | null;
  created_at: string;
  updated_at: string;
}

// Type for Job form inputs (omitting system-generated fields)
export type JobFormData = Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Type for creating a new job
export type CreateJobData = Omit<Job, 'id' | 'created_at' | 'updated_at'>;

// Type for updating an existing job
export type UpdateJobData = Partial<Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// Job search/filter parameters
export interface JobFilterParams {
  status?: JobStatus;
  search?: string;
  sortBy?: 'company' | 'position' | 'applied_date' | 'updated_at';
  sortDirection?: 'asc' | 'desc';
}

// Dashboard stats type
export interface DashboardStats {
  total: number;
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  applicationRate: number; // Applications per week
  responseRate: number;    // Percentage of applications with responses
  interviewRate: number;   // Percentage of applications leading to interviews
}

// User activity type
export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'job_created' | 'job_updated' | 'status_changed' | 'note_added';
  job_id: string | null;
  description: string;
  created_at: string;
}