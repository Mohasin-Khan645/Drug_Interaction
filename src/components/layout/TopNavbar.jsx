import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getInitials, formatRoleName } from '../../utils/formatters';

export default function TopNavbar({ onOpenMobileMenu }) {
  const { currentUser, role, logout } = useAuth();
  const { toggleNotificationPanel } = useNotifications();
  const navigate = useNavigate();

  const currentRole = (role || 'PATIENT').toUpperCase();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = encodeURIComponent(searchQuery.trim());
      let dest = `/portal/patient/search?search=${q}`;
      if (currentRole === 'DOCTOR') dest = `/portal/doctor/search?search=${q}`;
      else if (currentRole === 'PHARMACIST') dest = `/portal/pharmacist/search?search=${q}`;
      else if (currentRole === 'ADMIN') dest = `/portal/admin/drugs?search=${q}`;

      navigate(dest);
      setSearchQuery('');
    }
  };

  const getProfileLink = () => {
    switch (currentRole) {
      case 'DOCTOR':
        return '/portal/doctor/profile';
      case 'PHARMACIST':
        return '/portal/pharmacist/profile';
      case 'ADMIN':
        return '/portal/admin/settings';
      case 'PATIENT':
      default:
        return '/portal/patient/profile';
    }
  };

  const getAvatarStyle = () => {
    switch (currentRole) {
      case 'DOCTOR':
        return {
          bg: 'bg-blue-800 text-white',
          badge: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'PHARMACIST':
        return {
          bg: 'bg-emerald-800 text-white',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'ADMIN':
        return {
          bg: 'bg-purple-800 text-white',
          badge: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'PATIENT':
      default:
        return {
          bg: 'bg-teal-800 text-white',
          badge: 'bg-teal-50 text-teal-800 border-teal-200',
        };
    }
  };

  const getSearchPlaceholder = () => {
    switch (currentRole) {
      case 'DOCTOR':
        return 'Search patient charts, drug interactions, or monographs...';
      case 'PHARMACIST':
        return 'Search dispensing queue, NDC codes, or drug catalog...';
      case 'ADMIN':
        return 'Search user directory, safety rules, or audit trail...';
      case 'PATIENT':
      default:
        return 'Search medications, interactions, or safety guides...';
    }
  };

  const getPortalBadge = () => {
    switch (currentRole) {
      case 'DOCTOR':
        return {
          label: 'Clinician Workspace',
          icon: Stethoscope,
          classes: 'border-blue-200 bg-blue-50 text-blue-800',
        };
      case 'PHARMACIST':
        return {
          label: 'Pharmacy Workspace',
          icon: ShieldCheck,
          classes: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        };
      case 'ADMIN':
        return {
          label: 'Admin Governance',
          icon: ShieldCheck,
          classes: 'border-purple-200 bg-purple-50 text-purple-800',
        };
      case 'PATIENT':
      default:
        return {
          label: 'Patient Portal',
          icon: UserCheck,
          classes: 'border-teal-200 bg-teal-50 text-teal-800',
        };
    }
  };

  const portalBadge = getPortalBadge();
  const PortalBadgeIcon = portalBadge.icon;
  const avatarStyle = getAvatarStyle();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 z-30 shrink-0 shadow-2xs">
      {/* Mobile Menu Trigger & Quick Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open sidebar menu"
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Authoritative Read-Only Portal Scope Badge (No UI Role Switching) */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${portalBadge.classes}`}
          title={`Authenticated under authoritative ${currentRole} credentials`}
        >
          <PortalBadgeIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{portalBadge.label}</span>
          <span className="sm:hidden uppercase">{currentRole}</span>
        </div>

        {/* Notifications Bell Trigger */}
        <button
          type="button"
          onClick={toggleNotificationPanel}
          aria-label="Open safety notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-white"></span>
        </button>

        {/* User Profile & Menu Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
            aria-expanded={isUserMenuOpen}
          >
            <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shadow-xs ${avatarStyle.bg}`}>
              {getInitials(currentUser?.name)}
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold text-slate-800 block truncate max-w-[130px]">
                {currentUser?.name || 'User'}
              </span>
              <span className="text-3xs text-slate-500 block truncate">
                {formatRoleName(currentUser?.role || currentRole)}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.name}
                </p>
                <p className="text-2xs text-slate-500 truncate">
                  {currentUser?.email}
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-3xs font-bold uppercase border ${avatarStyle.badge}`}>
                  {currentUser?.role || currentRole}
                </span>
              </div>

              <Link
                to={getProfileLink()}
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
