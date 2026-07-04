import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await login(email, password, role);
    if (res.success) {
      navigate(`/${role}/dashboard`);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 transition-all">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-800 tracking-tight">Placify</h2>
          <p className="text-slate-500 mt-2 text-sm">Sign in to manage drives and applications</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm mb-6 flex items-center justify-center gap-2">
            <span className="font-semibold">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Choice Pills */}
          <div>
            <label className="block text-slate-700 font-semibold text-sm mb-2">I am signing in as a:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'student', label: 'Student' },
                { id: 'tpo', label: 'Placement Cell (TPO)' },
                { id: 'admin', label: 'Principal (Admin)' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`py-2 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    role === r.id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-slate-700 font-semibold text-sm mb-1.5">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@placify.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-700 font-semibold text-sm mb-1.5">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            Sign In
          </button>

          {/* Quick Demo Access Credentials */}
          <div className="mt-4 p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/80">
            <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2 text-center">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Admin', email: 'admin@placify.com', pass: 'password123', role: 'admin' },
                { label: 'TPO', email: 'tpo@placify.com', pass: 'password123', role: 'tpo' },
                { label: 'Student', email: 'student@placify.com', pass: 'password123', role: 'student' }
              ].map((demo) => (
                <button
                  key={demo.label}
                  type="button"
                  onClick={() => {
                    setEmail(demo.email);
                    setPassword(demo.pass);
                    setRole(demo.role);
                  }}
                  className="py-1 px-1 rounded bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-700 text-[10px] font-bold transition cursor-pointer shadow-sm text-center"
                >
                  {demo.label}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 mt-2 text-center">
              Click any button above to autofill the form credentials.
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={() => navigate('/register')}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Don't have an account? Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;