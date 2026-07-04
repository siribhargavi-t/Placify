import React from 'react';
import { useAuth } from '../../services/AuthContext';
import { usePlacement } from '../../services/PlacementContext';
import StatCard from '../../components/StatCard';

const statusColors = {
  Selected: 'bg-green-100 text-green-700',
  Shortlisted: 'bg-purple-100 text-purple-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Rejected: 'bg-red-100 text-red-600',
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { applications } = usePlacement();

  // Filter applications specifically for the logged-in student
  const studentApps = user 
    ? applications.filter(app => app.studentEmail.toLowerCase() === user.email.toLowerCase())
    : [];

  const appliedCount = studentApps.length;
  const selectedCount = studentApps.filter(app => app.status === 'Selected').length;
  const pendingCount = studentApps.filter(app => app.status === 'Pending').length;
  const rejectedCount = studentApps.filter(app => app.status === 'Rejected').length;

  const stats = [
    { label: 'Applied Drives', value: appliedCount, color: 'blue' },
    { label: 'Selected Status', value: selectedCount, color: 'green' },
    { label: 'Pending Reviews', value: pendingCount, color: 'yellow' },
    { label: 'Rejected Status', value: rejectedCount, color: 'red' },
  ];

  // Get the most recent 5 applications
  const recentApps = studentApps.slice(0, 5);

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1.5 tracking-tight">
          Welcome back, <span className="text-blue-600">{user?.name || 'Student'}</span>!
        </h1>
        <p className="text-slate-500 text-sm">
          Tracking branch code: <span className="font-semibold text-slate-700">{user?.department || 'CSE'}</span> | CGPA: <span className="font-semibold text-slate-700">{user?.cgpa || '7.8'}</span>
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            count={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Placement Drive Applications</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 text-slate-500 font-semibold">Company</th>
                  <th className="py-3 px-4 text-slate-500 font-semibold">Role</th>
                  <th className="py-3 px-4 text-slate-500 font-semibold">Status</th>
                  <th className="py-3 px-4 text-slate-500 font-semibold">Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      You haven't applied to any placement drives yet.
                    </td>
                  </tr>
                ) : (
                  recentApps.map((app) => (
                    <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-850">{app.company}</td>
                      <td className="py-3.5 px-4 text-slate-650">{app.role}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[app.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{app.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Readiness Checklist card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Portfolio Checklist</h3>
            <p className="text-xs text-slate-400 mb-5">Keep your details updated for company recruitment review.</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${user?.phone ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {user?.phone ? '✓' : '!'}
                </span>
                <div>
                  <span className="text-sm font-semibold text-slate-700 block leading-tight">Phone Number</span>
                  <span className="text-[11px] text-slate-400">{user?.phone ? user.phone : 'Not provided yet'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${user?.resumeUrl ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {user?.resumeUrl ? '✓' : '!'}
                </span>
                <div>
                  <span className="text-sm font-semibold text-slate-700 block leading-tight">Resume PDF Link</span>
                  <span className="text-[11px] text-slate-400">{user?.resumeUrl ? 'Connected' : 'Missing resume URL link'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${user?.githubUrl || user?.linkedinUrl ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {user?.githubUrl || user?.linkedinUrl ? '✓' : '!'}
                </span>
                <div>
                  <span className="text-sm font-semibold text-slate-700 block leading-tight">Social Profiles</span>
                  <span className="text-[11px] text-slate-400">{user?.githubUrl || user?.linkedinUrl ? 'Portfolio links set' : 'Add LinkedIn/GitHub link'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl mt-6 text-[11px] text-slate-650 leading-relaxed">
            💡 **Pro Tip**: Make sure to check the **Placement Drives** tab daily to see matching eligible openings and apply before their registration deadlines!
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;