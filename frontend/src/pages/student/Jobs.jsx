import React from 'react'

const drives = [
  {
    company: 'TechCorp',
    role: 'Software Engineer',
    package: '₹9 LPA',
    cgpa: '7.0+',
    departments: 'CSE, IT',
    deadline: '2024-05-20',
    location: 'On Campus',
    status: 'Open',
  },
  {
    company: 'DataSoft',
    role: 'Data Analyst',
    package: '₹8 LPA',
    cgpa: '6.5+',
    departments: 'CSE, ECE, EEE',
    deadline: '2024-05-15',
    location: 'Virtual',
    status: 'Closed',
  },
  {
    company: 'Designify',
    role: 'UI/UX Designer',
    package: '₹7.5 LPA',
    cgpa: '6.0+',
    departments: 'All',
    deadline: '2024-05-25',
    location: 'On Campus',
    status: 'Upcoming',
  },
  {
    company: 'CloudNet',
    role: 'DevOps Engineer',
    package: '₹12 LPA',
    cgpa: '7.5+',
    departments: 'CSE, IT, ECE',
    deadline: '2024-05-22',
    location: 'On Campus',
    status: 'Open',
  },
  {
    company: 'QualityHub',
    role: 'QA Tester',
    package: '₹6.5 LPA',
    cgpa: '6.0+',
    departments: 'CSE, IT, BCA',
    deadline: '2024-05-18',
    location: 'Virtual',
    status: 'Closed',
  },
]

const statusStyles = {
  Open: 'bg-green-100 text-green-700',
  Closed: 'bg-red-100 text-red-600',
  Upcoming: 'bg-yellow-100 text-yellow-700',
}

const Jobs = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
    <h1 className="text-4xl font-extrabold text-blue-800 mb-8 tracking-tight text-center">
      Placement Drives
    </h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {drives.map((drive, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 border-t-4 border-blue-500 hover:shadow-2xl hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-xl font-bold text-blue-700">{drive.company}</div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[drive.status]}`}>
              {drive.status}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-800">{drive.role}</div>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {drive.package}
            </span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {drive.location}
            </span>
          </div>
          <div className="mt-2 text-gray-600 text-sm">
            <span className="font-semibold">Eligibility CGPA:</span> {drive.cgpa}
          </div>
          <div className="text-gray-600 text-sm">
            <span className="font-semibold">Departments:</span> {drive.departments}
          </div>
          <div className="text-gray-600 text-sm">
            <span className="font-semibold">Deadline:</span> {drive.deadline}
          </div>
          <button
            className={`mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition
              ${drive.status !== 'Open' ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={drive.status !== 'Open'}
          >
            Apply
          </button>
        </div>
      ))}
    </div>
  </div>
)

export default Jobs