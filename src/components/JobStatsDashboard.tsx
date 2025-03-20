import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import JobStatusChart from './JobStatusChart';

interface JobStatsDashboardProps {
  totalJobs?: number;
  saved?: number;
  applied?: number;
  interview?: number;
  offer?: number;
  rejected?: number;
  monthlyData?: Array<MonthlyData>;
}

interface MonthlyData {
  month: string;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

const JobStatsDashboard = ({
  totalJobs = 0,
  saved = 0,
  applied = 0,
  interview = 0,
  offer = 0,
  rejected = 0,
  monthlyData = []
}: JobStatsDashboardProps) => {
  const [historyData, setHistoryData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    // If monthlyData is provided, use it
    if (monthlyData && monthlyData.length > 0) {
      setHistoryData(monthlyData);
    } else {
      // Otherwise create sample data based on the current month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      
      // Generate 6 months of sample data ending with the current month
      const sampleData: MonthlyData[] = Array(6).fill(0).map((_, index) => {
        const monthIndex = (currentMonth - 5 + index + 12) % 12;
        
        // Distribute total numbers across the months with a bias toward recent months
        const factor = 0.5 + (index / 10);
        
        return {
          month: months[monthIndex],
          applied: Math.round((applied / 6) * factor),
          interview: Math.round((interview / 6) * factor),
          offer: Math.round((offer / 6) * factor),
          rejected: Math.round((rejected / 6) * factor)
        };
      });
      
      setHistoryData(sampleData);
    }
  }, [monthlyData, applied, interview, offer, rejected]);

  // Calculate success rate (offers / total completed applications)
  const completedApplications = interview + offer + rejected;
  const successRate = completedApplications > 0 
    ? Math.round((offer / completedApplications) * 100) 
    : 0;

  // Calculate response rate (interviews / applied)
  const responseRate = applied > 0 
    ? Math.round(((interview + offer + rejected) / applied) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Jobs</h4>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">{totalJobs}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Applications</h4>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">{applied + interview}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Success Rate</h4>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">{successRate}%</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Response Rate</h4>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">{responseRate}%</p>
          </div>
        </div>
      </div>
      
      {/* Charts section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie chart */}
        <JobStatusChart 
          saved={saved}
          applied={applied}
          interview={interview}
          offer={offer}
          rejected={rejected}
        />
        
        {/* Monthly trend chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application History</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={historyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" scale="point" padding={{ left: 10, right: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applied" fill="#60A5FA" name="Applied" />
                <Bar dataKey="interview" fill="#A78BFA" name="Interview" />
                <Bar dataKey="offer" fill="#34D399" name="Offer" />
                <Bar dataKey="rejected" fill="#F87171" name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Tips section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Job Search Insights</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {responseRate < 30 && applied > 5 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Improve Your Response Rate</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Consider tailoring your resume and cover letter more specifically to each job posting to boost your response rate.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {interview > 0 && offer === 0 && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-purple-800">Interview to Offer Conversion</h4>
                  <p className="mt-1 text-sm text-purple-700">
                    Focus on enhancing your interview skills - consider practice interviews or review common questions for your industry.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {applied === 0 && saved > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800">Start Applying</h4>
                  <p className="mt-1 text-sm text-green-700">
                  You have saved jobs but haven&apos;t applied yet. Set aside time to start submitting applications to these saved opportunities.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {totalJobs > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-800">Job Search Tip</h4>
                  <p className="mt-1 text-sm text-gray-700">
                    Keep your job search organized by adding notes after interviews and regularly updating application statuses.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobStatsDashboard;