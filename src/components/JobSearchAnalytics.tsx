import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

interface MonthlyData {
  month: string;
  applications: number;
  interviews: number;
  offers: number;
  rejections: number;
}

interface JobSearchAnalyticsProps {
  stats: StatsData;
  monthlyData: MonthlyData[];
}

// Custom tooltip type for the pie chart
interface CustomPieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      color: string;
    };
  }>;
}

const JobSearchAnalytics: React.FC<JobSearchAnalyticsProps> = ({ stats, monthlyData }) => {
  // Data for the pie chart
  const statusData = [
    { name: 'Saved', value: stats.saved, color: '#9CA3AF' },
    { name: 'Applied', value: stats.applied, color: '#60A5FA' },
    { name: 'Interview', value: stats.interview, color: '#A78BFA' },
    { name: 'Offer', value: stats.offer, color: '#34D399' },
    { name: 'Rejected', value: stats.rejected, color: '#F87171' }
  ].filter(item => item.value > 0);

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: CustomPieTooltipProps) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0];
      return (
        <div className="bg-white p-2 shadow-md border border-gray-200 rounded">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            <span className="font-medium">{data.value}</span> applications
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Calculate total applications for percentages in the pie chart
  const totalApplications = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-gray-500 text-sm font-medium">Total Applications</h2>
          <p className="text-3xl font-semibold">{stats.total}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-gray-500 text-sm font-medium">Active Applications</h2>
          <p className="text-3xl font-semibold">{stats.applied + stats.interview}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-gray-500 text-sm font-medium">Response Rate</h2>
          <p className="text-3xl font-semibold">{stats.responseRate}%</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-gray-500 text-sm font-medium">Interview Rate</h2>
          <p className="text-3xl font-semibold">{stats.interviewRate}%</p>
        </div>
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Application Status Distribution</h2>
          {statusData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${Math.round((value / totalApplications) * 100)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No application data available</p>
            </div>
          )}
        </div>
        
        {/* Application Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Application Timeline</h2>
          {monthlyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="applications" name="Applications" fill="#60A5FA" />
                  <Bar dataKey="interviews" name="Interviews" fill="#A78BFA" />
                  <Bar dataKey="offers" name="Offers" fill="#34D399" />
                  <Bar dataKey="rejections" name="Rejections" fill="#F87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No timeline data available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Success Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Application Success Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Response Rate</h3>
            <p className="text-3xl font-semibold">{stats.responseRate}%</p>
            <p className="text-sm text-gray-500">Percentage of applications receiving any response</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Interview Rate</h3>
            <p className="text-3xl font-semibold">{stats.interviewRate}%</p>
            <p className="text-sm text-gray-500">Percentage of applications leading to interviews</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Offer Rate</h3>
            <p className="text-3xl font-semibold">{stats.offerRate}%</p>
            <p className="text-sm text-gray-500">Percentage of applications resulting in offers</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Avg. Response Time</h3>
            <p className="text-3xl font-semibold">{stats.averageResponseTime} days</p>
            <p className="text-sm text-gray-500">Average time to receive a response</p>
          </div>
        </div>
      </div>
      
      {/* Personalized Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Personalized Insights</h2>
        
        <div className="space-y-4">
          {stats.interviewRate < 20 && stats.applied > 10 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="text-blue-800 font-medium">Improve Application Quality</h3>
              <p className="text-blue-700 text-sm">Your interview rate is below 20%. Consider tailoring your resume more specifically to each job and adding more relevant keywords.</p>
            </div>
          )}
          
          {stats.saved > 10 && stats.applied < 5 && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4">
              <h3 className="text-indigo-800 font-medium">Take Action</h3>
              <p className="text-indigo-700 text-sm">You have many saved jobs but haven't applied to many. Set aside time this week to start submitting applications.</p>
            </div>
          )}
          
          {stats.interview > 5 && stats.offer < 1 && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
              <h3 className="text-purple-800 font-medium">Interview Skills</h3>
              <p className="text-purple-700 text-sm">You're getting interviews but no offers. Consider practicing with mock interviews or reviewing common questions for your industry.</p>
            </div>
          )}
          
          {stats.total === 0 && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h3 className="text-green-800 font-medium">Get Started</h3>
              <p className="text-green-700 text-sm">Start your job search by saving jobs you're interested in and tracking your applications.</p>
            </div>
          )}
          
          {stats.averageResponseTime > 14 && stats.applied > 5 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="text-yellow-800 font-medium">Long Response Times</h3>
              <p className="text-yellow-700 text-sm">Companies are taking more than 2 weeks to respond. Consider applying to more companies that have faster hiring processes.</p>
            </div>
          )}
          
          {!stats.total && (
            <div className="bg-gray-50 border-l-4 border-gray-500 p-4">
              <h3 className="text-gray-800 font-medium">No Data Available</h3>
              <p className="text-gray-700 text-sm">Start tracking your job applications to see personalized insights and recommendations here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSearchAnalytics;