import React from 'react'
import StatCard from '../../components/StatCard'

const stats = [
  { label: 'Applied Jobs', value: 12, color: 'blue' },
  { label: 'Selected', value: 3, color: 'green' },
  { label: 'Pending', value: 5, color: 'yellow' },
  { label: 'Rejected', value: 4, color: 'red' },
]

const recentApplications = [
  { company: 'TechCorp', role: 'Frontend Developer', status: 'Pending', date: '2024-05-01' },
  { company: 'DataSoft', role: 'Backend Engineer', status: 'Selected', date: '2024-04-28' },
  { company: 'Designify', role: 'UI/UX Designer', status: 'Rejected', date: '2024-04-25' },
  { company: 'QualityHub', role: 'QA Tester', status: 'Pending', date: '2024-04-20' },
  { company: 'CloudNet', role: 'DevOps Engineer', status: 'Selected', date: '2024-04-15' },
]

const statusColors = {
  Selected: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Rejected: 'bg-red-100 text-red-600',
}

const StudentDashboard = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
    {/* Welcome Section */}
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-2 tracking-tight">
        Welcome, <span className="text-blue-500">Student Name</span>!
      </h1>
      <p className="text-gray-600 text-lg">Here’s an overview of your placement activity.</p>
    </div>

    {/* Statistics Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          title={stat.label}
          count={stat.value}
          color={stat.color}
        />
      ))}
    </div>

    {/* Recent Applications Table */}
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl md:text-2xl font-semibold text-blue-700 mb-4">Recent Applications</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="py-3 px-4 text-gray-600 font-semibold">Company</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">Role</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">Status</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">Applied Date</th>
            </tr>
          </thead>
          <tbody>
            {recentApplications.map((app, idx) => (
              <tr key={idx} className="border-t hover:bg-blue-50 transition">
                <td className="py-3 px-4">{app.company}</td>
                <td className="py-3 px-4">{app.role}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[app.status]}`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-3 px-4">{app.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)

export default StudentDashboard