// src/app/jobs/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/NavBar';
import { jobsService } from '@/lib/api-service';
import { JobFormData, JobStatus } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import JobUrlExtractor from '@/components/JobUrlExtractor';
import { aiJobService } from '@/lib/openai-service';

// Initial form state
const initialFormData: JobFormData = {
  company: '',
  position: '',
  location: '',
  url: '',
  description: '',
  salary: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  notes: '',
  status: 'saved' as JobStatus,
};

export default function NewJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  
  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle job data extraction from URL
  const handleJobExtracted = (jobData: JobFormData) => {
    setFormData({
      ...formData,
      ...jobData,
    });
    setExtractionError(null);
  };

  // Handle extraction errors
  const handleExtractionError = (error: string) => {
    setExtractionError(error);
  };

  // Handle status change with date updates
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as JobStatus;
    const updates: Partial<JobFormData> = { status: newStatus };
    
    // Set appropriate date field if status is changed and date isn't already set
    const today = new Date().toISOString().substring(0, 10); // YYYY-MM-DD format
    
    if (newStatus === 'applied' && !formData.applied_date) {
      updates.applied_date = today;
    } else if (newStatus === 'interview' && !formData.interview_date) {
      updates.interview_date = today;
    } else if (newStatus === 'offer' && !formData.offer_date) {
      updates.offer_date = today;
    } else if (newStatus === 'rejected' && !formData.rejected_date) {
      updates.rejected_date = today;
    }
    
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    
    // If status is applied, make sure we have an applied date
    if (formData.status === 'applied' && !formData.applied_date) {
      newErrors.applied_date = 'Please provide an applied date';
    }
    
    // URL validation if provided
    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }
    
    // Email validation if provided
    if (formData.contact_email && !isValidEmail(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate email
  const isValidEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create the job
      await jobsService.createJob(formData);
      
      // Redirect to the jobs list
      router.push('/jobs');
    } catch (err: any) {
      console.error('Error creating job:', err);
      setError(err.message || 'Failed to create job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            Enter the details of your job application below or paste a job URL to extract details automatically.
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {extractionError && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Extraction Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{extractionError}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {/* Quick URL Import Section */}
            <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Quick Import</h3>
              <p className="mt-1 text-sm text-gray-500">
                Paste a job posting URL to automatically extract details.
              </p>
              <div className="mt-4">
                <label htmlFor="job-url" className="block text-sm font-medium text-gray-700">
                  Job URL
                </label>
                <div className="mt-1">
                  <JobUrlExtractor
                    onJobExtracted={handleJobExtracted}
                    onError={handleExtractionError}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                  />
                </div>
              </div>
            </div>
            
            {/* Basic Information */}
            <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Company */}
                <div className="sm:col-span-3">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="company"
                      id="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.company ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.company && (
                      <p className="mt-2 text-sm text-red-600">{errors.company}</p>
                    )}
                  </div>
                </div>

                {/* Position */}
                <div className="sm:col-span-3">
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                    Position *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="position"
                      id="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.position ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.position && (
                      <p className="mt-2 text-sm text-red-600">{errors.position}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="sm:col-span-3">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* URL */}
                <div className="sm:col-span-3">
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    Job URL
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="url"
                      id="url"
                      value={formData.url}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.url ? 'border-red-300' : ''
                      }`}
                      placeholder="https://example.com/job-posting"
                    />
                    {errors.url && (
                      <p className="mt-2 text-sm text-red-600">{errors.url}</p>
                    )}
                  </div>
                </div>

                {/* Salary */}
                <div className="sm:col-span-3">
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                    Salary
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="salary"
                      id="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Job Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Brief description of the job"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status and Dates */}
            <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Status & Dates</h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Status */}
                <div className="sm:col-span-3">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div className="mt-1">
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleStatusChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Applied Date */}
                <div className="sm:col-span-3">
                  <label htmlFor="applied_date" className="block text-sm font-medium text-gray-700">
                    Applied Date {formData.status === 'applied' && '*'}
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="applied_date"
                      id="applied_date"
                      value={formData.applied_date || ''}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.applied_date ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.applied_date && (
                      <p className="mt-2 text-sm text-red-600">{errors.applied_date}</p>
                    )}
                  </div>
                </div>

                {/* Interview Date */}
                <div className="sm:col-span-3">
                  <label htmlFor="interview_date" className="block text-sm font-medium text-gray-700">
                    Interview Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="interview_date"
                      id="interview_date"
                      value={formData.interview_date || ''}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Offer Date */}
                <div className="sm:col-span-3">
                  <label htmlFor="offer_date" className="block text-sm font-medium text-gray-700">
                    Offer Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="offer_date"
                      id="offer_date"
                      value={formData.offer_date || ''}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Rejected Date */}
                <div className="sm:col-span-3">
                  <label htmlFor="rejected_date" className="block text-sm font-medium text-gray-700">
                    Rejected Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="rejected_date"
                      id="rejected_date"
                      value={formData.rejected_date || ''}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Contact Information</h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Contact Name */}
                <div className="sm:col-span-3">
                  <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700">
                    Contact Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="contact_name"
                      id="contact_name"
                      value={formData.contact_name}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Contact Email */}
                <div className="sm:col-span-3">
                  <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="contact_email"
                      id="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.contact_email ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.contact_email && (
                      <p className="mt-2 text-sm text-red-600">{errors.contact_email}</p>
                    )}
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="sm:col-span-3">
                  <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="contact_phone"
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Notes</h3>
              <div className="mt-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add any notes about this job application..."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Job'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}