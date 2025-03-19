// Job status type
export type JobStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

// Job data from the database
export interface JobData {
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

// Job form data (for create/update)
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

// Status option for UI
export interface StatusOption {
  value: JobStatus;
  label: string;
}

// Activity data
export interface ActivityData {
  id: string;
  type: 'job_created' | 'job_updated' | 'status_changed' | 'note_added' | 'job_deleted';
  date: string;
  description: string;
  job?: {
    id: string;
    company: string;
    position: string;
  };
}

// Dashboard stats
export interface StatsData {
  total: number;
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

// User profile data
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}