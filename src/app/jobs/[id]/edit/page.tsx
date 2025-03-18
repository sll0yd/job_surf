'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/NavBar';
import JobForm from '@/components/JobForm';

// Sample job data (replace with API call)
const SAMPLE_JOB = {
  id: '1',
  company: 'Tech Solutions Inc.',
  position: 'Frontend Developer',
  location: 'San Francisco, CA',
  description: 'We are looking for an experienced Frontend Developer to join our team.',
  salary: '$120,000 - $150,000',
  url: 'https://techsolutions.example.com/careers/frontend-developer',
  status: 'applied',
  applied_date: '2023-05-15',
  notes: 'Applied through their career portal. Received confirmation email.',
  contact_name: 'Sarah Johnson',
  contact_email: 'sjohnson@techsolutions.example.com',
  contact_phone: '(555) 123-4567',
};

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API call to fetch job details
  useEffect(() => {
    setIsLoading(true);
    
    // In a real app, you would fetch data from an API based on jobId
    setTimeout(() => {
      setJob({...SAMPLE_JOB, id: jobId});
      setIsLoading(false);
    }, 500);
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="py-20 text-center">
            <svg className="animate-spin h-10 w-10 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-500">Loading job details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="py-20 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Job not found</h1>
            <p className="mt-4 text-gray-500">The job you are trying to edit does not exist or has been removed.</p>
            <Link href="/jobs" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              Back to jobs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center">
            <Link
              href={`/jobs/${jobId}`}
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <svg
                className="mr-1 -ml-1 w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Back to job details
            </Link>
          </div>
          <h1 className="mt-4 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Edit Job: {job.position} at {job.company}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update the details of this job application.
          </p>
        </div>
        
        <JobForm initialData={job} isEditing={true} />
      </main>
    </div>
  );
}