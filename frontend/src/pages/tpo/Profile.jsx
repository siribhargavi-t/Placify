import React from 'react';
import { useAuth } from '../../services/AuthContext';

const TpoProfile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">TPO Profile</h1>
        <p className="text-slate-500 mt-1 text-sm">Personal details and system authorizations.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center font-bold text-3xl text-blue-700 shadow-inner">
          {user.name ? user.name[0] : 'T'}
        </div>
        <div className="space-y-2 text-center sm:text-left flex-1">
          <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
          <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
            {user.role} (Placement Cell Coordinator)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 text-sm text-slate-600 border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-400 block text-xs uppercase">Email Address</span>
              <span className="font-medium text-slate-750">{user.email}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-400 block text-xs uppercase">System Status</span>
              <span className="font-semibold text-green-600">Active Coordinator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TpoProfile;
