// Job status type
export type JobStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

// Job data interface (renamed from JobData to Job)
export interface Job {
  id: string;
  user_id: string;
  company: string;
  position: string;
  location: string;
  url?: string;
  description?: string;
  salary?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  status: JobStatus;
  applied_date?: string;
  interview_date?: string;
  offer_date?: string;
  rejected_date?: string;
  created_at: string;
  updated_at: string;
}

// Alias JobData to Job for backward compatibility
export type JobData = Job;

// Job form data interface
export interface JobFormData {
  company: string;
  position: string;
  location: string;
  url?: string;
  description?: string;
  salary?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  status: JobStatus;
  applied_date?: string;
  interview_date?: string;
  offer_date?: string;
  rejected_date?: string;
}

// Update job data type
export type UpdateJobData = Partial<JobFormData>;

// Job filter parameters interface
export interface JobFilterParams {
  status?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Dashboard statistics interface (renamed from StatsData to DashboardStats)
export interface DashboardStats {
  total: number;
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  applicationRate?: number;
  responseRate?: number;
  interviewRate?: number;
}

// Alias StatsData to DashboardStats for backward compatibility
export type StatsData = DashboardStats;

// User authentication response interface
export interface AuthResponse {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  session?: {
    access_token: string;
    refresh_token: string;
  };
}

// Activity data interface
export interface ActivityData {
  id: string;
  user_id: string;
  activity_type: string;
  job_id?: string;
  description: string;
  created_at: string;
  job?: {
    id: string;
    company: string;
    position: string;
  };
}

// Optional: Type assertion export to help with imports
export const types = {
  Job: {} as Job,
  JobData: {} as JobData,
  JobFormData: {} as JobFormData,
  UpdateJobData: {} as UpdateJobData,
  JobFilterParams: {} as JobFilterParams,
  DashboardStats: {} as DashboardStats,
  StatsData: {} as StatsData,
  AuthResponse: {} as AuthResponse,
  ActivityData: {} as ActivityData,
};