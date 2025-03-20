// src/lib/api-service.ts
import { 
  Job, 
  JobFormData, 
  JobStatus, 
  JobFilterParams,
  DashboardStats,
  ActivityData 
} from './type-exports';
import { getErrorMessage } from './error-handling';

/**
 * Base API URL - automatically uses the correct URL based on environment
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Generic function to handle API requests
 */
async function apiRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: unknown
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies for session auth
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    // Handle HTTP error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API error: ${response.status} ${response.statusText}`
      );
    }
    
    // Parse successful response as JSON
    const result = await response.json();
    return result as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Jobs API service
 */
export const jobsService = {
  /**
   * Get all jobs with optional filtering
   */
  async getJobs(filters?: JobFilterParams): Promise<Job[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.status) {
        queryParams.append('status', filters.status);
      }
      
      if (filters?.search) {
        queryParams.append('search', filters.search);
      }
      
      if (filters?.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
      }
      
      if (filters?.sortDirection) {
        queryParams.append('sortDirection', filters.sortDirection);
      }
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return apiRequest<Job[]>(`/jobs${query}`);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw new Error(getErrorMessage(error));
    }
  },
  
  /**
   * Get a job by ID
   */
  async getJob(id: string): Promise<Job> {
    try {
      return apiRequest<Job>(`/jobs/${id}`);
    } catch (error) {
      console.error('Error fetching job:', error);
      throw new Error(`Failed to fetch job: ${getErrorMessage(error)}`);
    }
  },
  
  /**
   * Create a new job
   */
  async createJob(jobData: JobFormData): Promise<Job> {
    try {
      return apiRequest<Job>('/jobs', 'POST', jobData);
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error(`Failed to create job: ${getErrorMessage(error)}`);
    }
  },
  
  /**
   * Update a job
   */
  async updateJob(id: string, updates: Partial<JobFormData>): Promise<Job> {
    try {
      return apiRequest<Job>(`/jobs/${id}`, 'PUT', updates);
    } catch (error) {
      console.error('Error updating job:', error);
      throw new Error(`Failed to update job: ${getErrorMessage(error)}`);
    }
  },
  
  /**
   * Delete a job
   */
  async deleteJob(id: string): Promise<void> {
    try {
      await apiRequest<void>(`/jobs/${id}`, 'DELETE');
    } catch (error) {
      console.error('Error deleting job:', error);
      throw new Error(`Failed to delete job: ${getErrorMessage(error)}`);
    }
  },
  
  /**
   * Update a job's status
   */
  async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    try {
      return apiRequest<Job>(`/jobs/${id}/status`, 'PUT', { status });
    } catch (error) {
      console.error('Error updating job status:', error);
      throw new Error(`Failed to update status: ${getErrorMessage(error)}`);
    }
  },
  
  /**
   * Add a note to a job
   */
  async addNote(id: string, note: string): Promise<Job> {
    try {
      return apiRequest<Job>(`/jobs/${id}/notes`, 'POST', { note });
    } catch (error) {
      console.error('Error adding note:', error);
      throw new Error(`Failed to add note: ${getErrorMessage(error)}`);
    }
  },
  
  /**
   * Get dashboard stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return apiRequest<DashboardStats>('/dashboard/stats');
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(`Failed to fetch dashboard stats: ${getErrorMessage(error)}`);
    }
  },
  
  /**
   * Get activities
   */
  async getActivities(limit: number = 10): Promise<ActivityData[]> {
    try {
      return apiRequest<ActivityData[]>(`/activities?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw new Error(`Failed to fetch activities: ${getErrorMessage(error)}`);
    }
  },
};