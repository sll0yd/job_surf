'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/NavBar';

// Sample analytics data (replace with API call)
const SAMPLE_DATA = {
  applicationsByMonth: [
    { name: 'Jan', count: 5 },
    { name: 'Feb', count: 8 },
    { name: 'Mar', count: 12 },
    { name: 'Apr', count: 10 },
    { name: 'May', count: 7 },
    { name: 'Jun', count: 9 },
  ],
  statusBreakdown: [
    { name: 'Saved', value: 10 },
    { name: 'Applied', value: 25 },
    { name: 'Interview', value: 8 },
    { name: 'Offer', value: 2 },
    { name: 'Rejected', value: 5 },
  ],
  responseRate: 65, // percentage
  interviewRate: 42, // percentage
  offerRate: 10, // percentage
  averageResponseTime: 8.5, // days
};

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    setIsLoading(true);
    
    // In a real app, you would fetch data from an API
    setTimeout(() => {
      setData(SAMPLE_DATA);
      setIsLoading(false);
    }, 500);
  }, []);

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'saved':
        return 'bg-gray-500';
      case 'applied':
        return 'bg-blue-500';
      case 'interview':
        return 'bg-purple-500';
      case 'offer':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Function to calculate bar height based on maximum value
  const calculateBarHeight = (value: number, maxValue: number) => {
    return (value / maxValue) * 100;
  };

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
            <p className="mt-4 text-gray-500">Loading analytics data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="py-20 text-center">
            <h1 className="text-2xl font-bold text-gray-900">No data available</h1>
            <p className="mt-4 text-gray-500">There is not enough data to generate analytics. Try adding more job applications first.</p>
          </div>
        </main>
      </div>
    );
  }

  // Calculate maximum value for the bar chart
  const maxApplications = Math.max(...data.applicationsByMonth.map((item: any) => item.count));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your job search performance and gain insights from your application data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Response Rate */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Response Rate</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.responseRate}%</dd>
              <p className="mt-2 text-sm text-gray-500">Percentage of applications that received a response</p>
            </div>
          </div>

          {/* Interview Rate */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Interview Rate</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.interviewRate}%</dd>
              <p className="mt-2 text-sm text-gray-500">Percentage of applications that led to interviews</p>
            </div>
          </div>

          {/* Offer Rate */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Offer Rate</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.offerRate}%</dd>
              <p className="mt-2 text-sm text-gray-500">Percentage of applications that resulted in job offers</p>
            </div>
          </div>

          {/* Average Response Time */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Avg. Response Time</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.averageResponseTime} days</dd>
              <p className="mt-2 text-sm text-gray-500">Average time to receive a response after applying</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Applications by Month */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Applications by Month</h3>
              <p className="mt-1 text-sm text-gray-500">Number of job applications submitted each month</p>
              
              <div className="mt-6 h-64 flex items-end space-x-2 overflow-hidden">
                {data.applicationsByMonth.map((month: any) => (
                  <div key={month.name} className="relative flex-1 flex flex-col items-center">
                    <div 
                      className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm"
                      style={{ height: `${calculateBarHeight(month.count, maxApplications)}%` }}
                    />
                    <div className="w-full text-center mt-2 z-10">
                      <div className="text-sm font-medium text-gray-500">{month.name}</div>
                      <div className="text-sm font-semibold text-gray-900">{month.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Applications by Status</h3>
              <p className="mt-1 text-sm text-gray-500">Distribution of job applications by current status</p>
              
              <div className="mt-6 space-y-4">
                {data.statusBreakdown.map((status: any) => (
                  <div key={status.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`h-4 w-4 rounded-full ${getStatusColor(status.name)} mr-2`} />
                        <span className="text-sm font-medium text-gray-900">{status.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-500">{status.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${getStatusColor(status.name)}`} 
                        style={{ width: `${(status.value / data.statusBreakdown.reduce((sum: number, item: any) => sum + item.value, 0)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional insights */}
        <div className="mt-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Job Search Insights</h3>
              <p className="mt-1 text-sm text-gray-500">
                Recommendations based on your job application data
              </p>
              
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">Response Rate Analysis</h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Your response rate is {data.responseRate}%, which is {data.responseRate > 50 ? 'above' : 'below'} the average of 50%. 
                        {data.responseRate < 50 ? ' Consider tailoring your resume more specifically to each job.' : ' Great job!'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-green-800">Interview Performance</h4>
                      <p className="mt-1 text-sm text-green-700">
                        Your interview-to-offer conversion rate is {Math.round((data.offerRate / data.interviewRate) * 100)}%. 
                        Focus on improving your interview skills to increase this rate.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-purple-800">Application Timing</h4>
                      <p className="mt-1 text-sm text-purple-700">
                        You submitted the most applications in March. Consider increasing your application volume consistently each month.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-800">Response Time</h4>
                      <p className="mt-1 text-sm text-yellow-700">
                        The average response time is {data.averageResponseTime} days. Consider following up if you haven't heard back within 10-14 days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}