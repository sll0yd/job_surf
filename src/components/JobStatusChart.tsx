import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface JobStatusChartProps {
  saved?: number;
  applied?: number;
  interview?: number;
  offer?: number;
  rejected?: number;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

// Define a proper type for the custom tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartData;
  }>;
}

const JobStatusChart = ({ 
  saved = 0,
  applied = 0, 
  interview = 0, 
  offer = 0, 
  rejected = 0 
}: JobStatusChartProps) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  
  useEffect(() => {
    // Create data array for the chart
    const data = [
      { name: 'Saved', value: saved, color: '#9CA3AF' },
      { name: 'Applied', value: applied, color: '#60A5FA' },
      { name: 'Interview', value: interview, color: '#A78BFA' },
      { name: 'Offer', value: offer, color: '#34D399' },
      { name: 'Rejected', value: rejected, color: '#F87171' }
    ].filter(item => item.value > 0); // Only include non-zero values
    
    setChartData(data);
  }, [saved, applied, interview, offer, rejected]);
  
  // If no data, display a message
  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">No job application data to display</p>
      </div>
    );
  }
  
  // Custom tooltip for the pie chart with proper typing
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
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
  
  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status Distribution</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${Math.round((value / total) * 100)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobStatusChart;