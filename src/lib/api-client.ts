/**
 * Client-side API service for making requests to the backend 
 */

import { 
  Job, 
  JobFormData, 
  UpdateJobData,
  JobFilterParams,
  DashboardStats
} from './types';

// Base API URL - automatically uses the correct URL based on environment
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api' 
  : '/api';

/**
 * Generic function to handle API requests
 */
async function apiRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
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
 * API Client for the Job Application Tracker
 */
export const apiClient = {
  /**
   * Get all jobs with optional filtering
   */
  async getJobs(filters?: JobFilterParams): Promise<Job[]> {
    // Build query string from filters
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
  },
  
  /**
   * Get a job by ID
   */
  async getJob(id: string): Promise<Job> {
    return apiRequest<Job>(`/jobs/${id}`);
  },
  
  /**
   * Create a new job
   */
  async createJob(jobData: JobFormData): Promise<Job> {
    return apiRequest<Job>('/jobs', 'POST', jobData);
  },
  
  /**
   * Update a job
   */
  async updateJob(id: string, updates: UpdateJobData): Promise<Job> {
    return apiRequest<Job>(`/jobs/${id}`, 'PUT', updates);
  },
  
  /**
   * Delete a job
   */
  async deleteJob(id: string): Promise<void> {
    return apiRequest<void>(`/jobs/${id}`, 'DELETE');
  },
  
  /**
   * Update a job's status
   */
  async updateJobStatus(id: string, status: string): Promise<Job> {
    return apiRequest<Job>(`/jobs/${id}/status`, 'PUT', { status });
  },
  
  /**
   * Add a note to a job
   */
  async addJobNote(id: string, note: string): Promise<Job> {
    return apiRequest<Job>(`/jobs/${id}/notes`, 'POST', { note });
  },
  
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return apiRequest<DashboardStats>('/dashboard/stats');
  },
  
  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<any[]> {
    return apiRequest<any[]>(`/activities?limit=${limit}`);
  },
  
  /**
   * API auth endpoints
   */
  auth: {
    /**
     * Sign up
     */
    async signUp(email: string, password: string, name: string): Promise<any> {
      return apiRequest('/auth/signup', 'POST', { email, password, name });
    },
    
    /**
     * Sign in
     */
    async signIn(email: string, password: string): Promise<any> {
      return apiRequest('/auth/signin', 'POST', { email, password });
    },
    
    /**
     * Sign out
     */
    async signOut(): Promise<void> {
      return apiRequest('/auth/signout', 'POST');
    },
    
    /**
     * Request password reset
     */
    async forgotPassword(email: string): Promise<void> {
      return apiRequest('/auth/forgot-password', 'POST', { email });
    },
    
    /**
     * Reset password
     */
    async resetPassword(token: string, password: string): Promise<void> {
      return apiRequest('/auth/reset-password', 'POST', { token, password });
    },
    
    /**
     * Get current user
     */
    async getUser(): Promise<any> {
      return apiRequest('/auth/user');
    }
  }
};