import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, Shield, User, Sun, Moon, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import RoleSwitcher from './RoleSwitcher';
import GlobalSearch from './GlobalSearch';
import NotificationPanel from './NotificationPanel';

export default function TopBar({ onOpenMobileMenu }) {
  const { currentUser, role } = useAuth();
  const { unreadCount } = useNotifications();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Keyboard shortcut: Ctrl+K or Cmd+K to open global search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const currentRole = (role || 'PATIENT').toUpperCase();
  const searchPlaceholder = {
    PATIENT: 'Search medications, supplements, food interactions...',
    DOCTOR: 'Search patient by MRN, name, or medication...',
    PHARMACIST: 'Search prescription RX-ID, NDC code, or drug...',
    ADMIN: 'Search users, interaction rules, or audit logs...',
  }[currentRole] || 'Search medications, active ingredients, monographs...';

  const roleTitle = {
    PATIENT: 'MY HEALTH',
    DOCTOR: 'PHYSICIAN WORKSPACE',
    PHARMACIST: 'PHARMACY OPERATIONS',
    ADMIN: 'DRUGSAFE CONTROL CENTER',
  }[currentRole] || 'DRUGSAFE';

  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
        {/* Left: Mobile hamburger & Search bar trigger */}
        <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xl">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 -ml-1 rounded-lg md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Context pill on desktop */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-3xs font-mono font-bold uppercase tracking-wider">{roleTitle}</span>
          </div>

          {/* Command Palette Search Trigger Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full max-w-md flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 text-slate-400 dark:text-slate-400 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-left shadow-sm group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors shrink-0" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                {searchPlaceholder}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-3xs font-semibold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <span>Ctrl</span>
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right: Actions, Role Switcher, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Role Switcher Popover */}
          <RoleSwitcher />

          {/* Notification Center Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>

          {/* User Profile Mini Badge */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate">
                {currentUser?.name || 'Authorized User'}
              </p>
              <p className="text-3xs text-slate-400 dark:text-slate-500 font-medium truncate">
                {currentUser?.department || role || 'Clinical Team'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Global Medication Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

