// src/components/JobUrlExtractor.tsx
import React, { useState } from 'react';
import { aiJobService } from '@/lib/openai-service';
import { JobFormData } from '@/lib/types';

interface JobUrlExtractorProps {
  onJobExtracted: (jobData: JobFormData) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function JobUrlExtractor({ 
  onJobExtracted, 
  onError, 
  isLoading, 
  setIsLoading 
}: JobUrlExtractorProps) {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);

  // Validate URL
  const validateUrl = (input: string): boolean => {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    
    // Only validate if there's actually input
    if (inputUrl.length > 0) {
      setIsValidUrl(validateUrl(inputUrl));
    } else {
      setIsValidUrl(true);
    }
  };

  // Extract job details from URL
  const extractJobDetails = async () => {
    if (!url || !validateUrl(url)) {
      setIsValidUrl(false);
      onError('Please enter a valid URL');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use our AI service to extract job details
      const jobData = await aiJobService.extractJobFromUrl(url);
      onJobExtracted(jobData);
    } catch (err) {
      console.error('Error extracting job:', err);
      // Convert error to string in a type-safe way
      let errorMessage = 'Failed to extract job details';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      onError(errorMessage || 'Please try again or enter details manually.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-1 flex rounded-md shadow-sm">
      <input
        type="url"
        value={url}
        onChange={handleUrlChange}
        className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border ${
          !isValidUrl ? 'border-red-300' : 'border-gray-300'
        }`}
        placeholder="https://example.com/job-posting"
        disabled={isLoading}
      />
      <button
        type="button"
        onClick={extractJobDetails}
        disabled={isLoading || !url}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
          <>
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Extract Data
          </>
        )}
      </button>
    </div>
  );
}