'use client';

import { useState } from 'react';

type StatusType = 'all' | 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

interface JobFilterProps {
  onFilterChange: (status: StatusType, search: string) => void;
}

export default function JobFilter({ onFilterChange }: JobFilterProps) {
  const [status, setStatus] = useState<StatusType>('all');
  const [search, setSearch] = useState('');

  const handleStatusChange = (newStatus: StatusType) => {
    setStatus(newStatus);
    onFilterChange(newStatus, search);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(status, search);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
      <div className="sm:flex sm:justify-between sm:items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Filter Jobs</h2>
        </div>
        <div className="mt-3 sm:mt-0">
          <form onSubmit={handleSearchSubmit} className="max-w-lg">
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex-grow focus-within:z-10">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={search}
                  onChange={handleSearchChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                  placeholder="Search by company or position"
                />
              </div>
              <button
                type="submit"
                className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="ml-2">Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-4">
        <div className="sm:hidden">
          <label htmlFor="status-filter-mobile" className="sr-only">
            Select a filter
          </label>
          <select
            id="status-filter-mobile"
            name="status-filter-mobile"
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            onChange={(e) => handleStatusChange(e.target.value as StatusType)}
            value={status}
          >
            <option value="all">All</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => handleStatusChange('all')}
              className={`${
                status === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusChange('saved')}
              className={`${
                status === 'saved'
                  ? 'bg-gray-100 text-gray-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Saved
            </button>
            <button
              onClick={() => handleStatusChange('applied')}
              className={`${
                status === 'applied'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Applied
            </button>
            <button
              onClick={() => handleStatusChange('interview')}
              className={`${
                status === 'interview'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Interview
            </button>
            <button
              onClick={() => handleStatusChange('offer')}
              className={`${
                status === 'offer'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Offer
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              className={`${
                status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Rejected
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}