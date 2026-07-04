import React from 'react';
import { useAuth } from '../../services/AuthContext';
import { usePlacement } from '../../services/PlacementContext';

const Reports = () => {
  const { users } = useAuth();
  const { drives, applications } = usePlacement();

  const generateFinalSelectionCSV = () => {
    const placed = applications.filter(app => app.status === 'Selected');
    const headers = ['Student Name', 'Student Email', 'Department', 'CGPA', 'Selected Company', 'Selected Role', 'Package CTC', 'Selection Date'];
    const rows = placed.map(app => {
      const candidateUser = users.find(u => u.email.toLowerCase() === app.studentEmail.toLowerCase());
      const dept = candidateUser?.department || 'CSE';
      return [
        `"${app.studentName}"`,
        `"${app.studentEmail}"`,
        `"${dept}"`,
        app.cgpa,
        `"${app.company}"`,
        `"${app.role}"`,
        `"${app.package}"`,
        `"${app.date}"`
      ];
    });
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const generateDeptStatsCSV = () => {
    const departments = ['CSE', 'IT', 'ECE', 'EEE', 'CE', 'ME'];
    const headers = ['Department', 'Total Registered Students', 'Total Applications Submitted', 'Selected Count', 'Placement Selection Rate (%)'];
    
    const rows = departments.map(dept => {
      const deptUsers = users.filter(u => u.role === 'student' && u.department === dept);
      const totalStudents = deptUsers.length;
      
      const deptEmails = deptUsers.map(u => u.email.toLowerCase());
      const appliedCount = applications.filter(app => deptEmails.includes(app.studentEmail.toLowerCase())).length;
      const placedCount = applications.filter(app => app.status === 'Selected' && deptEmails.includes(app.studentEmail.toLowerCase())).length;
      
      const placementRate = totalStudents > 0 ? ((placedCount / totalStudents) * 100).toFixed(1) : '0.0';
      
      return [
        `"${dept}"`,
        totalStudents,
        appliedCount,
        placedCount,
        `"${placementRate}%"`
      ];
    });
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const generateRecruiterFeedbackCSV = () => {
    const headers = ['Recruiter Company', 'Job Role', 'Package Offered', 'Drive Location', 'Target Departments', 'Registration Deadline', 'Drive Status', 'Total Applications', 'Shortlisted Candidates', 'Selected Candidates'];
    const rows = drives.map(drive => {
      const driveApps = applications.filter(app => app.driveId === drive.id);
      const totalApps = driveApps.length;
      const shortlisted = driveApps.filter(app => app.status === 'Shortlisted').length;
      const selected = driveApps.filter(app => app.status === 'Selected').length;
      return [
        `"${drive.company}"`,
        `"${drive.role}"`,
        `"${drive.package}"`,
        `"${drive.location}"`,
        `"${drive.departments}"`,
        `"${drive.deadline}"`,
        `"${drive.status}"`,
        totalApps,
        shortlisted,
        selected
      ];
    });
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const generateEligibilityMatrixCSV = () => {
    const students = users.filter(u => u.role === 'student');
    const headers = ['Student Name', 'Email Address', 'Phone', 'Department', 'Graduation Year', 'CGPA', 'Skills', 'Eligibility Status', 'Applications Submitted', 'Selection Status'];
    const rows = students.map(u => {
      const studentApps = applications.filter(app => app.studentEmail.toLowerCase() === u.email.toLowerCase());
      const placed = studentApps.some(app => app.status === 'Selected');
      const isEligible = u.cgpa >= 7.0;
      
      return [
        `"${u.name}"`,
        `"${u.email}"`,
        `"${u.phone || '-'}"`,
        `"${u.department || 'CSE'}"`,
        `"${u.graduationYear || '2025'}"`,
        u.cgpa || 7.5,
        `"${u.skills || '-'}"`,
        `"${isEligible ? 'Eligible' : 'Ineligible (<7.0 CGPA)'}"`,
        studentApps.length,
        `"${placed ? 'Placed' : studentApps.length > 0 ? 'In Progress' : 'Not Applied'}"`
      ];
    });
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const handleDownloadReport = (reportId, title) => {
    let csvContent = '';
    let fileName = title.toLowerCase().replace(/\s+/g, '_') + '_' + new Date().toISOString().split('T')[0] + '.csv';

    switch (reportId) {
      case 1:
        csvContent = generateFinalSelectionCSV();
        break;
      case 2:
        csvContent = generateDeptStatsCSV();
        break;
      case 3:
        csvContent = generateRecruiterFeedbackCSV();
        break;
      case 4:
        csvContent = generateEligibilityMatrixCSV();
        break;
      default:
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportsList = [
    { 
      id: 1, 
      title: '2026 Batch Final Selection Summary', 
      format: 'CSV', 
      date: new Date().toISOString().split('T')[0], 
      size: `${(generateFinalSelectionCSV().length / 1024).toFixed(2)} KB` 
    },
    { 
      id: 2, 
      title: 'Department Wise Selection Stats', 
      format: 'CSV', 
      date: new Date().toISOString().split('T')[0], 
      size: `${(generateDeptStatsCSV().length / 1024).toFixed(2)} KB` 
    },
    { 
      id: 3, 
      title: 'Recruiter Recruitment Feedback Log', 
      format: 'CSV', 
      date: new Date().toISOString().split('T')[0], 
      size: `${(generateRecruiterFeedbackCSV().length / 1024).toFixed(2)} KB` 
    },
    { 
      id: 4, 
      title: 'Student Placement Eligibility Matrix', 
      format: 'CSV', 
      date: new Date().toISOString().split('T')[0], 
      size: `${(generateEligibilityMatrixCSV().length / 1024).toFixed(2)} KB` 
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">System & Placement Reports</h1>
        <p className="text-slate-500 mt-1 text-sm">Download aggregated performance metrics, recruitment logs, and student selection results.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Exportable Datasets</h3>
        <div className="space-y-4">
          {reportsList.map((report) => (
            <div key={report.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between hover:bg-slate-50/50 transition">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📁</span>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">{report.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Format: {report.format} • Created: {report.date} • Size: {report.size}</p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadReport(report.id, report.title)}
                className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer"
              >
                Export Report
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;