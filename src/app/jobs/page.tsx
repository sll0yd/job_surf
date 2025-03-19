'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/NavBar';
import JobList from '@/components/JobList';
import JobFilter from '@/components/JobFilter';
import { jobsService } from '@/lib/api-service';
import { JobData } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login if not authenticated
        router.push('/signin');
      }
    };
    
    checkAuth();
  }, [router]);

  // Fetch jobs from API
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await jobsService.getJobs();
        setJobs(data);
        setFilteredJobs(data);
      } catch (err: any) {
        console.error('Error loading jobs:', err);
        setError(err.message || 'Failed to load jobs');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJobs();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    const applyFilters = async () => {
      setIsLoading(true);
      
      try {
        // If we have API filtering, we can fetch filtered data from API
        if (filters.status !== 'all' || filters.search !== '') {
          const data = await jobsService.getJobs({
            status: filters.status !== 'all' ? filters.status : undefined,
            search: filters.search || undefined
          });
          setFilteredJobs(data);
        } else {
          // Otherwise, just show all jobs
          setFilteredJobs(jobs);
        }
      } catch (err: any) {
        console.error('Error applying filters:', err);
        setError(err.message || 'Failed to filter jobs');
      } finally {
        setIsLoading(false);
      }
    };
    
    applyFilters();
  }, [filters, jobs]);

  // Handle filter changes
  const handleFilterChange = (status: string, search: string) => {
    setFilters({ status, search });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">My Jobs</h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/jobs/new"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add New Job
            </Link>
          </div>
        </div>

        {/* Job Filters */}
        <JobFilter onFilterChange={handleFilterChange} />

        {isLoading ? (
          <div className="py-20 text-center">
            <svg className="animate-spin h-10 w-10 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-500">Loading your jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center my-20">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            {filters.status !== 'all' || filters.search !== '' ? (
              <p className="mt-1 text-sm text-gray-500">
                Try changing your filter settings or add a new job application.
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first job application.
              </p>
            )}
            <div className="mt-6">
              <Link 
                href="/jobs/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add a job
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{job.company}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${job.status === 'saved' ? 'bg-gray-100 text-gray-800' : ''}
                      ${job.status === 'applied' ? 'bg-blue-100 text-blue-800' : ''}
                      ${job.status === 'interview' ? 'bg-purple-100 text-purple-800' : ''}
                      ${job.status === 'offer' ? 'bg-green-100 text-green-800' : ''}
                      ${job.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{job.position}</p>
                  <p className="mt-1 text-xs text-gray-400">{job.location}</p>
                </div>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-500">
                      {job.applied_date ? (
                        <span>Applied: {new Date(job.applied_date).toLocaleDateString()}</span>
                      ) : (
                        <span>Added: {new Date(job.created_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}