import React from 'react';
import { useAuth } from '../../services/AuthContext';
import { usePlacement } from '../../services/PlacementContext';

const logStyles = {
  success: 'bg-green-50 text-green-700 border-green-100',
  info: 'bg-blue-50 text-blue-700 border-blue-100',
  danger: 'bg-red-50 text-red-700 border-red-100'
};

const AdminDashboard = () => {
  const { user, users } = useAuth();
  const { drives, applications } = usePlacement();

  const getPackageNum = (pStr) => {
    if (!pStr) return 0;
    const match = pStr.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Recently';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Dynamic calculations from context drives
  const totalDrives = drives.length;
  const placedCandidates = applications.filter(a => a.status === 'Selected');
  const totalSelected = placedCandidates.length;
  const totalShortlisted = applications.filter(a => a.status === 'Shortlisted').length;
  
  const totalStudentsCount = users.filter(u => u.role === 'student').length;
  const placementRate = totalStudentsCount > 0
    ? Math.round((totalSelected / totalStudentsCount) * 100)
    : 0;

  const highestPackageVal = placedCandidates.length
    ? placedCandidates.reduce((max, a) => {
        const pkgVal = getPackageNum(a.package);
        return pkgVal > max ? pkgVal : max;
      }, 0)
    : 0;

  const averagePackageVal = placedCandidates.length 
    ? (placedCandidates.reduce((sum, a) => sum + getPackageNum(a.package), 0) / placedCandidates.length).toFixed(1)
    : 0;

  // Dynamic YoY placement performance data
  const yoyData = [
    { year: '2024', rate: 70, avgPackage: '₹6.8 LPA', color: 'bg-slate-400' },
    { year: '2025', rate: 75, avgPackage: '₹7.4 LPA', color: 'bg-indigo-400' },
    { year: '2026 (Current)', rate: placementRate, avgPackage: parseFloat(averagePackageVal) > 0 ? `₹${averagePackageVal} LPA` : '-', color: 'bg-blue-600' },
  ];

  // Dynamic Audit logs from context
  const getAuditLogs = () => {
    const logs = [];
    
    // Placed candidates
    placedCandidates.forEach(a => {
      logs.push({
        action: `Student ${a.studentName} Selected`,
        target: `${a.company} Drive`,
        date: formatDate(a.date),
        type: 'success',
        timestamp: new Date(a.date).getTime() || 0
      });
    });

    // Shortlisted candidates
    applications.filter(a => a.status === 'Shortlisted').forEach(a => {
      logs.push({
        action: `Student ${a.studentName} Shortlisted`,
        target: `${a.company} Drive`,
        date: formatDate(a.date),
        type: 'info',
        timestamp: new Date(a.date).getTime() || 0
      });
    });

    // Drives posted
    drives.forEach(d => {
      logs.push({
        action: `Approved ${d.company} Placement Drive`,
        target: `TPO Coordinator`,
        date: formatTimestamp(d.id),
        type: 'info',
        timestamp: d.id || 0
      });
    });

    if (logs.length === 0) {
      return [
        { action: 'Placement portal initialized successfully', target: 'System Admin', date: 'Just now', type: 'success' }
      ];
    }

    return logs.sort((x, y) => y.timestamp - x.timestamp).slice(0, 5);
  };

  const auditLogs = getAuditLogs();

  // Dynamic department selection stats calculation
  const departmentsList = [
    { name: 'CSE', fullName: 'Computer Science (CSE)', color: 'bg-blue-600' },
    { name: 'IT', fullName: 'Information Technology (IT)', color: 'bg-indigo-600' },
    { name: 'ECE', fullName: 'Electronics & Comm (ECE)', color: 'bg-purple-600' },
    { name: 'EEE', fullName: 'Electrical & Electronics (EEE)', color: 'bg-pink-600' }
  ];

  const departmentStats = departmentsList.map(dept => {
    const deptUsers = users.filter(u => u.role === 'student' && u.department.toUpperCase() === dept.name);
    const total = deptUsers.length;
    
    // Find placed students who belong to this department
    const deptEmails = deptUsers.map(u => u.email.toLowerCase());
    const placed = applications.filter(app => app.status === 'Selected' && deptEmails.includes(app.studentEmail.toLowerCase())).length;
    
    const rate = total > 0 ? Math.round((placed / total) * 100) : 0;
    
    return {
      name: dept.fullName,
      rate,
      placed,
      total,
      color: dept.color
    };
  });

  // Dynamic Salary Tier calculations
  const dreamDrives = drives.filter(d => getPackageNum(d.package) > 10).length;
  const superDreamDrives = drives.filter(d => {
    const pkg = getPackageNum(d.package);
    return pkg >= 6 && pkg <= 10;
  }).length;
  const regularDrives = drives.filter(d => getPackageNum(d.package) < 6).length;

  const totalTierDrives = dreamDrives + superDreamDrives + regularDrives || 1;
  const dreamPct = Math.round((dreamDrives / totalTierDrives) * 100);
  const superDreamPct = Math.round((superDreamDrives / totalTierDrives) * 100);
  const regularPct = Math.max(0, 100 - dreamPct - superDreamPct);

  // SVG circular calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (placementRate / 100) * circumference;

  const statCards = [
    { label: 'Campus Recruiters Visited', value: totalDrives, detail: 'Active & upcoming drives', color: 'border-l-4 border-blue-600 bg-white' },
    { label: 'Total Placed Candidates', value: totalSelected, detail: 'Selected students', color: 'border-l-4 border-green-600 bg-white' },
    { label: 'Highest Package', value: highestPackageVal > 0 ? `₹${highestPackageVal} LPA` : '-', detail: 'Max package offered', color: 'border-l-4 border-amber-500 bg-white' },
    { label: 'Average CTC Package', value: parseFloat(averagePackageVal) > 0 ? `₹${averagePackageVal} LPA` : '-', detail: 'Batch average CTC', color: 'border-l-4 border-purple-600 bg-white' }
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Block */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">
            Principal's Executive Dashboard
          </h1>
          <p className="text-slate-500 mt-1.5 text-base">
            Institutional placement performance insights reviewed by <span className="font-semibold text-blue-600">{user.name}</span>.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-blue-800 text-sm font-semibold flex items-center gap-2 self-start md:self-auto">
          <span>🏛️</span> College Portal Active
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className={`p-5 rounded-xl shadow-sm border border-slate-100 ${stat.color} flex flex-col justify-between h-28 hover:shadow-md transition`}>
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
              <span className="text-[11px] text-slate-500 font-medium">{stat.detail}</span>
            </div>
            <span className="text-3xl font-extrabold text-slate-800">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Radial gauge and YoY comparisons */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Placement Benchmark</h3>
            <p className="text-xs text-slate-400 mb-4">Overall institutional selection rate for current year.</p>
            
            {/* SVG Circular Progress Gauge */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background track circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-slate-100 fill-none"
                    strokeWidth="10"
                  />
                  {/* Active progress circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-blue-600 fill-none transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-slate-800">{placementRate}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placed</span>
                </div>
              </div>
            </div>
          </div>

          {/* YoY comparison layout */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Year-over-Year Placement</h4>
            <div className="space-y-2.5">
              {yoyData.map((data, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-650">
                    <span>{data.year}</span>
                    <span className="font-bold text-slate-800">{data.rate}% (Avg: {data.avgPackage})</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`${data.color} h-full rounded-full`}
                      style={{ width: `${data.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department placement rates list */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6 lg:col-span-2">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Placement Rate by Department</h3>
            <p className="text-xs text-slate-400">Current batch selection rates percentage and ratio.</p>
          </div>
          <div className="space-y-5">
            {departmentStats.map((dept, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{dept.name}</span>
                  <span className="font-bold text-slate-900">{dept.rate}% ({dept.placed}/{dept.total})</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`${dept.color} h-full rounded-full transition-all duration-1000`} 
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Segmented Salary Range distribution bar chart */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Salary CTC Tier Distribution</h4>
              <p className="text-[10px] text-slate-400">CTC tier segregation of active drives.</p>
            </div>
            
            {/* Segmented Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner">
              <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${dreamPct}%` }} title={`Dream Tier (>10 LPA): ${dreamPct}%`}></div>
              <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${superDreamPct}%` }} title={`Super Dream (6-10 LPA): ${superDreamPct}%`}></div>
              <div className="bg-slate-350 h-full transition-all duration-500" style={{ width: `${regularPct}%` }} title={`Regular (<6 LPA): ${regularPct}%`}></div>
            </div>

            {/* Color keys legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Dream Tier (&gt;10 LPA) - {dreamPct}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Super Dream (6-10 LPA) - {superDreamPct}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-350"></span> Regular Tier (&lt;6 LPA) - {regularPct}%
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Selected Student Star Roll */}
      {placedCandidates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">🎉 Placement Star Selections</h3>
            <p className="text-xs text-slate-400">Recently placed candidates who secured selections across ongoing drives.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {placedCandidates.map((student) => (
              <div 
                key={student.id}
                className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-xs text-green-700">
                      {student.studentName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 leading-tight">{student.studentName}</h4>
                      <span className="text-[10px] font-semibold text-slate-400">{student.studentEmail.split('@')[0]}</span>
                    </div>
                  </div>
                  <div className="text-xs space-y-0.5 pt-1 text-slate-650">
                    <div><span className="font-semibold text-slate-500">Company:</span> <span className="font-bold text-slate-800">{student.company}</span></div>
                    <div><span className="font-semibold text-slate-500">Role:</span> {student.role}</div>
                    <div><span className="font-semibold text-slate-500">Package:</span> <span className="text-green-700 font-bold">{student.package}</span></div>
                  </div>
                </div>
                <div className="mt-3 bg-green-50 border border-green-100 text-green-700 text-[10px] font-bold py-1 px-2.5 rounded-lg text-center">
                  🎓 Placed Candidate
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Placement Activity Audits</h3>
        <div className="space-y-3">
          {auditLogs.map((log, idx) => (
            <div key={idx} className={`p-3.5 border rounded-lg flex items-center justify-between text-sm ${logStyles[log.type]}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-bold">{log.action}</span>
                <span className="text-xs opacity-75">Triggered by: {log.target}</span>
              </div>
              <span className="text-xs opacity-75 font-mono">{log.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;