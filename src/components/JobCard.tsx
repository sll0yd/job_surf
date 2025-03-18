'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';

interface JobCardProps {
  id: string;
  company: string;
  position: string;
  location: string;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
  appliedDate?: string;
  updatedAt: string;
}

export default function JobCard({
  id,
  company,
  position,
  location,
  status,
  appliedDate,
  updatedAt
}: JobCardProps) {
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900 truncate max-w-[70%]">{company}</h3>
          <StatusBadge status={status} />
        </div>
        
        <p className="text-gray-600 font-medium mb-1 truncate">{position}</p>
        
        {location && (
          <p className="text-gray-500 text-sm mb-3 truncate">{location}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-500">
          {appliedDate && (
            <div>
              Applied: {formatDate(appliedDate)}
            </div>
          )}
          
          <div>
            Updated: {formatDate(updatedAt)}
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <Link 
            href={`/jobs/${id}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View details
          </Link>
          
          <div className="flex space-x-2">
            <button 
              className="p-1 text-gray-400 hover:text-gray-500"
              aria-label="Edit job"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              className="p-1 text-gray-400 hover:text-red-500"
              aria-label="Delete job"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}