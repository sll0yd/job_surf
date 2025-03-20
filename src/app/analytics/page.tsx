'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/NavBar';
import { supabase } from '@/lib/supabase';
import { jobsService } from '@/lib/api-service';
import { Job } from '@/lib/types';

// Import the JobSearchAnalytics component
import JobSearchAnalytics from '@/components/JobSearchAnalytics';

interface MonthlyData {
  month: string;
  applications: number;
  interviews: number;
  offers: number;
  rejections: number;
}

interface StatsData {
  total: number;
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  averageResponseTime: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData>({
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

  // Check if user is authenticated and fetch data
  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/signin');
          return;
        }
        
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
    
    initializePage();
  }, [router]);

  // Generate monthly application data from jobs
  const generateMonthlyData = (jobs: Job[]): MonthlyData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats: Record<string, MonthlyData> = {};
    
    // Initialize monthly data for the last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (today.getMonth() - i + 12) % 12;
      const yearMonthKey = `${today.getFullYear()}-${monthIndex}`;
      const monthKey = months[monthIndex];
      
      monthlyStats[yearMonthKey] = {
        month: monthKey,
        applications: 0,
        interviews: 0,
        offers: 0,
        rejections: 0
      };
    }
    
    // Populate with actual data
    jobs.forEach(job => {
      // Only include jobs with applied dates
      if (job.applied_date) {
        try {
          const appliedDate = new Date(job.applied_date);
          
          // Verify the date is valid
          if (!isNaN(appliedDate.getTime())) {
            // Only include jobs from the last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            if (appliedDate >= sixMonthsAgo) {
              const yearMonthKey = `${appliedDate.getFullYear()}-${appliedDate.getMonth()}`;
              const monthKey = months[appliedDate.getMonth()];
              
              // Only count if this month is in our tracking period
              if (monthlyStats[yearMonthKey]) {
                monthlyStats[yearMonthKey].applications++;
                
                // Count by status
                if (job.status === 'interview') {
                  monthlyStats[yearMonthKey].interviews++;
                } else if (job.status === 'offer') {
                  monthlyStats[yearMonthKey].offers++;
                } else if (job.status === 'rejected') {
                  monthlyStats[yearMonthKey].rejections++;
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
    
    // Convert the record to an array and sort by month order
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
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Job Search Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your job search performance and gain insights from your application data.
            </p>
          </div>
        </div>

        {/* Pass the calculated data to the JobSearchAnalytics component */}
        <JobSearchAnalytics 
          stats={stats} 
          monthlyData={monthlyData} 
        />
      </main>
    </div>
  );
}