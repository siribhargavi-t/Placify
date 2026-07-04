import React, { useState } from 'react';
import { usePlacement } from '../../services/PlacementContext';
import { useAuth } from '../../services/AuthContext';

const statusColors = {
  Selected: 'bg-green-100 text-green-700 font-semibold border border-green-200',
  Pending: 'bg-yellow-100 text-yellow-700 font-semibold border border-yellow-200',
  Applied: 'bg-blue-100 text-blue-700 font-semibold border border-blue-200',
  'Aptitude Test': 'bg-amber-100 text-amber-700 font-semibold border border-amber-200',
  'Technical Interview': 'bg-indigo-100 text-indigo-750 font-semibold border border-indigo-200',
  'HR Interview': 'bg-purple-100 text-purple-700 font-semibold border border-purple-200',
  Rejected: 'bg-red-100 text-red-655 font-semibold border border-red-200'
};

const MOCK_PROFILES = {};

const Applicants = () => {
  const { applications, drives, updateApplicationStatus } = usePlacement();
  const { users } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cgpaFilter, setCgpaFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Quick Email Match tool state
  const [isToolOpen, setIsToolOpen] = useState(false);
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkStatus, setBulkStatus] = useState('Aptitude Test');
  const [bulkDriveId, setBulkDriveId] = useState('All');
  const [bulkMsg, setBulkMsg] = useState({ text: '', type: '' });
  const [bulkRemarks, setBulkRemarks] = useState('');

  // Remarks Modal state
  const [remarksModal, setRemarksModal] = useState({
    isOpen: false,
    appId: null,
    newStatus: '',
    remarks: '',
    isRejection: false
  });

  // Candidate Details Modal state
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleOpenCandidateModal = async (app, studentCgpa) => {
    setSelectedCandidate({
      ...app,
      cgpa: studentCgpa,
      phone: 'Loading...',
      skills: 'Loading...',
      resumeUrl: '',
      githubUrl: '',
      linkedinUrl: '',
      loading: true
    });

    try {
      const token = localStorage.getItem('placify-token');
      const res = await fetch(`/api/users/email/${encodeURIComponent(app.studentEmail)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCandidate({
          ...app,
          phone: data.phone || 'N/A',
          skills: data.skills || 'N/A',
          resumeUrl: data.resumeUrl || '',
          resumeName: data.resumeName || 'resume.pdf',
          githubUrl: data.githubUrl || 'https://github.com',
          linkedinUrl: data.linkedinUrl || 'https://linkedin.com',
          cgpa: data.cgpa !== undefined ? data.cgpa : studentCgpa,
          loading: false
        });
      } else {
        setSelectedCandidate(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Failed to load candidate profile details:', err);
      setSelectedCandidate(prev => ({ ...prev, loading: false }));
    }
  };

  const filteredApplicants = applications.filter(app => {
    const searchString = search ? search.toLowerCase() : '';
    const matchesSearch = 
      (app.studentName && app.studentName.toLowerCase().includes(searchString)) || 
      (app.role && app.role.toLowerCase().includes(searchString)) ||
      (app.company && app.company.toLowerCase().includes(searchString));
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    
    // Find department from users list
    const studentEmailLower = app.studentEmail ? app.studentEmail.toLowerCase() : '';
    const candidateUser = users.find(u => u.email && u.email.toLowerCase() === studentEmailLower);
    const studentDept = candidateUser?.department || 'CSE';
    const matchesDept = deptFilter === 'All' || studentDept.toUpperCase() === deptFilter.toUpperCase();
    
    // Filter by Min CGPA requirement using student's current profile CGPA
    const studentCgpa = candidateUser?.cgpa !== undefined ? candidateUser.cgpa : (app.cgpa || 7.5);
    const matchesCgpa = !cgpaFilter || studentCgpa >= parseFloat(cgpaFilter);

    return matchesSearch && matchesStatus && matchesDept && matchesCgpa;
  });

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApplicants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplicants.map(app => app.id));
    }
  };

  const handleInitiateBulkStatusChange = (newStatus) => {
    if (selectedIds.length === 0) return;
    const isRejection = newStatus === 'Rejected';
    setRemarksModal({
      isOpen: true,
      appId: 'BULK',
      newStatus,
      remarks: '',
      isRejection
    });
  };

  const handleInitiateStatusChange = (appId, newStatus) => {
    const isRejection = newStatus === 'Rejected';
    setRemarksModal({
      isOpen: true,
      appId,
      newStatus,
      remarks: '',
      isRejection
    });
  };

  const handleConfirmStatusChange = () => {
    const { appId, newStatus, remarks, isRejection } = remarksModal;
    if (isRejection && !remarks.trim()) {
      alert("Please provide a rejection reason/feedback.");
      return;
    }

    if (appId === 'BULK') {
      selectedIds.forEach(id => {
        updateApplicationStatus(id, newStatus, remarks);
      });
      setSelectedIds([]);
    } else {
      updateApplicationStatus(appId, newStatus, remarks);
      if (selectedCandidate && selectedCandidate.id === appId) {
        setSelectedCandidate(prev => ({
          ...prev,
          status: newStatus,
          feedback: remarks
        }));
      }
    }

    setRemarksModal({
      isOpen: false,
      appId: null,
      newStatus: '',
      remarks: '',
      isRejection: false
    });
  };

  const handleEmailBulkUpdate = (e) => {
    e.preventDefault();
    if (!bulkEmails.trim()) return;

    const emails = bulkEmails
      .toLowerCase()
      .split(/[\s,;\n]+/)
      .map(e => e.trim())
      .filter(e => e.includes('@'));

    if (emails.length === 0) {
      setBulkMsg({ text: '⚠️ No valid email addresses found in the text box.', type: 'error' });
      return;
    }

    let updatedCount = 0;
    applications.forEach(app => {
      const emailMatches = emails.includes(app.studentEmail.toLowerCase());
      const driveMatches = bulkDriveId === 'All' || app.driveId === parseInt(bulkDriveId);

      if (emailMatches && driveMatches) {
        updateApplicationStatus(app.id, bulkStatus, bulkRemarks);
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      setBulkMsg({ 
        text: `🎉 Successfully updated status to "${bulkStatus}" for ${updatedCount} matching applicant(s)!`, 
        type: 'success' 
      });
      setBulkEmails('');
      setBulkRemarks('');
      setTimeout(() => setBulkMsg({ text: '', type: '' }), 5000);
    } else {
      setBulkMsg({ 
        text: '⚠️ No matching applications found for the entered emails and selected drive.', 
        type: 'error' 
      });
    }
  };

  const handleExportCSV = () => {
    const candidatesToExport = selectedIds.length > 0
      ? filteredApplicants.filter(app => selectedIds.includes(app.id))
      : filteredApplicants;

    if (candidatesToExport.length === 0) {
      alert("No candidates available to export.");
      return;
    }

    const headers = ['Candidate Name', 'Candidate Email', 'Applied Role', 'Company', 'CGPA', 'Status', 'Date Applied'];
    const rows = candidatesToExport.map(app => {
      const studentEmailLower = app.studentEmail ? app.studentEmail.toLowerCase() : '';
      const candidateUser = users.find(u => u.email && u.email.toLowerCase() === studentEmailLower);
      const studentCgpa = candidateUser?.cgpa !== undefined ? candidateUser.cgpa : (app.cgpa || 7.5);
      return [
        `"${app.studentName}"`,
        `"${app.studentEmail}"`,
        `"${app.role}"`,
        `"${app.company}"`,
        studentCgpa,
        `"${app.status}"`,
        `"${app.date}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `placify_applicants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };




  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Student Applicants</h1>
          <p className="text-slate-500 mt-1 text-sm">Review, shortlist, and select student applicants for active placement drives.</p>
        </div>
        <button
          onClick={() => setIsToolOpen(!isToolOpen)}
          className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto ${
            isToolOpen 
              ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500' 
              : 'bg-white hover:bg-slate-50 text-blue-700 border-blue-200'
          }`}
        >
          <span>⚡</span> {isToolOpen ? 'Close Quick Update Tool' : 'Quick Update by Emails'}
        </button>
      </div>

      {/* Quick Email Update Tool Panel */}
      {isToolOpen && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div>
            <h3 className="text-sm font-bold text-blue-900">Copy-Paste Bulk Status Updater</h3>
            <p className="text-xs text-slate-500 mt-0.5">Paste list of student emails from Excel/emails to select, shortlist, or reject them instantly.</p>
          </div>

          {bulkMsg.text && (
            <div className={`p-3 rounded-lg text-xs font-semibold border ${
              bulkMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-655'
            }`}>
              {bulkMsg.text}
            </div>
          )}

          <form onSubmit={handleEmailBulkUpdate} className="space-y-3">
            <textarea
              rows={3}
              placeholder="Paste student email addresses here... (e.g. rohan@gmail.com, priya@gmail.com)"
              value={bulkEmails}
              onChange={e => setBulkEmails(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
              required
            />
            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="block text-slate-700 text-xs font-bold mb-1">Target Drive</label>
                <select
                  value={bulkDriveId}
                  onChange={e => setBulkDriveId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="All">All Applied Drives</option>
                  {drives.map(d => (
                    <option key={d.id} value={d.id}>{d.company} - {d.role}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-slate-700 text-xs font-bold mb-1">Update Status To</label>
                <select
                  value={bulkStatus}
                  onChange={e => setBulkStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Aptitude Test">Aptitude Test</option>
                  <option value="Technical Interview">Technical Interview</option>
                  <option value="HR Interview">HR Interview</option>
                  <option value="Selected">Selected / Placed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Pending">Pending / Reset</option>
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-slate-700 text-xs font-bold mb-1">Remarks / Comments (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared round / rejection reason"
                  value={bulkRemarks}
                  onChange={e => setBulkRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-xs shadow w-full md:w-auto h-9 cursor-pointer transition flex items-center justify-center whitespace-nowrap animate-none"
              >
                Apply Updates
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by candidate, role, or company..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setSelectedIds([]); // Reset selection on search
          }}
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        />

        {/* Department Filter */}
        <select
          value={deptFilter}
          onChange={e => {
            setDeptFilter(e.target.value);
            setSelectedIds([]);
          }}
          className="w-full md:w-40 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          <option value="All">All Depts</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
        </select>

        {/* CGPA Filter */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-white w-full md:w-44">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Min CGPA:</span>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            placeholder="e.g. 7.5"
            value={cgpaFilter}
            onChange={e => {
              setCgpaFilter(e.target.value);
              setSelectedIds([]);
            }}
            className="w-full outline-none text-sm bg-transparent"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value);
            setSelectedIds([]); // Reset selection on filter
          }}
          className="w-full md:w-40 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Applied / Pending</option>
          <option value="Aptitude Test">Aptitude Test</option>
          <option value="Technical Interview">Technical Interview</option>
          <option value="HR Interview">HR Interview</option>
          <option value="Selected">Selected / Placed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Bulk Actions & Export Toolbar */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-sm font-semibold text-slate-700">
          Selected <span className="text-blue-600 font-bold bg-blue-50 border border-blue-100 rounded px-2 py-0.5">{selectedIds.length}</span> candidate(s)
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => handleInitiateBulkStatusChange('Aptitude Test')}
            disabled={selectedIds.length === 0}
            className={`text-xs font-bold py-2 px-3 rounded-lg border transition shadow-sm cursor-pointer ${
              selectedIds.length === 0
                ? 'bg-white text-slate-400 border-slate-100 cursor-not-allowed'
                : 'bg-amber-50 text-amber-750 border-amber-250 hover:bg-amber-600 hover:text-white hover:border-amber-600'
            }`}
          >
            Bulk Aptitude
          </button>
          <button
            onClick={() => handleInitiateBulkStatusChange('Technical Interview')}
            disabled={selectedIds.length === 0}
            className={`text-xs font-bold py-2 px-3 rounded-lg border transition shadow-sm cursor-pointer ${
              selectedIds.length === 0
                ? 'bg-white text-slate-400 border-slate-100 cursor-not-allowed'
                : 'bg-indigo-50 text-indigo-750 border-indigo-250 hover:bg-indigo-650 hover:text-white hover:border-indigo-650'
            }`}
          >
            Bulk Tech Round
          </button>
          <button
            onClick={() => handleInitiateBulkStatusChange('Selected')}
            disabled={selectedIds.length === 0}
            className={`text-xs font-bold py-2 px-3 rounded-lg border transition shadow-sm cursor-pointer ${
              selectedIds.length === 0
                ? 'bg-white text-slate-400 border-slate-100 cursor-not-allowed'
                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600'
            }`}
          >
            Bulk Offer Job
          </button>
          <button
            onClick={() => handleInitiateBulkStatusChange('Rejected')}
            disabled={selectedIds.length === 0}
            className={`text-xs font-bold py-2 px-3 rounded-lg border transition shadow-sm cursor-pointer ${
              selectedIds.length === 0
                ? 'bg-white text-slate-400 border-slate-100 cursor-not-allowed'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-655 hover:text-white hover:border-red-655'
            }`}
          >
            Bulk Reject
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-3.5 rounded-lg text-xs border border-slate-200 shadow-sm transition cursor-pointer flex items-center gap-1.5"
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      {/* Applicants List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredApplicants.length > 0 && selectedIds.length === filteredApplicants.length}
                    onChange={toggleSelectAll}
                    className="cursor-pointer w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                </th>
                <th className="py-3 px-4 text-slate-500 font-semibold">Candidate</th>
                <th className="py-3 px-4 text-slate-500 font-semibold">Applied Role</th>
                <th className="py-3 px-4 text-slate-500 font-semibold">Company</th>
                <th className="py-3 px-4 text-slate-500 font-semibold">CGPA</th>
                <th className="py-3 px-4 text-slate-500 font-semibold">Status</th>
                <th className="py-3 px-4 text-slate-500 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching applicants found.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((app) => {
                  const studentEmailLower = app.studentEmail ? app.studentEmail.toLowerCase() : '';
                  const candidateUser = users.find(u => u.email && u.email.toLowerCase() === studentEmailLower);
                  const studentCgpa = candidateUser?.cgpa !== undefined ? candidateUser.cgpa : (app.cgpa || 7.5);
                  return (
                    <tr key={app.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition ${selectedIds.includes(app.id) ? 'bg-blue-50/20' : ''}`}>
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="cursor-pointer w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <button
                            onClick={() => handleOpenCandidateModal(app, studentCgpa)}
                            className="text-left font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer focus:outline-none"
                          >
                            {app.studentName}
                          </button>
                          <div className="text-xs text-slate-400">{app.studentEmail}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{app.role}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">{app.company}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{studentCgpa}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs ${statusColors[app.status] || 'bg-slate-100 text-slate-700 font-semibold border'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        {(app.status === 'Pending' || app.status === 'Applied') && (
                          <>
                            <button
                              onClick={() => handleInitiateStatusChange(app.id, 'Aptitude Test')}
                              className="bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white font-bold py-1 px-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                            >
                              Advance to Aptitude
                            </button>
                            <button
                              onClick={() => handleInitiateStatusChange(app.id, 'Rejected')}
                              className="bg-red-50 hover:bg-red-655 text-red-700 hover:text-white font-bold py-1 px-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === 'Aptitude Test' && (
                          <>
                            <button
                              onClick={() => handleInitiateStatusChange(app.id, 'Technical Interview')}
                              className="bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold py-1 px-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                            >
                              Advance to Tech
                            </button>
                            <button
                              onClick={() => handleInitiateStatusChange(app.id, 'Rejected')}
                              className="bg-red-50 hover:bg-red-655 text-red-700 hover:text-white font-bold py-1 px-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleInitiateStatusChange(app.id, 'Pending')}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-1 px-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                            >
                              Reset
                            </button>
                          </>
                        )}
                        {app.status === 'Technical Interview' && (
                          <>
                            <button
                              onClick={() => handleInitiateStatusChange(app.id, 'HR Interview')}
                              className="bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold py-1 px-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                            >
                              Advance to HR
                            </button>
                            <button
                              onClick={() => handleInitiateStatusChange(app.id, 'Rejected')}
                              className="bg-red-50 hover:bg-red-655 text-red-700 hover:text-white font-bold py-1 px-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleInitiateStatusChange(app.id, 'Pending')}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-1 px-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                            >
                              Reset
                            </button>
                          </>
                        )}
                        {app.status === 'HR Interview' && (
                          <>
                            <button
                              onClick={() => handleInitiateStatusChange(app.id, 'Selected')}
                              className="bg-green-50 hover:bg-green-600 text-green-700 hover:text-white font-bold py-1 px-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                            >
                              Offer Job
                            </button>
                            <button
                              onClick={() => handleInitiateStatusChange(app.id, 'Rejected')}
                              className="bg-red-50 hover:bg-red-655 text-red-700 hover:text-white font-bold py-1 px-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleInitiateStatusChange(app.id, 'Pending')}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-1 px-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                            >
                              Reset
                            </button>
                          </>
                        )}
                        {(app.status === 'Selected' || app.status === 'Rejected') && (
                          <button
                            onClick={() => handleInitiateStatusChange(app.id, 'Pending')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-1 px-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                          >
                            Reset Status
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Portfolio Details Modal */}
      {selectedCandidate && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 z-40 transition-opacity" 
            onClick={() => setSelectedCandidate(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 z-50 border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto font-sans">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Candidate Portfolio</h3>
                <p className="text-xs text-slate-400 mt-0.5">Academic background and coordinates review.</p>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Modal Details Grid */}
            {selectedCandidate.loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-xs font-bold text-slate-400">Loading candidate details...</p>
              </div>
            ) : (
              <div className="py-5 space-y-6">
              
              {/* Profile Card Summary */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xl text-blue-700">
                  {selectedCandidate.studentName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{selectedCandidate.studentName}</h4>
                  <p className="text-xs text-slate-500 font-mono">{selectedCandidate.studentEmail}</p>
                  <p className="text-xs text-slate-400 mt-0.5">📞 {selectedCandidate.phone}</p>
                </div>
              </div>

              {/* Academic & Placement details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Student's GPA</span>
                  <span className="font-extrabold text-slate-800 text-sm">{selectedCandidate.cgpa}</span>
                </div>
                <div className="p-3 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Applied Drive</span>
                  <span className="font-extrabold text-slate-800 text-sm">{selectedCandidate.company} - {selectedCandidate.role}</span>
                </div>
              </div>

              {/* Technical Skills */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Technical Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Portfolio Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-b border-slate-50 py-4">
                {selectedCandidate.resumeUrl ? (
                  <a 
                    href={selectedCandidate.resumeUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50/50 text-xs font-bold transition text-center"
                  >
                    📄 Open Resume PDF
                  </a>
                ) : (
                  <span className="flex items-center justify-center p-2 rounded-lg border border-slate-100 text-slate-400 text-xs italic text-center">
                    No Resume Attached
                  </span>
                )}

                <a 
                  href={selectedCandidate.githubUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50/50 text-xs font-bold transition text-center"
                >
                  💻 GitHub Profile
                </a>

                <a 
                  href={selectedCandidate.linkedinUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50/50 text-xs font-bold transition text-center"
                >
                  👤 LinkedIn Profile
                </a>
              </div>

              {/* Live Resume Preview (Simulated Document or Real PDF Viewer) */}
              <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">📄 Resume PDF Preview</h4>
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">
                    {selectedCandidate.resumeUrl?.startsWith('data:application/pdf') ? 'Interactive PDF' : 'Simulated Document'}
                  </span>
                </div>
                
                {selectedCandidate.resumeUrl?.startsWith('data:application/pdf') ? (
                  <div className="bg-white border rounded-lg overflow-hidden shadow-sm h-96">
                    <iframe
                      src={selectedCandidate.resumeUrl}
                      title="Resume PDF"
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="bg-white border rounded-lg p-4 shadow-sm text-xs text-slate-650 space-y-3 font-serif min-h-[200px]">
                    {/* Resume Header */}
                    <div className="text-center border-b border-slate-100 pb-2">
                      <h5 className="font-bold text-slate-800 text-sm leading-tight">{selectedCandidate.studentName}</h5>
                      <p className="text-[10px] text-slate-500 font-sans mt-0.5">{selectedCandidate.studentEmail} • {selectedCandidate.phone || '9998887776'}</p>
                    </div>
                    
                    {/* Education */}
                    <div className="space-y-1">
                      <h6 className="font-bold text-slate-800 font-sans text-[10px] uppercase border-b border-slate-100 pb-0.5">Education</h6>
                      <div className="flex justify-between font-sans">
                        <span className="font-semibold text-slate-700">B.Tech Degree</span>
                        <span className="text-slate-500 text-[10px]">CGPA: {selectedCandidate.cgpa} (Graduation: 2025)</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-1">
                      <h6 className="font-bold text-slate-800 font-sans text-[10px] uppercase border-b border-slate-100 pb-0.5">Core Technical Skills</h6>
                      <p className="text-slate-600 leading-relaxed font-sans">{selectedCandidate.skills || 'JavaScript, React, Node.js, Python'}</p>
                    </div>

                    {/* Projects */}
                    <div className="space-y-1.5">
                      <h6 className="font-bold text-slate-800 font-sans text-[10px] uppercase border-b border-slate-100 pb-0.5">Academic Projects</h6>
                      <div className="font-sans">
                        <div className="font-semibold text-slate-750">1. Placement Management System</div>
                        <p className="text-slate-500 text-[10px] leading-relaxed mt-0.5">Developed a responsive, serverless student recruitment dashboard with filter sets and localStorage synchronization.</p>
                      </div>
                      <div className="font-sans">
                        <div className="font-semibold text-slate-750">2. Technical Portfolio Portal</div>
                        <p className="text-slate-500 text-[10px] leading-relaxed mt-0.5">Designed a modern portfolio with Tailwind CSS utility tokens to highlight qualifications and projects.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

                 {/* Status update tools in-context */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-150 rounded-xl font-sans">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs inline-block mt-0.5 ${statusColors[selectedCandidate.status] || 'bg-slate-100 text-slate-650 border border-slate-200 font-semibold'}`}>
                    {selectedCandidate.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                  {(selectedCandidate.status === 'Pending' || selectedCandidate.status === 'Applied') && (
                    <>
                      <button
                        onClick={() => handleInitiateStatusChange(selectedCandidate.id, 'Aptitude Test')}
                        className="text-xs font-bold py-1.5 px-3 bg-amber-50 text-amber-700 border border-amber-250 hover:bg-amber-600 hover:text-white rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Advance to Aptitude
                      </button>
                      <button
                        onClick={() => handleInitiateStatusChange(selectedCandidate.id, 'Rejected')}
                        className="text-xs font-bold py-1.5 px-3 bg-red-50 text-red-700 border border-red-200 hover:bg-red-650 hover:text-white rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedCandidate.status === 'Aptitude Test' && (
                    <>
                      <button
                        onClick={() => handleInitiateStatusChange(selectedCandidate.id, 'Technical Interview')}
                        className="text-xs font-bold py-1.5 px-3 bg-indigo-50 text-indigo-750 border border-indigo-250 hover:bg-indigo-600 hover:text-white rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Advance to Tech
                      </button>
                      <button
                        onClick={() => handleInitiateStatusChange(selectedCandidate.id, 'Rejected')}
                        className="text-xs font-bold py-1.5 px-3 bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleInitiateStatusChange(selectedCandidate.id, 'Pending')}
                        className="text-xs font-bold py-1.5 px-3 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Reset
                      </button>
                    </>
                  )}
                  {selectedCandidate.status === 'Technical Interview' && (
                    <>
                      <button
                        onClick={() => handleInitiateStatusChange(selectedCandidate.id, 'HR Interview')}
                        className="text-xs font-bold py-1.5 px-3 bg-purple-50 text-purple-750 border border-purple-250 hover:bg-purple-600 hover:text-white rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Advance to HR
                      </button>
                      <button
                        onClick={() => handleInitiateStatusChange(selectedCandidate.id, 'Rejected')}
                        className="text-xs font-bold py-1.5 px-3 bg-red-50 text-red-750 border border-red-200 hover:bg-red-650 hover:text-white rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleInitiateStatusChange(selectedCandidate.id, 'Pending')}
                        className="text-xs font-bold py-1.5 px-3 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Reset
                      </button>
                    </>
                  )}
                  {selectedCandidate.status === 'HR Interview' && (
                    <>
                      <button
                        onClick={() => handleInitiateStatusChange(selectedCandidate.id, 'Selected')}
                        className="text-xs font-bold py-1.5 px-3 bg-green-50 text-green-700 border border-green-250 hover:bg-green-650 hover:text-white rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Offer Job
                      </button>
                      <button
                        onClick={() => handleInitiateStatusChange(selectedCandidate.id, 'Rejected')}
                        className="text-xs font-bold py-1.5 px-3 bg-red-50 text-red-750 border border-red-250 hover:bg-red-650 hover:text-white rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleInitiateStatusChange(selectedCandidate.id, 'Pending')}
                        className="text-xs font-bold py-1.5 px-3 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Reset
                      </button>
                    </>
                  )}
                  {(selectedCandidate.status === 'Selected' || selectedCandidate.status === 'Rejected') && (
                    <button
                      onClick={() => handleInitiateStatusChange(selectedCandidate.id, 'Pending')}
                      className="text-xs font-bold py-1.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-750 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
                    >
                      Reset Status
                    </button>
                  )}
                </div>
              </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Remarks Modal */}
      {remarksModal.isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 z-50 transition-opacity" 
            onClick={() => setRemarksModal(prev => ({ ...prev, isOpen: false }))}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-[60] border border-slate-100 animate-in zoom-in-95 duration-200 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {remarksModal.isRejection ? '🚫 Rejection Remarks' : '💬 Add Feedback/Remarks'}
              </h3>
              <button 
                onClick={() => setRemarksModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-655 font-bold p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="py-4 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                {remarksModal.isRejection 
                  ? 'Please provide a mandatory reason for rejecting this application. This feedback will be displayed to the student.' 
                  : `Provide optional feedback, schedule coordinates, or remarks for moving the candidate to "${remarksModal.newStatus}".`}
              </p>
              
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5">Feedback / Comments</label>
                <textarea
                  rows={4}
                  placeholder={remarksModal.isRejection ? "e.g., GPA does not meet requirements / Resume does not match technical criteria..." : "e.g., Interview scheduled for tomorrow at 10 AM. Link shared via email."}
                  value={remarksModal.remarks}
                  onChange={e => setRemarksModal(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                  required={remarksModal.isRejection}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
              <button
                onClick={() => setRemarksModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={remarksModal.isRejection && !remarksModal.remarks.trim()}
                className={`px-4 py-2 font-bold text-white rounded-lg text-xs transition cursor-pointer shadow-sm ${
                  remarksModal.isRejection 
                    ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed'
                }`}
              >
                Confirm Update
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Applicants;
