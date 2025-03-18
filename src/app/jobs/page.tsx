'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/NavBar';
import JobList from '@/components/JobList';

// Sample jobs data (replace with API call)
const SAMPLE_JOBS = [
  {
    id: '1',
    company: 'Tech Solutions Inc.',
    position: 'Frontend Developer',
    location: 'San Francisco, CA',
    status: 'applied',
    appliedDate: '2023-05-15T00:00:00Z',
    updatedAt: '2023-05-15T00:00:00Z',
  },
  {
    id: '2',
    company: 'Digital Innovations',
    position: 'UX Designer',
    location: 'Remote',
    status: 'interview',
    appliedDate: '2023-05-10T00:00:00Z',
    updatedAt: '2023-05-12T00:00:00Z',
  },
  {
    id: '3',
    company: 'Global Systems',
    position: 'Project Manager',
    location: 'New York, NY',
    status: 'saved',
    updatedAt: '2023-05-08T00:00:00Z',
  },
  {
    id: '4',
    company: 'Creative Solutions',
    position: 'Graphic Designer',
    location: 'Chicago, IL',
    status: 'rejected',
    appliedDate: '2023-05-01T00:00:00Z',
    updatedAt: '2023-05-05T00:00:00Z',
  },
  {
    id: '5',
    company: 'Innovative Tech',
    position: 'Backend Developer',
    location: 'Austin, TX',
    status: 'offer',
    appliedDate: '2023-04-20T00:00:00Z',
    updatedAt: '2023-05-10T00:00:00Z',
  },
  {
    id: '6',
    company: 'Future Finance',
    position: 'Data Analyst',
    location: 'Boston, MA',
    status: 'applied',
    appliedDate: '2023-04-25T00:00:00Z',
    updatedAt: '2023-04-25T00:00:00Z',
  },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    setIsLoading(true);
    
    // In a real app, you would fetch data from an API
    setTimeout(() => {
      setJobs(SAMPLE_JOBS);
      setIsLoading(false);
    }, 500);
  }, []);

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

        {isLoading ? (
          <div className="py-20 text-center">
            <svg className="animate-spin h-10 w-10 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-500">Loading your jobs...</p>
          </div>
        ) : (
          <JobList initialJobs={jobs} />
        )}
      </main>
    </div>
  );
}