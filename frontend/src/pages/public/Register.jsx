import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await register(name, email, password, 'student');
    if (res.success) {
      navigate('/login');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 font-sans">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-slate-105"
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Register Student Account</h2>
        
        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-205 rounded-lg p-2.5 text-xs mb-4 text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-slate-700 text-sm font-semibold mb-1.5 font-medium">Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-slate-700 text-sm font-semibold mb-1.5 font-medium">Email Address</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="student@placify.com"
            required
          />
          <p className="text-[10px] text-slate-500 mt-1">Enter your email address (use your real email to receive Nodemailer alerts).</p>
        </div>
        <div className="mb-6">
          <label className="block text-slate-700 text-sm font-semibold mb-1.5 font-medium">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow transition cursor-pointer text-sm"
        >
          Create Account
        </button>
        <div className="text-center mt-4">
          <button 
            type="button" 
            onClick={() => navigate('/login')}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Already have an account? Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;