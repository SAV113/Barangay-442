import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wallet, Package, Share2, Megaphone,
  Calendar, FileBarChart, ShieldCheck, Settings, Menu, X,
  Bell, Search, ChevronDown, LogOut, User, Building2,
  AlertTriangle, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const adminNavItems = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Beneficiary',
    items: [
      { label: 'Beneficiaries', to: '/admin/beneficiaries', icon: Users },
    ],
  },
  {
    section: 'Payouts',
    items: [
      { label: 'Payout Management', to: '/admin/payouts', icon: Wallet },
    ],
  },
  {
    section: 'Resources',
    items: [
      { label: 'Inventory', to: '/admin/resources', icon: Package },
      { label: 'Distribution', to: '/admin/distribution', icon: Share2 },
    ],
  },
  {
    section: 'Content',
    items: [
      { label: 'Announcements', to: '/admin/announcements', icon: Megaphone },
      { label: 'Events', to: '/admin/events', icon: Calendar },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'Reports', to: '/admin/reports', icon: FileBarChart },
      { label: 'Users', to: '/admin/users', icon: Users, adminOnly: true },
      { label: 'Audit Logs', to: '/admin/audit-logs', icon: ShieldCheck, adminOnly: true },
      { label: 'Settings', to: '/admin/settings', icon: Settings, adminOnly: true },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdminUser = user?.role === 'admin';

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''} flex flex-col`}
        aria-label="Admin sidebar navigation"
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white font-extrabold text-base font-display">MASID</div>
            <div className="text-[10px] text-gray-500">Admin Portal</div>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white p-1"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Badge */}
        <div className="p-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-white text-sm font-semibold truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-gray-500 text-xs truncate capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
          {adminNavItems.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !('adminOnly' in item && item.adminOnly && !isAdminUser)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.section} className="mb-5">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 px-3">
                  {section.section}
                </p>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-item mb-0.5 ${isActive ? 'active' : ''}`
                    }
                  >
                    <item.icon size={17} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <Link
            to="/"
            className="nav-item mb-1 text-gray-500 hover:text-gray-300"
          >
            <Building2 size={17} />
            <span>View Public Site</span>
          </Link>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="nav-item w-full text-left text-red-400 hover:bg-red-900/20 hover:text-red-300"
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main flex-1 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-14">
            {/* Left */}
            <div className="flex items-center gap-3">
              <button
                id="admin-sidebar-toggle"
                className="btn btn-ghost btn-icon lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu size={20} />
              </button>

              {/* Search */}
              <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-64">
                <Search size={15} className="text-gray-400 flex-shrink-0" />
                <input
                  id="admin-search-input"
                  type="search"
                  placeholder="Search..."
                  className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none w-full"
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  id="admin-notif-btn"
                  className="btn btn-ghost btn-icon relative"
                  onClick={() => setNotifOpen(!notifOpen)}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-scale-in">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {[
                        { msg: 'New beneficiary registered', time: '5 min ago', type: 'info' },
                        { msg: 'Resource stock is low: Alcohol 70%', time: '1 hr ago', type: 'warning' },
                        { msg: 'Payout schedule completed', time: 'Yesterday', type: 'success' },
                      ].map((n, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm text-gray-700">{n.msg}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center">
                      <Link
                        to="/admin/audit-logs"
                        className="text-xs text-[#1e3a8a] font-semibold hover:underline"
                        onClick={() => setNotifOpen(false)}
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  id="admin-profile-btn"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="User profile"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.firstName}
                  </span>
                  <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-scale-in">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="badge badge-primary mt-1 capitalize">{user?.role}</span>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 rounded-xl hover:bg-red-50 font-medium"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
