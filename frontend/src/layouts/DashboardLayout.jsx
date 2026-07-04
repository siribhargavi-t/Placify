import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { usePlacement } from '../services/PlacementContext';

const NAV_ITEMS = {
  student: [
    { label: 'Dashboard', path: '/student/dashboard', icon: '📊' },
    { label: 'Placement Drives', path: '/student/jobs', icon: '🎯' },
    { label: 'Applications', path: '/student/appliedjobs', icon: '📝' },
    { label: 'Placement Stats', path: '/student/placement-stats', icon: '📈' },
    { label: 'Profile', path: '/student/profile', icon: '👤' }
  ],
  tpo: [
    { label: 'Dashboard', path: '/tpo/dashboard', icon: '📊' },
    { label: 'Manage Drives', path: '/tpo/jobs', icon: '🎯' },
    { label: 'Applicants', path: '/tpo/applicants', icon: '👥' },
    { label: 'Manage Users', path: '/tpo/users', icon: '⚙️' },
    { label: 'Reports', path: '/tpo/reports', icon: '📁' },
    { label: 'Profile', path: '/tpo/profile', icon: '👤' }
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '🛡️' },
    { label: 'Manage Users', path: '/admin/users', icon: '⚙️' },
    { label: 'Reports', path: '/admin/reports', icon: '📊' },
    { label: 'Profile', path: '/admin/profile', icon: '👤' }
  ]
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { toast, notifications, markNotificationsAsRead, clearNotifications } = usePlacement();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!user) return null;

  const userNotifications = notifications ? notifications.filter(n => {
    return n.forEmail === 'all' || 
           n.forEmail.toLowerCase() === user.email.toLowerCase() ||
           (n.forEmail === 'tpo' && user.role === 'tpo') ||
           (n.forEmail === 'admin' && user.role === 'admin');
  }) : [];

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const role = user.role || 'student';
  const menuItems = NAV_ITEMS[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = (notif) => {
    setNotifOpen(false);

    let targetPath = notif.path;
    
    // Fallback if path is not specified in the notification
    if (!targetPath) {
      const msg = notif.message.toLowerCase();
      if (msg.includes('welcome') || msg.includes('profile')) {
        targetPath = '/:role/profile';
      } else if (msg.includes('placement drive') || msg.includes('recruitment') || msg.includes('posted') || msg.includes('cancelled') || msg.includes('updated')) {
        targetPath = '/:role/jobs';
      } else if (msg.includes('applied')) {
        if (user.role === 'student') {
          targetPath = '/student/appliedjobs';
        } else if (user.role === 'tpo') {
          targetPath = '/tpo/applicants';
        } else if (user.role === 'admin') {
          targetPath = '/admin/users';
        }
      }
    }

    if (targetPath) {
      // Resolve role placeholder
      let resolvedPath = targetPath.replace('/:role', `/${role}`).replace(':role', role);
      
      // Fallback: Admin doesn't have a jobs page
      if (resolvedPath === '/admin/jobs') {
        resolvedPath = '/admin/dashboard';
      }
      
      navigate(resolvedPath);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex-shrink-0 hidden md:flex flex-col shadow-xl">
        <div className="h-16 flex items-center justify-between px-6 border-b border-blue-700 bg-blue-900">
          <span className="font-bold text-2xl tracking-wider text-white flex items-center gap-2">
            🚀 Placify
          </span>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-4 border-b border-blue-700 bg-blue-900/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center font-bold text-white shadow-sm">
            {user.name ? user.name[0] : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-white truncate">{user.name}</h4>
            <span className="text-[10px] text-blue-300 font-semibold tracking-wider uppercase">{user.role}</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950/20'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-100 hover:text-white text-sm font-bold transition-all cursor-pointer"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm border-b border-slate-100 flex items-center px-6 justify-between relative z-20">
          <div className="flex items-center gap-3">
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50 border border-slate-200"
            >
              ☰
            </button>
            <span className="font-bold text-slate-800 text-lg capitalize flex items-center gap-1.5">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-mono tracking-wider uppercase">
                {role}
              </span>
              Portal
            </span>
          </div>

          <div className="flex items-center gap-4 relative">
            <span className="text-slate-500 text-sm font-medium hidden sm:inline">{user.email}</span>
            
            {/* Notification Bell Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  if (!notifOpen && unreadCount > 0) {
                    markNotificationsAsRead(user.email, user.role);
                  }
                }}
                className="p-2 rounded-lg hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 relative transition cursor-pointer flex items-center justify-center w-9 h-9"
                title="Notifications"
              >
                <span className="text-base select-none">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {notifOpen && (
                <>
                  {/* Invisible overlay to close on click outside */}
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                  
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 py-3 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">Notifications</span>
                      {userNotifications.length > 0 && (
                        <button
                          onClick={() => {
                            clearNotifications();
                            setNotifOpen(false);
                          }}
                          className="text-[10px] text-red-500 hover:text-red-700 transition cursor-pointer font-bold hover:underline"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {userNotifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-slate-400 italic">
                          No notifications yet.
                        </div>
                      ) : (
                        userNotifications.map(n => (
                          <button
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`w-full text-left px-4 py-3 flex gap-2.5 hover:bg-slate-100 transition text-xs cursor-pointer border-none outline-none focus:bg-slate-100 ${
                              !n.read ? 'bg-blue-50/20 font-medium' : ''
                            }`}
                          >
                            <span className="text-sm select-none mt-0.5">
                              {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : '📧'}
                            </span>
                            <div className="flex-1 space-y-0.5">
                              <p className="text-slate-700 leading-snug font-medium text-left">{n.message}</p>
                              <span className="text-[9px] text-slate-400 font-mono block text-left">{n.date}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 select-none">
              {user.name ? user.name[0] : 'U'}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/40 z-30 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed top-0 left-0 h-full w-64 bg-blue-800 text-white flex flex-col z-40 md:hidden shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="h-16 flex items-center justify-between px-6 border-b border-blue-700 bg-blue-900">
                <span className="font-bold text-xl text-white">🚀 Placify Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-lg font-bold p-1 hover:bg-blue-700 rounded"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 border-b border-blue-700 bg-blue-900/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{user.name}</h4>
                  <span className="text-[10px] text-blue-300 font-semibold tracking-wider uppercase">{user.role}</span>
                </div>
              </div>

              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        isActive ? 'bg-blue-600 text-white shadow-md' : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-blue-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-600 text-white text-sm font-bold transition-all"
                >
                  Logout
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Dashboard Main Content Outer Frame */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Dynamic Toast Notification */}
      {toast && (
        <div key={toast.id} className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 max-w-sm transition-all duration-300 ${
          toast.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : toast.type === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : toast.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          <span className="text-lg">
            {toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : toast.type === 'info' ? '📧' : '✅'}
          </span>
          <span className="text-sm font-semibold leading-snug">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;