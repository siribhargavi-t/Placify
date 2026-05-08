import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Public pages
import Login from '../pages/public/Login'
import Register from '../pages/public/Register'
import Home from '../pages/public/Home'

// Student pages
import StudentDashboard from '../pages/student/StudentDashboard'
import Jobs from '../pages/student/Jobs'
import AppliedJobs from '../pages/student/AppliedJobs'
import StudentProfile from '../pages/student/Profile'

// Recruiter pages
import RecruiterDashboard from '../pages/recruiter/RecruiterDashboard'
import ManageJobs from '../pages/recruiter/ManageJobs'
import Applicants from '../pages/recruiter/Applicants'
import RecruiterProfile from '../pages/recruiter/Profile'

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import ManageUsers from '../pages/admin/ManageUsers'
import Reports from '../pages/admin/Reports'
import AdminProfile from '../pages/admin/Profile'

// Layout
import DashboardLayout from '../layouts/DashboardLayout'

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Student dashboard routes */}
    <Route path="/student" element={<DashboardLayout />}>
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="jobs" element={<Jobs />} />
      <Route path="appliedjobs" element={<AppliedJobs />} />
      <Route path="profile" element={<StudentProfile />} />
    </Route>

    {/* Recruiter dashboard routes */}
    <Route path="/recruiter" element={<DashboardLayout />}>
      <Route path="dashboard" element={<RecruiterDashboard />} />
      <Route path="jobs" element={<ManageJobs />} />
      <Route path="appliedjobs" element={<Applicants />} />
      <Route path="profile" element={<RecruiterProfile />} />
    </Route>

    {/* Admin dashboard routes */}
    <Route path="/admin" element={<DashboardLayout />}>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="jobs" element={<ManageUsers />} />
      <Route path="appliedjobs" element={<Reports />} />
      <Route path="profile" element={<AdminProfile />} />
    </Route>
  </Routes>
)

export default AppRoutes