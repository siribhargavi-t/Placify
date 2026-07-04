import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { usePlacement } from '../../services/PlacementContext';

const statusColors = {
  Applied: 'bg-blue-100 text-blue-700 border-blue-200',
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Shortlisted: 'bg-purple-100 text-purple-700 border-purple-200',
  Selected: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-600 border-red-200',
};

const AppliedJobs = () => {
  const { user } = useAuth();
  const { applications } = usePlacement();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  // Track which application rows are expanded to view timeline steppers
  const [expandedId, setExpandedId] = useState(null);

  // Filter application list
  const studentApps = user 
    ? applications.filter(app => app.studentEmail.toLowerCase() === user.email.toLowerCase())
    : [];

  const filteredDrives = studentApps.filter(app => {
    const matchesSearch =
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.role.toLowerCase().includes(search.toLowerCase());
    
    // Support matching both "Applied" and "Pending" since they represent initial states
    const statusToCheck = app.status;
    const matchesFilter = filter === 'All' || 
      (filter === 'Applied' && (statusToCheck === 'Applied' || statusToCheck === 'Pending')) || 
      statusToCheck === filter;
      
    return matchesSearch && matchesFilter;
  });

  const toggleRow = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Stepper timeline step logic generator for 5 stages
  const getTimelineSteps = (status) => {
    const steps = [
      { label: 'Applied', desc: 'Application submitted', status: 'complete' },
      { label: 'Aptitude Test', desc: 'Written/online assessment', status: 'pending' },
      { label: 'Technical Interview', desc: 'Vetting of core skills', status: 'pending' },
      { label: 'HR Interview', desc: 'Cultural & compensation round', status: 'pending' },
      { label: 'Final Verdict', desc: 'Job offer decision', status: 'pending' }
    ];

    if (status === 'Rejected') {
      steps[0].status = 'complete';
      steps[1].status = 'complete';
      steps[2].status = 'complete';
      steps[3].status = 'complete';
      steps[4].status = 'complete-fail';
    } else if (status === 'Selected') {
      steps[0].status = 'complete';
      steps[1].status = 'complete';
      steps[2].status = 'complete';
      steps[3].status = 'complete';
      steps[4].status = 'complete-success';
    } else {
      // Active states: Applied, Pending, Aptitude Test, Technical Interview, HR Interview
      const activeStageIdx = 
        status === 'Applied' || status === 'Pending' ? 0 : 
        status === 'Aptitude Test' ? 1 : 
        status === 'Technical Interview' ? 2 : 
        status === 'HR Interview' ? 3 : 0;
      
      for (let i = 0; i <= activeStageIdx; i++) {
        if (i === activeStageIdx) {
          steps[i].status = 'active';
        } else {
          steps[i].status = 'complete';
        }
      }
    }

    return steps;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">
          Applied Placement Drives
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Monitor selection pipelines and interactive application timelines.</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by company or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full sm:w-48 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
        >
          <option value="All">All Statuses</option>
          <option value="Applied">Applied / Pending / Tests</option>
          <option value="Shortlisted">Shortlisted (In Interviews)</option>
          <option value="Selected">Selected / Placed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrives.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No active applications matching criteria.
                  </td>
                </tr>
              ) : (
                filteredDrives.map((drive) => {
                  const isExpanded = expandedId === drive.id;
                  const steps = getTimelineSteps(drive.status);
                  
                  return (
                    <React.Fragment key={drive.id}>
                      {/* Interactive Header Row */}
                      <tr 
                        onClick={() => toggleRow(drive.id)}
                        className={`border-b border-slate-50 hover:bg-slate-50/50 transition cursor-pointer ${isExpanded ? 'bg-slate-50/30' : ''}`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-800">{drive.company}</td>
                        <td className="py-3.5 px-4 text-slate-650">{drive.role}</td>
                        <td className="py-3.5 px-4 font-semibold text-blue-700">{drive.package}</td>
                        <td className="py-3.5 px-4 text-slate-500">{drive.date}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[drive.status] || 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                            {drive.status === 'Pending' ? 'Applied' : drive.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs font-bold text-blue-600">
                          {isExpanded ? 'Collapse ▴' : 'Track Status ▾'}
                        </td>
                      </tr>
                      
                      {/* Expandable Timeline Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="py-5 px-6 bg-slate-50/30 border-b border-slate-100">
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-2 max-w-4xl mx-auto py-2">
                                {steps.map((step, idx) => (
                                  <div key={idx} className="flex flex-col items-center flex-1 relative w-full text-center">
                                    {/* Stepper Node Line connector */}
                                    {idx > 0 && (
                                      <div className="hidden sm:block absolute top-4 right-1/2 w-full h-0.5 bg-slate-200 -z-10 translate-x-[-12px]">
                                        <div className={`h-full ${
                                          steps[idx - 1].status === 'complete' || steps[idx - 1].status === 'complete-success'
                                            ? 'bg-green-500' 
                                            : steps[idx - 1].status === 'complete-fail' 
                                            ? 'bg-red-500' 
                                            : 'bg-slate-200'
                                        }`} />
                                      </div>
                                    )}
                                    
                                    {/* Node Icons */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border-2 ${
                                      step.status === 'complete' 
                                        ? 'bg-green-50 text-green-700 border-green-300'
                                        : step.status === 'complete-success'
                                        ? 'bg-green-500 text-white border-green-500'
                                        : step.status === 'complete-fail'
                                        ? 'bg-red-500 text-white border-red-500'
                                        : step.status === 'active'
                                        ? 'bg-blue-100 text-blue-700 border-blue-400 animate-pulse'
                                        : 'bg-white text-slate-350 border-slate-200 text-slate-400'
                                    }`}>
                                      {step.status === 'complete' || step.status === 'complete-success' ? '✓' : step.status === 'complete-fail' ? '✕' : idx + 1}
                                    </div>

                                    {/* Node details */}
                                    <div className="mt-2">
                                      <span className="block text-xs font-bold text-slate-700 leading-tight">{step.label}</span>
                                      <span className="block text-[10px] text-slate-400 leading-normal">{step.desc}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* TPO Rejection/Feedback Remarks Banner */}
                              {drive.feedback && (
                                <div className={`max-w-2xl mx-auto p-3.5 rounded-xl border text-xs flex gap-3 items-center ${
                                  drive.status === 'Rejected'
                                    ? 'bg-red-50 border-red-200 text-red-800'
                                    : 'bg-blue-50 border-blue-200 text-blue-800'
                                }`}>
                                  <span className="text-xl">{drive.status === 'Rejected' ? '📢' : '💡'}</span>
                                  <div className="text-left">
                                    <h5 className="font-bold text-slate-800">
                                      {drive.status === 'Rejected' ? 'TPO Rejection Feedback' : 'TPO Remarks'}
                                    </h5>
                                    <p className="mt-0.5 opacity-90 leading-relaxed">{drive.feedback}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

export default AppliedJobs;