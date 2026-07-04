import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';

const statusStyles = {
  Active: 'bg-green-100 text-green-700 font-semibold',
  Suspended: 'bg-red-100 text-red-600 font-semibold'
};

const roleColors = {
  student: 'bg-blue-50 text-blue-600 border-blue-100',
  tpo: 'bg-purple-50 text-purple-600 border-purple-100',
  admin: 'bg-slate-100 text-slate-700 border-slate-200'
};

const ManageUsers = () => {
  const { users, toggleUserStatus, updateUserCgpa, updateUserVerification } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editCgpaValue, setEditCgpaValue] = useState('');
  const [rejectingUserId, setRejectingUserId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');

  const toggleStatus = (id) => {
    toggleUserStatus(id);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 font-sans relative">
      <div>
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Manage System Users</h1>
        <p className="text-slate-500 mt-1 text-sm">View user registrations, verify student academic profiles, and manage account statuses.</p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          <option value="All">All Roles</option>
          <option value="student">Student</option>
          <option value="tpo">Placement Cell (TPO)</option>
          <option value="admin">Principal (Admin)</option>
        </select>
      </div>

      {/* Users Log table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-4 text-slate-500 font-semibold">User</th>
                <th className="py-3 px-4 text-slate-500 font-semibold">Company / Org / CGPA</th>
                <th className="py-3 px-4 text-slate-500 font-semibold">Role</th>
                <th className="py-3 px-4 text-slate-500 font-semibold">Verification</th>
                <th className="py-3 px-4 text-slate-500 font-semibold">Status</th>
                <th className="py-3 px-4 text-slate-500 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {u.role === 'student' ? (
                      editingUserId === u.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={editCgpaValue}
                            onChange={(e) => setEditCgpaValue(e.target.value)}
                            className="w-16 px-1.5 py-1 border border-slate-350 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                          <button
                            onClick={() => {
                              updateUserCgpa(u.id, editCgpaValue);
                              setEditingUserId(null);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer border border-slate-200"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">{u.department || 'CSE'}</span>
                          <span className="font-bold text-xs text-slate-700">GPA: {u.cgpa !== undefined ? u.cgpa : '7.5'}</span>
                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setEditCgpaValue(u.cgpa !== undefined ? u.cgpa.toString() : '7.5');
                            }}
                            title="Edit CGPA"
                            className="text-xs hover:bg-slate-100 p-1 rounded transition cursor-pointer"
                          >
                            ✏️
                          </button>
                        </div>
                      )
                    ) : (
                      u.company || '-'
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs border capitalize ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.role === 'student' ? (
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.verificationStatus === 'Verified'
                            ? 'bg-green-100 text-green-700'
                            : u.verificationStatus === 'Rejected'
                            ? 'bg-red-100 text-red-650'
                            : 'bg-amber-100 text-amber-700 font-bold'
                        }`}>
                          {u.verificationStatus || 'Unverified'}
                        </span>
                        {u.verificationRemarks && (
                          <div className="text-[10px] text-slate-400 mt-1 italic max-w-[150px] truncate" title={u.verificationRemarks}>
                            Remarks: {u.verificationRemarks}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-mono">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs ${statusStyles[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {u.role === 'admin' ? (
                        <span className="text-xs text-slate-400 font-semibold italic">System Owner</span>
                      ) : (
                        <>
                          {u.role === 'student' && (
                            <>
                              {u.verificationStatus !== 'Verified' && (
                                <button
                                  onClick={() => updateUserVerification(u.id, 'Verified')}
                                  className="text-xs font-bold py-1.5 px-2 rounded-lg border border-green-200 text-green-700 bg-green-50 hover:bg-green-600 hover:text-white transition cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {u.verificationStatus !== 'Rejected' && (
                                <button
                                  onClick={() => setRejectingUserId(u.id)}
                                  className="text-xs font-bold py-1.5 px-2 rounded-lg border border-rose-250 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => toggleStatus(u.id)}
                            className={`text-xs font-bold py-1.5 px-2.5 rounded-lg border transition cursor-pointer ${
                              u.status === 'Active'
                                ? 'border-slate-200 text-slate-650 hover:bg-slate-50'
                                : 'border-yellow-255 text-yellow-700 bg-yellow-50 hover:bg-yellow-600 hover:text-white'
                            }`}
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Remarks Modal */}
      {rejectingUserId !== null && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 z-50" onClick={() => { setRejectingUserId(null); setRejectRemarks(''); }} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-50 border border-slate-100 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-800">Reject Academic Profile</h3>
              <button onClick={() => { setRejectingUserId(null); setRejectRemarks(''); }} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Provide rejection remarks explaining the mismatch or correction required (e.g. CGPA mismatch, invalid resume PDF).</p>
            <textarea
              value={rejectRemarks}
              onChange={e => setRejectRemarks(e.target.value)}
              placeholder="e.g. CGPA mismatch with official records. Please correct."
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 bg-white text-slate-800"
              rows={3}
              required
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => { setRejectingUserId(null); setRejectRemarks(''); }}
                className="px-3.5 py-2 border border-slate-250 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateUserVerification(rejectingUserId, 'Rejected', rejectRemarks);
                  setRejectingUserId(null);
                  setRejectRemarks('');
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-750 text-white rounded-lg cursor-pointer font-bold shadow-sm"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageUsers;