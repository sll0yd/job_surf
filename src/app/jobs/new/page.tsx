'use client';

import Navbar from '@/components/NavBar';
import JobForm from '@/components/JobForm';
import Link from 'next/link';

export default function NewJobPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center">
            <Link
              href="/jobs"
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
              Back to jobs
            </Link>
          </div>
          <h1 className="mt-4 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Add New Job
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill out the form below to add a new job application to your tracker.
          </p>
        </div>
        
        <JobForm />
      </main>
    </div>
  );
}