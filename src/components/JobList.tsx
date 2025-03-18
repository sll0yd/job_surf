'use client';

import { useState } from 'react';
import JobCard from './JobCard';
import JobFilter from './JobFilter';

type StatusType = 'all' | 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

interface Job {
  id: string;
  company: string;
  position: string;
  location: string;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
  appliedDate?: string;
  updatedAt: string;
}

interface JobListProps {
  initialJobs: Job[];
}

export default function JobList({ initialJobs }: JobListProps) {
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(initialJobs);
  
  const handleFilterChange = (status: StatusType, search: string) => {
    let result = [...initialJobs];
    
    // Filter by status
    if (status !== 'all') {
      result = result.filter(job => job.status === status);
    }
    
    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        job => 
          job.company.toLowerCase().includes(searchLower) ||
          job.position.toLowerCase().includes(searchLower) ||
          job.location.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredJobs(result);
  };
  
  return (
    <div>
      <JobFilter onFilterChange={handleFilterChange} />
      
      {filteredJobs.length === 0 ? (
        <div className="text-center my-12">
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
          <p className="mt-1 text-sm text-gray-500">
            Try changing your filter settings or add a new job application.
          </p>
          <div className="mt-6">
            <button
              type="button"
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
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              company={job.company}
              position={job.position}
              location={job.location}
              status={job.status}
              appliedDate={job.appliedDate}
              updatedAt={job.updatedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}