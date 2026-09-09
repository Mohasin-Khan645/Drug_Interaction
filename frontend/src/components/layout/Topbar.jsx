import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, LogOut, Menu, Search, User } from 'lucide-react';
import { alertApi } from '../../api/alertApi';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../lib/constants';
import { initials } from '../../lib/format';
import { Button } from '../ui/Button';
import { Logo } from './Logo';
import { NotificationDrawer } from './NotificationDrawer';

export function Topbar({ onOpenMobileNav }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const menuRef = useRef(null);

  const unread = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => alertApi.list({ unreadOnly: true, limit: 1 }),
    refetchInterval: 60000,
  });
  const unreadCount = (unread.data && unread.data.pagination && unread.data.pagination.total) || 0;

  useEffect(() => {
    const onClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileNav} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="lg:hidden">
        <Logo compact />
      </div>

      <Link
        to="/drugs"
        className="ml-auto hidden items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-ink-muted transition-colors hover:border-brand-400 hover:text-ink sm:flex lg:ml-0 lg:w-72"
      >
        <Search aria-hidden="true" className="h-4 w-4" />
        Search the drug catalog
      </Link>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={() => setAlertsOpen(true)} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {initials(currentUser && currentUser.name)}
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-medium text-ink">{currentUser && currentUser.name}</span>
              <span className="block text-xs text-ink-muted">{ROLE_LABELS[currentUser && currentUser.role]}</span>
            </span>
          </button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 mt-1 w-48 rounded-lg border border-line bg-surface p-1 shadow-panel">
              <Link
                role="menuitem"
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink hover:bg-slate-100"
              >
                <User aria-hidden="true" className="h-4 w-4" />
                Profile
              </Link>
              <button
                role="menuitem"
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink hover:bg-slate-100"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <NotificationDrawer open={alertsOpen} onClose={() => setAlertsOpen(false)} />
    </header>
  );
}
