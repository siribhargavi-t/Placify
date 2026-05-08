import React from 'react'

const stats = [
  { label: 'Applied Jobs', value: 12 },
  { label: 'Selected', value: 3 },
  { label: 'Pending', value: 5 },
  { label: 'Rejected', value: 4 },
]

const recentApplications = [
  { job: 'Frontend Developer', company: 'TechCorp', status: 'Pending', date: '2024-05-01' },
  { job: 'Backend Engineer', company: 'DataSoft', status: 'Selected', date: '2024-04-28' },
  { job: 'UI/UX Designer', company: 'Designify', status: 'Rejected', date: '2024-04-25' },
  { job: 'QA Tester', company: 'QualityHub', status: 'Pending', date: '2024-04-20' },
]

const statusColors = {
  Selected: 'text-green-600 bg-green-100',
  Pending: 'text-yellow-700 bg-yellow-100',
  Rejected: 'text-red-600 bg-red-100',
}

const StudentDashboard = () => (
  <div className="p-4 md:p-8">
    {/* Welcome Section */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">Welcome, Student Name!</h1>
      <p className="text-gray-600">Here’s an overview of your placement activity.</p>
    </div>

    {/* Statistics Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border-t-4 border-blue-600"
        >
          <div className="text-3xl font-bold text-blue-700 mb-2">{stat.value}</div>
          <div className="text-gray-600 font-medium">{stat.label}</div>
        </div>
      ))}
    </div>

    {/* Recent Applications Table */}
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Recent Job Applications</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4 text-gray-600 font-semibold">Job Title</th>
              <th className="py-2 px-4 text-gray-600 font-semibold">Company</th>
              <th className="py-2 px-4 text-gray-600 font-semibold">Status</th>
              <th className="py-2 px-4 text-gray-600 font-semibold">Applied On</th>
            </tr>
          </thead>
          <tbody>
            {recentApplications.map((app, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2 px-4">{app.job}</td>
                <td className="py-2 px-4">{app.company}</td>
                <td className="py-2 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[app.status]}`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-2 px-4">{app.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)

export default StudentDashboard