import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search, Menu, X, Bell, User, LogIn, ChevronDown, Phone,
  MapPin, Clock, Mail, Building2, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Payouts', to: '/payouts' },
  { label: 'Events', to: '/events' },
  { label: 'Announcements', to: '/announcements' },
  { label: 'About', to: '/about' },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin' || user.role === 'staff') return '/admin/dashboard';
    return '/resident/dashboard';
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#0f172a] text-gray-400 text-xs py-1.5 hidden lg:block">
        <div className="page-container flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone size={11} />
              +63 2 8XXX-XXXX
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={11} />
              barangay442@gmail.com
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              Mon–Fri: 8AM – 5PM
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield size={11} className="text-teal-400" />
            <span className="text-teal-400 font-medium">Official Barangay 442 E-Services Portal</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`navbar transition-shadow ${scrolled ? 'shadow-md' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0" aria-label="MASID Home">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#14b8a6] flex items-center justify-center shadow-sm">
                <Building2 size={18} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-extrabold text-[#0f172a] text-lg font-display leading-tight">
                  MASID
                </div>
                <div className="text-[10px] text-gray-500 -mt-0.5 font-medium leading-tight">
                  Barangay 442 E-Services
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `navbar-link px-3 py-2 rounded-lg text-sm ${isActive ? 'active text-[#1e3a8a] font-semibold' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                id="navbar-search-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn btn-ghost btn-icon"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Auth */}
              {isAuthenticated && user ? (
                <Link to={getDashboardLink()} className="btn btn-primary btn-sm hidden sm:inline-flex">
                  <User size={15} />
                  Dashboard
                </Link>
              ) : (
                <Link to="/login" id="navbar-login-btn" className="btn btn-primary btn-sm hidden sm:inline-flex">
                  <LogIn size={15} />
                  Sign In
                </Link>
              )}

              {/* Mobile menu */}
              <button
                id="navbar-menu-btn"
                className="btn btn-ghost btn-icon lg:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Search Bar (expandable) */}
          {searchOpen && (
            <div className="pb-3 animate-fade-in">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="navbar-search-input"
                  type="search"
                  placeholder="Search announcements, events, services..."
                  className="form-input pl-9 py-2.5"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-fade-in">
            <div className="page-container py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-[#1e3a8a] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 pt-2 border-t border-gray-100">
                {isAuthenticated ? (
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-primary w-full"
                  >
                    <User size={15} />
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-primary w-full"
                  >
                    <LogIn size={15} />
                    Sign In to MASID
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-[#0f172a] text-gray-400">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#14b8a6] flex items-center justify-center">
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <div className="text-white font-extrabold text-xl font-display">MASID</div>
                <div className="text-xs text-gray-500">E-Services Platform</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Integrated Barangay E-Services Management System for Barangay 442, Zone 44, Sampaloc, Manila.
              Streamlining payouts, resource distribution, and community information.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-teal-400 flex-shrink-0" />
                Barangay 442, Zone 44, Sampaloc, Manila
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-teal-400 flex-shrink-0" />
                +63 2 8XXX-XXXX
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-teal-400 flex-shrink-0" />
                barangay442@gmail.com
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={14} className="text-teal-400 flex-shrink-0" />
                Monday to Friday, 8:00 AM – 5:00 PM
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Quick Links</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                { label: 'Home', to: '/' },
                { label: 'Services', to: '/services' },
                { label: 'Payouts', to: '/payouts' },
                { label: 'Events', to: '/events' },
                { label: 'Announcements', to: '/announcements' },
                { label: 'About MASID', to: '/about' },
                { label: 'Contact Us', to: '/contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Legal</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-teal-400 transition-colors">Contact Us</Link></li>
            </ul>

            <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-teal-400" />
                <span className="text-white text-xs font-semibold">Secure Portal</span>
              </div>
              <p className="text-xs text-gray-600">
                This is an official barangay government system. All data is protected.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="page-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} MASID E-Services — Barangay 442, Zone 44, Sampaloc, Manila. All rights reserved.</p>
          <p>Developed for BSIT Capstone Project</p>
        </div>
      </div>
    </footer>
  );
}
