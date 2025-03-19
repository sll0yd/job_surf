'use client';

import { useState, useEffect, useCallback } from 'react';
import { openAIService } from '@/lib/openai-service';
// Import the correct JobFormData type from your project
import { JobFormData as ProjectJobFormData } from '@/lib/types';

interface JobUrlImportProps {
  url?: string;
  onJobExtracted: (jobData: ProjectJobFormData) => void;
  onCancel: () => void;
}

export default function JobUrlImport({ url = '', onJobExtracted, onCancel }: JobUrlImportProps) {
  const [jobUrl, setJobUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);

  // Validate URL - define this function first
  const validateUrl = useCallback((input: string): boolean => {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  }, []);
  
  // Extract job details from URL - define this function second
  const extractJobDetails = useCallback(async (urlToExtract: string) => {
    if (!urlToExtract || !validateUrl(urlToExtract)) {
      setError('Please enter a valid URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const jobData = await openAIService.extractJobFromUrl(urlToExtract);
      // Convert to the expected type if needed
      onJobExtracted(jobData as unknown as ProjectJobFormData);
    } catch (err: unknown) {
      console.error('Error extracting job:', err);
      // Handle the error in a type-safe way
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract job details';
      setError(errorMessage || 'Please try again or enter job details manually.');
      setIsLoading(false);
    }
  }, [onJobExtracted, validateUrl]);
  
  // Now use these functions in useEffect - after they've been defined
  useEffect(() => {
    if (url) {
      setJobUrl(url);
      // Auto-extract if URL is provided from parent
      if (url && !isExtracting) {
        setIsExtracting(true);
        extractJobDetails(url);
      }
    }
  }, [url, extractJobDetails, isExtracting]);

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    setJobUrl(inputUrl);
    
    // Only validate if there's actually input
    if (inputUrl.length > 0) {
      setIsValidUrl(validateUrl(inputUrl));
    } else {
      setIsValidUrl(true);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await extractJobDetails(jobUrl);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Import job from URL
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Paste the URL of a job posting and we&apos;ll automatically extract the details.
          </p>
        </div>
        
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-5">
          <div className="w-full sm:max-w-lg">
            <label htmlFor="job-url" className="sr-only">
              Job URL
            </label>
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                name="job-url"
                id="job-url"
                className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border ${
                  !isValidUrl ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://example.com/job-posting"
                value={jobUrl}
                onChange={handleUrlChange}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isLoading || !jobUrl || !isValidUrl}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Extracting...
                  </>
                ) : (
                  "Extract Details"
                )}
              </button>
            </div>
            {!isValidUrl && jobUrl.length > 0 && (
              <p className="mt-2 text-sm text-red-600">
                Please enter a valid URL starting with http:// or https://
              </p>
            )}
          </div>
          
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
        
        {isLoading && (
          <div className="mt-6">
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-4 text-center text-sm text-gray-600">
              Analyzing job posting. This may take a moment...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}