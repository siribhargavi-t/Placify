import React, { useState } from 'react';
import { usePlacement } from '../../services/PlacementContext';

const statusStyles = {
  Open: 'bg-green-100 text-green-700 font-semibold',
  Closed: 'bg-red-100 text-red-600 font-semibold',
  Upcoming: 'bg-yellow-100 text-yellow-700 font-semibold',
};

const ManageJobs = () => {
  const { drives, postDrive, deleteDrive, editDrive } = usePlacement();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriveId, setEditingDriveId] = useState(null);

  // Drive form state
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [pack, setPack] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [location, setLocation] = useState('On Campus');
  const [departments, setDepartments] = useState('All');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Open');

  const resetForm = () => {
    setCompany('');
    setRole('');
    setPack('');
    setCgpa('');
    setLocation('On Campus');
    setDepartments('All');
    setDeadline('');
    setStatus('Open');
    setEditingDriveId(null);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!company || !role || !pack || !cgpa || !deadline) return;

    const driveData = {
      company,
      role,
      package: pack,
      cgpa,
      location,
      departments: departments || 'All',
      deadline,
      status
    };

    if (editingDriveId) {
      editDrive(editingDriveId, driveData);
    } else {
      postDrive(driveData);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleOpenEditModal = (drive) => {
    setCompany(drive.company);
    setRole(drive.role);
    setPack(drive.package);
    setCgpa(drive.cgpa);
    setLocation(drive.location);
    setDepartments(drive.departments);
    setDeadline(drive.deadline);
    setStatus(drive.status);
    setEditingDriveId(drive.id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 font-sans relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Manage Placement Drives</h1>
          <p className="text-slate-500 mt-1 text-sm">Post new hiring criteria or modify ongoing campus drives.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
        >
          <span>➕</span> Post Placement Drive
        </button>
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drives.map((drive) => (
          <div
            key={drive.id}
            className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 leading-tight">{drive.company}</h3>
                  <span className="text-sm font-semibold text-slate-500">{drive.role}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs ${statusStyles[drive.status]}`}>
                  {drive.status}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {drive.package}
                </span>
                <span className="bg-slate-50 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {drive.location}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-2">
                <div><span className="font-bold text-slate-700">CGPA Requirement:</span> {drive.cgpa}</div>
                <div><span className="font-bold text-slate-700">Departments:</span> {drive.departments}</div>
                <div><span className="font-bold text-slate-700">Registration Deadline:</span> {drive.deadline}</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-55 flex justify-end gap-2">
              <button
                onClick={() => handleOpenEditModal(drive)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-1.5 px-3 rounded-lg transition cursor-pointer"
              >
                Edit Drive
              </button>
              <button
                onClick={() => deleteDrive(drive.id)}
                className="text-xs font-bold text-red-650 hover:text-red-850 hover:bg-red-50 py-1.5 px-3 rounded-lg transition cursor-pointer"
              >
                Delete Drive
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Post/Edit Job Modal */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 z-30"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-40 border border-slate-100 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {editingDriveId ? 'Edit Placement Drive' : 'Post New Placement Drive'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold rounded p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 pt-4">
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wipro Technologies, TCS, Google"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1">Job/Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Associate Software Engineer"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1">Package (e.g. LPA)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹8.5 LPA"
                    value={pack}
                    onChange={e => setPack(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1">Eligibility CGPA</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7.5+"
                    value={cgpa}
                    onChange={e => setCgpa(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1">Location</label>
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="On Campus">On Campus</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1">Target Departments</label>
                <select
                  value={departments}
                  onChange={e => setDepartments(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="All">All Departments</option>
                  <option value="CSE">CSE Only</option>
                  <option value="IT">IT Only</option>
                  <option value="ECE">ECE Only</option>
                  <option value="EEE">EEE Only</option>
                  <option value="CSE, IT">CSE & IT</option>
                  <option value="CSE, IT, ECE">CSE, IT & ECE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1">Application Deadline</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow transition cursor-pointer"
                >
                  {editingDriveId ? 'Save Changes' : 'Post Drive'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageJobs;
