import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

const DashboardLayout = () => {
  const location = useLocation()
  const base = location.pathname.split('/')[1] || 'student'

  return (
    <div className="flex min-h-screen bg-blue-50">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center justify-center font-bold text-2xl tracking-wide border-b border-blue-600">
          Placify
        </div>
        <nav className="flex-1 py-6">
          <ul className="space-y-2">
            <li>
              <Link to={`/${base}/dashboard`} className="block px-6 py-2 rounded-l-full transition-colors hover:bg-blue-600">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to={`/${base}/jobs`} className="block px-6 py-2 rounded-l-full transition-colors hover:bg-blue-600">
                Jobs
              </Link>
            </li>
            <li>
              <Link to={`/${base}/appliedjobs`} className="block px-6 py-2 rounded-l-full transition-colors hover:bg-blue-600">
                Applications
              </Link>
            </li>
            <li>
              <Link to={`/${base}/profile`} className="block px-6 py-2 rounded-l-full transition-colors hover:bg-blue-600">
                Profile
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow flex items-center px-6 justify-between">
          <span className="font-semibold text-blue-700 text-lg capitalize">{base} Dashboard</span>
          <div>
            <span className="inline-block w-8 h-8 bg-blue-200 rounded-full"></span>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout