import React, { useState } from 'react'

const dummyDrives = [
  {
    company: 'TechCorp',
    role: 'Software Engineer',
    package: '₹9 LPA',
    date: '2024-05-01',
    status: 'Applied',
  },
  {
    company: 'DataSoft',
    role: 'Data Analyst',
    package: '₹8 LPA',
    date: '2024-05-03',
    status: 'Shortlisted',
  },
  {
    company: 'Designify',
    role: 'UI/UX Designer',
    package: '₹7.5 LPA',
    date: '2024-05-05',
    status: 'Interview Scheduled',
  },
  {
    company: 'CloudNet',
    role: 'DevOps Engineer',
    package: '₹12 LPA',
    date: '2024-05-07',
    status: 'Selected',
  },
  {
    company: 'QualityHub',
    role: 'QA Tester',
    package: '₹6.5 LPA',
    date: '2024-05-09',
    status: 'Rejected',
  },
]

const statusColors = {
  Applied: 'bg-blue-100 text-blue-700',
  Shortlisted: 'bg-yellow-100 text-yellow-700',
  'Interview Scheduled': 'bg-purple-100 text-purple-700',
  Selected: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-600',
}

const AppliedDrives = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filteredDrives = dummyDrives.filter(drive => {
    const matchesSearch =
      drive.company.toLowerCase().includes(search.toLowerCase()) ||
      drive.role.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || drive.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-8 tracking-tight">
        Applied Placement Drives
      </h1>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by company or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full md:w-48 px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="All">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Interview Scheduled">Interview Scheduled</option>
          <option value="Selected">Selected</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="py-3 px-4 text-gray-600 font-semibold">Company</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">Role</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">Package</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">Application Date</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrives.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">
                  No records found.
                </td>
              </tr>
            ) : (
              filteredDrives.map((drive, idx) => (
                <tr key={idx} className="border-t hover:bg-blue-50 transition">
                  <td className="py-3 px-4">{drive.company}</td>
                  <td className="py-3 px-4">{drive.role}</td>
                  <td className="py-3 px-4">{drive.package}</td>
                  <td className="py-3 px-4">{drive.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[drive.status]}`}>
                      {drive.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AppliedDrives