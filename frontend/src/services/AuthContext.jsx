import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch current logged in user details from JWT
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('placify-token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        // If logged in as admin/tpo, fetch list of users
        if (data.role === 'admin' || data.role === 'tpo') {
          fetchUsersList(token);
        }
      } else {
        // Token is invalid/expired
        localStorage.removeItem('placify-token');
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users list (TPO/Admin only)
  const fetchUsersList = async (token = localStorage.getItem('placify-token')) => {
    if (!token) return;
    try {
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users list:', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('placify-token', data.token);
        setUser(data.user);
        if (data.user.role === 'admin' || data.user.role === 'tpo') {
          fetchUsersList(data.token);
        }
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed.' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Server connection failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('placify-token');
    setUser(null);
    setUsers([]);
  };

  const register = async (name, email, password, role = 'student') => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed.' };
      }
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, message: 'Server connection failed.' };
    }
  };

  const updateUserProfile = async (updatedDetails) => {
    const token = localStorage.getItem('placify-token');
    if (!token) return;

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedDetails)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        if (data.user.role === 'admin' || data.user.role === 'tpo') {
          fetchUsersList(token);
        }
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  const toggleUserStatus = async (id) => {
    const token = localStorage.getItem('placify-token');
    if (!token) return;

    try {
      const res = await fetch(`/api/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: id })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        fetchUsersList(token);
        if (user && user.id === id && data.user.status === 'Suspended') {
          logout();
        }
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const updateUserCgpa = async (id, newCgpa) => {
    const token = localStorage.getItem('placify-token');
    if (!token) return;

    try {
      const res = await fetch(`/api/users/${id}/cgpa`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cgpa: newCgpa })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        fetchUsersList(token);
        if (user && user.id === id) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error('Update CGPA error:', err);
    }
  };

  const updateUserVerification = async (id, newStatus, remarks = '') => {
    const token = localStorage.getItem('placify-token');
    if (!token) return;

    try {
      const res = await fetch(`/api/users/${id}/verification`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, remarks })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        fetchUsersList(token);
        if (user && user.id === id) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error('Update verification error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        logout,
        register,
        updateUserProfile,
        toggleUserStatus,
        updateUserCgpa,
        updateUserVerification
      }}
    >
      {!loading ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-bold text-slate-500">Loading Placify...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
