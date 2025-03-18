'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/NavBar';
import DashboardStats from '@/components/DashboardStats';
import ActivityFeed from '@/components/ActivityFeed';
import Link from 'next/link';

// Define types for our sample data
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
  status: string;
  date: string;
}

interface ActivityData {
  id: string;
  type: 'job_created' | 'status_changed' | 'note_added';
  date: string;
  description: string;
  job?: {
    id: string;
    company: string;
    position: string;
  };
}

// Sample data (replace with API calls)
const SAMPLE_STATS: StatsData = {
  total: 12,
  saved: 2,
  applied: 5,
  interview: 3,
  offer: 1,
  rejected: 1,
};

const SAMPLE_ACTIVITIES: ActivityData[] = [
  {
    id: '1',
    type: 'job_created',
    date: new Date().toISOString(),
    description: 'Added new job:',
    job: {
      id: '101',
      company: 'Tech Solutions Inc.',
      position: 'Frontend Developer',
    },
  },
  {
    id: '2',
    type: 'status_changed',
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    description: 'Changed status from Applied to Interview:',
    job: {
      id: '102',
      company: 'Digital Innovations',
      position: 'UX Designer',
    },
  },
  {
    id: '3',
    type: 'note_added',
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    description: 'Added note to:',
    job: {
      id: '103',
      company: 'Global Systems',
      position: 'Project Manager',
    },
  },
];

const SAMPLE_JOBS: JobData[] = [
  {
    id: '101',
    company: 'Tech Solutions Inc.',
    position: 'Frontend Developer',
    status: 'applied',
    date: new Date().toISOString(),
  },
  {
    id: '102',
    company: 'Digital Innovations',
    position: 'UX Designer',
    status: 'interview',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '103',
    company: 'Global Systems',
    position: 'Project Manager',
    status: 'saved',
    date: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function Dashboard() {
  // In a real app, you would fetch this data from an API
  // Using destructuring to only keep the state variables we need
  const [stats] = useState<StatsData>(SAMPLE_STATS);
  const [activities] = useState<ActivityData[]>(SAMPLE_ACTIVITIES);
  const [recentJobs] = useState<JobData[]>(SAMPLE_JOBS);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate data loading
  useEffect(() => {
    setIsLoading(true);
    // In a real app, you would fetch data from an API
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  // Function to get status badge color
  const getStatusColor = (status: string): string => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Dashboard</h1>
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
                <ActivityFeed activities={activities} />
              </div>

              {/* Recent Jobs */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Jobs</h2>
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-medium text-gray-900">{job.company}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{job.position}</p>
                        <p className="text-xs text-gray-400 mt-1">Added on {formatDate(job.date)}</p>
                        <div className="mt-2">
                          <Link href={`/jobs/${job.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                            View details &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Link href="/jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      View all jobs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}