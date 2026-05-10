import React from 'react';

// Dummy statistics data
const stats = [
  { label: 'Total Drives', value: 24, color: 'bg-blue-100 text-blue-700', icon: '🎯' },
  { label: 'Applied Drives', value: 12, color: 'bg-blue-50 text-blue-600', icon: '📝' },
  { label: 'Shortlisted', value: 5, color: 'bg-yellow-100 text-yellow-700', icon: '⭐' },
  { label: 'Selected', value: 2, color: 'bg-green-100 text-green-700', icon: '✅' },
];

// Dummy chart data (last 6 months)
const chartData = [
  { month: 'Jan', applied: 2, shortlisted: 1, selected: 0 },
  { month: 'Feb', applied: 3, shortlisted: 1, selected: 1 },
  { month: 'Mar', applied: 1, shortlisted: 0, selected: 0 },
  { month: 'Apr', applied: 2, shortlisted: 1, selected: 0 },
  { month: 'May', applied: 3, shortlisted: 2, selected: 1 },
  { month: 'Jun', applied: 1, shortlisted: 0, selected: 0 },
];

// Dummy recent updates
const updates = [
  {
    title: 'Selected for Infosys',
    date: '2026-05-01',
    desc: 'Congratulations! You have been selected for Infosys.',
  },
  {
    title: 'Shortlisted for TCS',
    date: '2026-04-25',
    desc: 'You have been shortlisted for the TCS drive.',
  },
  {
    title: 'Applied to Wipro',
    date: '2026-04-20',
    desc: 'Your application for Wipro has been submitted.',
  },
];

const PlacementStats = () => (
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
      <div className="overflow-x-auto">
        <div className="flex items-end h-40 space-x-6">
          {chartData.map((data) => (
            <div key={data.month} className="flex flex-col items-center w-16">
              {/* Applied */}
              <div
                className="w-6 rounded-t bg-blue-400"
                style={{ height: `${data.applied * 20}px` }}
                title={`Applied: ${data.applied}`}
              ></div>
              {/* Shortlisted */}
              <div
                className="w-6 rounded-t bg-yellow-400 mt-1"
                style={{ height: `${data.shortlisted * 20}px` }}
                title={`Shortlisted: ${data.shortlisted}`}
              ></div>
              {/* Selected */}
              <div
                className="w-6 rounded-t bg-green-400 mt-1"
                style={{ height: `${data.selected * 20}px` }}
                title={`Selected: ${data.selected}`}
              ></div>
              <div className="text-xs text-blue-700 mt-2">{data.month}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-2 text-xs text-gray-500">
          <span className="flex items-center mr-4">
            <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-1"></span>Applied
          </span>
          <span className="flex items-center mr-4">
            <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-1"></span>Shortlisted
          </span>
          <span className="flex items-center">
            <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-1"></span>Selected
          </span>
        </div>
      </div>
    </div>

    {/* Recent Placement Updates */}
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-blue-700 mb-4">Recent Placement Updates</h3>
      <ul className="divide-y divide-blue-50">
        {updates.map((update, idx) => (
          <li key={idx} className="py-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-600">{update.title}</span>
              <span className="text-xs text-gray-400">{update.date}</span>
            </div>
            <div className="text-sm text-gray-600">{update.desc}</div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default PlacementStats;