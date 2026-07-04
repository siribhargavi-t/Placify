import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import PlacementStats from '../pages/student/PlacementStats'
// Public pages
import Login from '../pages/public/Login'
import Register from '../pages/public/Register'

// Student pages
import StudentDashboard from '../pages/student/StudentDashboard'
import Jobs from '../pages/student/Jobs'
import AppliedJobs from '../pages/student/AppliedJobs'
import StudentProfile from '../pages/student/Profile'

// TPO pages
import TpoDashboard from '../pages/tpo/TpoDashboard'
import ManageJobs from '../pages/tpo/ManageJobs'
import Applicants from '../pages/tpo/Applicants'
import TpoProfile from '../pages/tpo/Profile'

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import ManageUsers from '../pages/admin/ManageUsers'
import Reports from '../pages/admin/Reports'
import AdminProfile from '../pages/admin/Profile'

// Layout & Protection
import DashboardLayout from '../layouts/DashboardLayout'
import ProtectedRoute from '../components/ProtectedRoute'

const RootRedirect = () => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  return <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

    {/* Student dashboard routes */}
    <Route element={<ProtectedRoute allowedRoles={['student']} />}>
      <Route path="/student" element={<DashboardLayout />}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="appliedjobs" element={<AppliedJobs />} />
        <Route path="placement-stats" element={<PlacementStats />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>
    </Route>

    {/* TPO dashboard routes */}
    <Route element={<ProtectedRoute allowedRoles={['tpo']} />}>
      <Route path="/tpo" element={<DashboardLayout />}>
        <Route path="dashboard" element={<TpoDashboard />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="applicants" element={<Applicants />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<TpoProfile />} />
      </Route>
    </Route>

    {/* Admin / Principal dashboard routes */}
    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route path="/admin" element={<DashboardLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Route>
  </Routes>
)

export default AppRoutes