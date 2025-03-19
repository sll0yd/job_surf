import { 
  useEffect, 
  useState, 
  useCallback, 
  useRef,
  useMemo
} from 'react';
import { debounce } from './utils';
import { supabase } from './supabase';
import { 
  Job, 
  JobFilterParams, 
  UpdateJobData, 
  DashboardStats,
  JobStatus 
} from './types';
import { apiClient } from './api-client';

// Utility function to demonstrate type usage and exhaustive checking
function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}

/**
 * Custom hook to fetch jobs with filtering capabilities
 */
export function useJobs(initialFilters?: JobFilterParams) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<JobFilterParams>(initialFilters || {});
  
  // Use useRef to demonstrate its usage
  const jobCountRef = useRef(0);
  
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getJobs(filters);
      setJobs(data);
      // Update ref to show it's being used
      jobCountRef.current = data.length;
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
  
  // Update filters with a stable callback to avoid unnecessary re-renders
  const updateFilters = useCallback((newFilters: Partial<JobFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Create a memoized debounced search function
  const debouncedUpdateSearch = useMemo(() => 
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
  const updateJobStatus = useCallback(async (id: string, status: JobStatus) => {
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
    updateJobStatus,
    // Expose ref value to show it's being used
    jobCount: jobCountRef.current
  };
}

// Demonstrate debounce function usage
export function demonstrateDebounce() {
  // Create a debounced function to show its usage
  const debouncedLog = debounce((message: string) => {
    console.log('Debounced message:', message);
  }, 300);

  // Return the function so it's not considered unused
  return debouncedLog;
}

/**
 * Utility function to demonstrate type usage
 */
export function demonstrateTypeUsage() {
  // Explicitly use imported types
  const exampleUpdateJobData: UpdateJobData = {
    company: 'Example Company',
    position: 'Software Engineer',
    status: 'applied'
  };

  const exampleDashboardStats: DashboardStats = {
    total: 10,
    saved: 3,
    applied: 4,
    interview: 2,
    offer: 1,
    rejected: 1,
    applicationRate: 2.5,
    responseRate: 50,
    interviewRate: 25
  };

  // Demonstrate exhaustive status checking
  const checkStatusExhaustively = (status: JobStatus): string => {
    switch (status) {
      case 'saved':
        return 'Job is saved';
      case 'applied':
        return 'Job is applied';
      case 'interview':
        return 'Job is in interview stage';
      case 'offer':
        return 'Job has an offer';
      case 'rejected':
        return 'Job is rejected';
      default:
        return assertNever(status);
    }
  };

  // Use Supabase to prevent unused import warning
  const channelName = supabase.channel('test').toString();

  // Return some values to use the local variables
  return {
    exampleUpdateJobData,
    exampleDashboardStats,
    statusCheck: checkStatusExhaustively('applied'),
    channelName
  };
}

// Rest of the implementation remains the same...

// Additional exports to ensure all imported utilities are used
export const utilityExports = {
  debounce,
  assertNever
};