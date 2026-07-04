import React from 'react';
import { useAuth } from '../../services/AuthContext';
import { usePlacement } from '../../services/PlacementContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const PlacementStats = () => {
  const { user } = useAuth();
  const { applications, drives } = usePlacement();

  // Filter applications specifically for the logged-in student
  const studentApps = user 
    ? applications.filter(app => app.studentEmail.toLowerCase() === user.email.toLowerCase())
    : [];

  const appliedCount = studentApps.length;
  const selectedCount = studentApps.filter(app => app.status === 'Selected').length;
  const shortlistedCount = studentApps.filter(app => app.status === 'Shortlisted').length;
  const totalDrives = drives.length;

  const stats = [
    { label: 'Total Drives', value: totalDrives, color: 'bg-blue-100 text-blue-700', icon: '🎯' },
    { label: 'Applied Drives', value: appliedCount, color: 'bg-blue-50 text-blue-600', icon: '📝' },
    { label: 'Shortlisted', value: shortlistedCount, color: 'bg-yellow-100 text-yellow-700', icon: '⭐' },
    { label: 'Selected', value: selectedCount, color: 'bg-green-100 text-green-700', icon: '✅' },
  ];

  // Calculate dynamic chart data for the last 6 months
  const getChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const yearMonthStr = `${year}-${monthNum}`;
      
      const appsInMonth = studentApps.filter(app => app.date && app.date.startsWith(yearMonthStr));
      
      data.push({
        month: monthName,
        applied: appsInMonth.length,
        shortlisted: appsInMonth.filter(app => app.status === 'Shortlisted').length,
        selected: appsInMonth.filter(app => app.status === 'Selected').length
      });
    }
    return data;
  };

  const chartData = getChartData();

  // Find max value in chart to scale bar heights correctly (max height of 120px)
  const maxVal = Math.max(...chartData.map(d => Math.max(d.applied, d.shortlisted, d.selected)), 1);
  const scale = 120 / maxVal;

  // Calculate dynamic recent updates
  const getUpdates = () => {
    return studentApps.map(app => {
      let title = '';
      let desc = '';
      
      if (app.status === 'Selected') {
        title = `Selected for ${app.company}`;
        desc = `Congratulations! You have been selected for the ${app.role} role at ${app.company}.`;
      } else if (app.status === 'Shortlisted') {
        title = `Shortlisted for ${app.company}`;
        desc = `You have been shortlisted for the ${app.role} role at ${app.company}.`;
      } else if (app.status === 'Rejected') {
        title = `Application Update: ${app.company}`;
        desc = `Thank you for your interest. Your application for the ${app.role} role at ${app.company} has been updated to Rejected.`;
      } else {
        title = `Applied to ${app.company}`;
        desc = `Your application for the ${app.role} role at ${app.company} has been submitted successfully and is under review.`;
      }
      
      return {
        title,
        desc,
        date: app.date
      };
    }).slice(0, 5); // show top 5 recent updates
  };

  const updates = getUpdates();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Placement Statistics</h2>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg shadow flex flex-col items-center justify-center p-5 ${stat.color}`}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Placement Activity Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-700 mb-4">Placement Activity (Last 6 Months)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                stroke="#64748b" 
                fontSize={12} 
                fontWeight={600} 
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                stroke="#64748b" 
                fontSize={12} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#e2e8f0', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  color: '#1e293b'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
              />
              <Bar dataKey="applied" name="Applied" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="shortlisted" name="Shortlisted" fill="#eab308" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="selected" name="Selected" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Placement Updates */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4">Recent Placement Updates</h3>
        {updates.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-4">No recent activity or applications found.</p>
        ) : (
          <ul className="divide-y divide-blue-50">
            {updates.map((update, idx) => (
              <li key={idx} className="py-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-600 text-sm">{update.title}</span>
                  <span className="text-xs text-gray-400 font-mono">{update.date}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1 leading-relaxed">{update.desc}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PlacementStats;