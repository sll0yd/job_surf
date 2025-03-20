'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/NavBar';
import JobStatsDashboard from '@/components/JobStatsDashboard';
import { jobsService } from '@/lib/api-service';
import { Job } from '@/lib/types'; // Ajout de l'import du type Job

interface MonthlyData {
  month: string;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

export default function EnhancedAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    responseRate: 0,
    interviewRate: 0,
    offerRate: 0,
    averageResponseTime: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all jobs to calculate stats and trends
        const jobs = await jobsService.getJobs();
        
        // Calculate basic stats
        const totalJobs = jobs.length;
        const savedJobs = jobs.filter(job => job.status === 'saved').length;
        const appliedJobs = jobs.filter(job => job.status === 'applied').length;
        const interviewJobs = jobs.filter(job => job.status === 'interview').length;
        const offerJobs = jobs.filter(job => job.status === 'offer').length;
        const rejectedJobs = jobs.filter(job => job.status === 'rejected').length;
        
        // Calculate response rate (percentage of applications that received any response)
        const totalApplications = appliedJobs + interviewJobs + offerJobs + rejectedJobs;
        const responsesReceived = interviewJobs + offerJobs + rejectedJobs;
        const responseRate = totalApplications > 0 
          ? Math.round((responsesReceived / totalApplications) * 100) 
          : 0;
        
        // Calculate interview rate
        const interviewRate = totalApplications > 0
          ? Math.round(((interviewJobs + offerJobs) / totalApplications) * 100)
          : 0;
        
        // Calculate offer rate
        const offerRate = totalApplications > 0
          ? Math.round((offerJobs / totalApplications) * 100)
          : 0;
        
        // Calculate average response time (in days)
        let totalResponseTime = 0;
        let responsesWithDates = 0;
        
        jobs.forEach(job => {
          if (job.applied_date && (job.interview_date || job.rejected_date)) {
            const appliedDate = new Date(job.applied_date);
            const responseDate = new Date(job.interview_date || job.rejected_date || '');
            
            // Ensure both dates are valid
            if (!isNaN(appliedDate.getTime()) && !isNaN(responseDate.getTime())) {
              const daysDifference = Math.floor((responseDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysDifference >= 0) {
                totalResponseTime += daysDifference;
                responsesWithDates++;
              }
            }
          }
        });
        
        const averageResponseTime = responsesWithDates > 0
          ? Math.round(totalResponseTime / responsesWithDates * 10) / 10
          : 0;
        
        // Generate monthly application data
        const monthlyStats = generateMonthlyData(jobs);
        
        // Update state with all calculated stats
        setStats({
          total: totalJobs,
          saved: savedJobs,
          applied: appliedJobs,
          interview: interviewJobs,
          offer: offerJobs,
          rejected: rejectedJobs,
          responseRate,
          interviewRate,
          offerRate,
          averageResponseTime
        });
        
        setMonthlyData(monthlyStats);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);

  // Generate monthly application data from jobs - using Job type instead of any
  const generateMonthlyData = (jobs: Job[]): MonthlyData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats: Record<string, MonthlyData> = {};
    
    // Initialize monthly data for the last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (today.getMonth() - i + 12) % 12;
      const monthKey = months[monthIndex];
      monthlyStats[monthKey] = {
        month: monthKey,
        applied: 0,
        interview: 0,
        offer: 0,
        rejected: 0
      };
    }
    
    // Populate with actual data
    jobs.forEach(job => {
      // Only include jobs with dates
      if (job.applied_date) {
        try {
          const appliedDate = new Date(job.applied_date);
          
          // Verify the date is valid
          if (!isNaN(appliedDate.getTime())) {
            // Only include jobs from the last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            if (appliedDate >= sixMonthsAgo) {
              const monthKey = months[appliedDate.getMonth()];
              
              // Only count if this month is in our tracking period
              if (monthlyStats[monthKey]) {
                // Count by status
                if (job.status === 'applied') {
                  monthlyStats[monthKey].applied++;
                } else if (job.status === 'interview') {
                  monthlyStats[monthKey].interview++;
                } else if (job.status === 'offer') {
                  monthlyStats[monthKey].offer++;
                } else if (job.status === 'rejected') {
                  monthlyStats[monthKey].rejected++;
                }
              }
            }
          }
        } catch (e) {
          // Ignore date parsing errors and continue with the next job
          console.warn('Error parsing job date:', e);
        }
      }
    });
    
    // Convert the record to an array
    return Object.values(monthlyStats);
  };

  // Display loading state
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

  // Display error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Job Search Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your job search performance and gain insights from your application data.
            </p>
          </div>
        </div>

        {/* Main dashboard component */}
        <JobStatsDashboard
          totalJobs={stats.total}
          saved={stats.saved}
          applied={stats.applied}
          interview={stats.interview}
          offer={stats.offer}
          rejected={stats.rejected}
          monthlyData={monthlyData}
        />
        
        {/* Additional metrics section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Metrics</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Response Rate</h4>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.responseRate}%</p>
              <p className="mt-1 text-sm text-gray-500">
                Percentage of applications that received a response
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Interview Rate</h4>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.interviewRate}%</p>
              <p className="mt-1 text-sm text-gray-500">
                Percentage of applications that led to interviews
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Offer Rate</h4>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.offerRate}%</p>
              <p className="mt-1 text-sm text-gray-500">
                Percentage of applications that resulted in job offers
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Avg. Response Time</h4>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.averageResponseTime} days</p>
              <p className="mt-1 text-sm text-gray-500">
                Average time to receive a response after applying
              </p>
            </div>
          </div>
        </div>
        
        {/* Recommendations section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personalized Recommendations</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Conditional recommendations based on stats */}
            {stats.total === 0 && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-indigo-800">Get Started</h4>
                    <p className="mt-1 text-sm text-indigo-700">
                      Start by adding jobs you&apos;re interested in. Even saved jobs help you track opportunities you want to pursue.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {stats.responseRate < 30 && stats.applied > 5 && (
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
                      Your response rate is below average. Try tailoring your resume more specifically to each job and include a customized cover letter.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {stats.applied === 0 && stats.saved > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800">Take Action</h4>
                    <p className="mt-1 text-sm text-green-700">
                      You have {stats.saved} saved jobs but haven&apos;t applied to any yet. Set aside time this week to start submitting applications.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {stats.interview > 0 && stats.offer === 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-purple-800">Interview Skills</h4>
                    <p className="mt-1 text-sm text-purple-700">
                      You&apos;re getting interviews but not offers. Consider practicing with mock interviews or review common questions for your industry.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {stats.rejected > 0 && stats.rejected / stats.total > 0.5 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">Broaden Your Search</h4>
                    <p className="mt-1 text-sm text-yellow-700">
                      Your rejection rate is high. Consider applying to a wider range of positions or industries that match your skills.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {stats.total > 0 && stats.total < 10 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-800">Increase Volume</h4>
                    <p className="mt-1 text-sm text-gray-700">
                      You have fewer than 10 applications. For a successful job search, aim to apply to at least 10-15 jobs per week.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}