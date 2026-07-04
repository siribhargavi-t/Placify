import React from 'react';
import { useAuth } from '../../services/AuthContext';

const AdminProfile = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-xl mx-auto font-sans">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b border-slate-150">Admin Profile</h2>
      <div className="space-y-4 text-slate-700 text-sm">
        <div className="flex gap-2">
          <span className="font-semibold text-slate-400 block text-xs uppercase w-20">Name</span> 
          <span className="font-semibold text-slate-800">{user.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-semibold text-slate-400 block text-xs uppercase w-20">Email</span> 
          <span className="font-medium text-slate-750">{user.email}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-semibold text-slate-400 block text-xs uppercase w-20">Role</span> 
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
            {user.role}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;