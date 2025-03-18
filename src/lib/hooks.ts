import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce } from './utils';
import { supabase } from './supabase';
import { Job, JobFilterParams, UpdateJobData, DashboardStats } from './types';
import { apiClient } from './api-client';

/**
 * Custom hook to fetch jobs with filtering capabilities
 */
export function useJobs(initialFilters?: JobFilterParams) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<JobFilterParams>(initialFilters || {});
  
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getJobs(filters);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch jobs'));
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  // Fetch jobs when filters change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  // Update filters with debounce for search
  const updateFilters = useCallback((newFilters: Partial<JobFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Debounced search function
  const debouncedUpdateSearch = useCallback(
    debounce((search: string) => {
      updateFilters({ search });
    }, 300),
    [updateFilters]
  );
  
  // Function to handle job deletion
  const deleteJob = useCallback(async (id: string) => {
    try {
      await apiClient.deleteJob(id);
      setJobs(prev => prev.filter(job => job.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting job:', err);
      return false;
    }
  }, []);
  
  // Function to handle job status update
  const updateJobStatus = useCallback(async (id: string, status: string) => {
    try {
      const updatedJob = await apiClient.updateJobStatus(id, status);
      setJobs(prev => 
        prev.map(job => job.id === id ? updatedJob : job)
      );
      return updatedJob;
    } catch (err) {
      console.error('Error updating job status:', err);
      throw err;
    }
  }, []);
  
  return {
    jobs,
    isLoading,
    error,
    filters,
    updateFilters,
    debouncedUpdateSearch,
    refreshJobs: fetchJobs,
    deleteJob,
    updateJobStatus
  };
}

/**
 * Custom hook to manage a single job
 */
export function useJob(jobId: string) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getJob(jobId);
      setJob(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch job'));
      console.error('Error fetching job:', err);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);
  
  // Fetch job on initial load and when jobId changes
  useEffect(() => {
    fetchJob();
  }, [fetchJob]);
  
  // Update job function
  const updateJob = useCallback(async (updates: UpdateJobData) => {
    if (!jobId) return null;
    
    try {
      const updatedJob = await apiClient.updateJob(jobId, updates);
      setJob(updatedJob);
      return updatedJob;
    } catch (err) {
      console.error('Error updating job:', err);
      throw err;
    }
  }, [jobId]);
  
  // Add note function
  const addNote = useCallback(async (note: string) => {
    if (!jobId) return null;
    
    try {
      const updatedJob = await apiClient.addJobNote(jobId, note);
      setJob(updatedJob);
      return updatedJob;
    } catch (err) {
      console.error('Error adding note:', err);
      throw err;
    }
  }, [jobId]);
  
  return {
    job,
    isLoading,
    error,
    refreshJob: fetchJob,
    updateJob,
    addNote
  };
}

/**
 * Custom hook for real-time job updates using Supabase subscriptions
 */
export function useJobsSubscription(userId: string) {
  const [realtimeJobs, setRealtimeJobs] = useState<Job[]>([]);
  
  useEffect(() => {
    if (!userId) return;
    
    // Initial fetch
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }
      
      setRealtimeJobs(data as Job[]);
    };
    
    fetchJobs();
    
    // Set up realtime subscription
    const subscription = supabase
      .channel('jobs_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'jobs',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRealtimeJobs(prev => [payload.new as Job, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setRealtimeJobs(prev => 
            prev.map(job => job.id === payload.new.id ? payload.new as Job : job)
          );
        } else if (payload.eventType === 'DELETE') {
          setRealtimeJobs(prev => 
            prev.filter(job => job.id !== payload.old.id)
          );
        }
      })
      .subscribe();
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);
  
  return { realtimeJobs };
}

/**
 * Custom hook for fetching dashboard stats
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  return {
    stats,
    isLoading,
    error,
    refreshStats: fetchStats
  };
}

/**
 * Custom hook for managing window size and responsive design
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away to update state with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures effect runs only on mount and unmount
  
  return windowSize;
}

/**
 * Custom hook for managing form state
 */
export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  // Handle field change
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);
  
  // Handle field blur
  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);
  
  // Set a specific field value
  const setFieldValue = useCallback((name: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValues,
    setErrors,
    setTouched,
    setFieldValue,
    handleChange,
    handleBlur,
    resetForm,
    setIsSubmitting
  };
}

/**
 * Custom hook for localStorage persistence
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });
  
  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue] as const;
}

/**
 * Custom hook for detecting clicks outside a component
 */
export function useOutsideClick(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Unbind the event listener on cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);
  
  return ref;
}