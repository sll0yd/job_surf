'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/NavBar';
import DashboardStats from '@/components/DashboardStats';
import ActivityFeed from '@/components/ActivityFeed';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { jobsService } from '@/lib/api-service';
import { JobStatus } from '@/lib/types';
import { supabase } from '@/lib/supabase';

// Define types for our data
interface StatsData {
  total: number;
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

interface JobData {
  id: string;
  company: string;
  position: string;
  status: JobStatus;
  date: string;
}

// Define the types based on what ActivityFeed component expects
interface Activity {
  id: string;
  type: 'job_created' | 'status_changed' | 'note_added' | 'job_updated';
  date: string;
  description: string;
  job?: {
    id: string;
    company: string;
    position: string;
  };
}

// Import ActivityData from your types file but rename it to avoid conflict
import type { ActivityData as ApiActivityData } from '@/lib/types';

export default function Dashboard() {
  // State declarations with initial values
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  });
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Check authentication and redirect to login if needed
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

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First check auth status
        const isAuthenticated = await jobsService.checkAuthStatus();
        if (!isAuthenticated) {
          router.push('/signin');
          return;
        }
        
        // Fetch stats data with error handling
        try {
          const statsData = await jobsService.getDashboardStats();
          setStats(statsData);
        } catch (err) {
          console.error('Error fetching stats:', err);
          // Continue with empty stats rather than failing completely
        }
        
        // Fetch activities data - limit to 5 most recent
        try {
          const activitiesData: ApiActivityData[] = await jobsService.getActivities(5);
          
          // Convert ApiActivityData to Activity expected by ActivityFeed component
          const mappedActivities = activitiesData.map(activity => {
            // Filter out 'job_deleted' type since ActivityFeed doesn't support it
            if (activity.activity_type === 'job_deleted') {
              return {
                ...activity,
                id: activity.id,
                type: 'job_updated' as const, // Map to a supported type
                date: activity.created_at,
                description: activity.description,
                job: activity.job
              };
            }
            
            return {
              id: activity.id,
              type: activity.activity_type as 'job_created' | 'status_changed' | 'note_added' | 'job_updated',
              date: activity.created_at,
              description: activity.description,
              job: activity.job
            };
          });
          
          setActivities(mappedActivities);
        } catch (err) {
          console.error('Error fetching activities:', err);
          // Continue with empty activities
        }
        
        // Fetch recent jobs
        try {
          const jobsData = await jobsService.getJobs();
          // Sort by created date and take the 3 most recent
          const sortedJobs = jobsData
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
            .map(job => ({
              id: job.id,
              company: job.company,
              position: job.position,
              status: job.status,
              date: job.created_at
            }));
          
          setRecentJobs(sortedJobs);
        } catch (err) {
          console.error('Error fetching jobs:', err);
          // Continue with empty recent jobs
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Function to get status badge color - moved outside the JSX for cleaner code
  const getStatusColor = (status: JobStatus): string => {
    switch (status) {
      case 'saved':
        return 'bg-gray-100 text-gray-800';
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'offer':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to capitalize status
  const capitalizeStatus = (status: JobStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Welcome, {user?.user_metadata?.name || 'Surfer'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Here&apos;s an overview of your job applications
              </p>
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

          {isLoading ? (
            <div className="py-20 text-center">
              <svg className="animate-spin h-10 w-10 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-gray-500">Loading your dashboard...</p>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 mb-6">
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
          ) : (
            <>
              {/* Stats Section */}
              <div className="mb-10">
                <DashboardStats
                  total={stats.total}
                  saved={stats.saved}
                  applied={stats.applied}
                  interview={stats.interview}
                  offer={stats.offer}
                  rejected={stats.rejected}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-2">
                  {activities.length > 0 ? (
                    <ActivityFeed activities={activities} />
                  ) : (
                    <div className="bg-white shadow-sm rounded-lg p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
                      <div className="text-center py-10">
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Start by adding your first job application to track your progress.
                        </p>
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
                    </div>
                  )}
                </div>

                {/* Recent Jobs */}
                <div className="lg:col-span-1">
                  <div className="bg-white shadow-sm rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Jobs</h2>
                    {recentJobs.length > 0 ? (
                      <div className="space-y-4">
                        {recentJobs.map((job) => (
                          <div key={job.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <h3 className="text-sm font-medium text-gray-900">{job.company}</h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                {capitalizeStatus(job.status)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{job.position}</p>
                            <p className="text-xs text-gray-400 mt-1">Added on {formatDate(job.date)}</p>
                            <div className="mt-2">
                              <Link href={`/jobs/${job.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                View details →
                              </Link>
                            </div>
                          </div>
                        ))}
                        <div className="mt-6 text-center">
                          <Link href="/jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            View all jobs
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
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
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by adding your first job application.
                        </p>
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
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}