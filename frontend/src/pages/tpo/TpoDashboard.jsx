import React from 'react';
import { useAuth } from '../../services/AuthContext';
import { usePlacement } from '../../services/PlacementContext';

const statusStyles = {
  Selected: 'bg-green-100 text-green-700 font-semibold',
  Shortlisted: 'bg-purple-100 text-purple-700 font-semibold',
  Pending: 'bg-yellow-100 text-yellow-700 font-semibold',
  Rejected: 'bg-red-100 text-red-600 font-semibold'
};

const TpoDashboard = () => {
  const { user, users } = useAuth();
  const { drives, applications } = usePlacement();

  const activeDrivesCount = drives.filter(d => d.status === 'Open').length;
  const totalApplicantsCount = applications.length;
  const shortlistedCount = applications.filter(app => app.status === 'Shortlisted').length;
  const selectedCount = applications.filter(app => app.status === 'Selected').length;

  const statCards = [
    { label: 'Active Placement Drives', value: activeDrivesCount, color: 'border-l-4 border-blue-600 bg-white' },
    { label: 'Total Applicants Received', value: totalApplicantsCount, color: 'border-l-4 border-yellow-500 bg-white' },
    { label: 'Shortlisted Candidates', value: shortlistedCount, color: 'border-l-4 border-purple-600 bg-white' },
    { label: 'Selected Profiles', value: selectedCount, color: 'border-l-4 border-green-600 bg-white' }
  ];

  // Get the most recent 5 submissions
  const recentSubmissions = applications.slice(0, 5);

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Block */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">
          Welcome back, <span className="text-blue-600">{user.name}</span>!
        </h1>
        <p className="text-slate-500 mt-1.5 text-base">
          Here is a live overview of applications and placement drives at the Training & Placement Office (TPO).
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-xl shadow-sm border border-slate-100 ${stat.color} flex flex-col justify-between h-28 hover:shadow-md transition`}>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
            <span className="text-3xl font-extrabold text-slate-800">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Candidate Submissions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-4 text-slate-500 font-semibold">Candidate Name</th>
                <th className="py-3 px-4 text-slate-500 font-semibold">Applied Role</th>
                <th className="py-3 px-4 text-slate-500 font-semibold">Company</th>
                <th className="py-3 px-4 text-slate-500 font-semibold">CGPA</th>
                <th className="py-3 px-4 text-slate-500 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No applicants submitted yet.
                  </td>
                </tr>
              ) : (
                recentSubmissions.map((sub) => {
                  const candidateUser = users.find(u => u.email.toLowerCase() === sub.studentEmail.toLowerCase());
                  const studentCgpa = candidateUser?.cgpa !== undefined ? candidateUser.cgpa : sub.cgpa;
                  return (
                    <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        <div>
                          <div className="font-semibold text-slate-800">{sub.studentName}</div>
                          <div className="text-xs text-slate-400">{sub.studentEmail}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{sub.role}</td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">{sub.company}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{studentCgpa}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs ${statusStyles[sub.status]}`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TpoDashboard;
