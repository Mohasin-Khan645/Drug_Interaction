import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { cx } from '../../lib/format';
import { navigationForRole } from '../../lib/navigation';
import { ROLE_LABELS } from '../../lib/constants';

function NavItems({ role, onNavigate }) {
  return (
    <nav aria-label="Main navigation" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {navigationForRole(role).map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-muted hover:bg-slate-100 hover:text-ink'
              )
            }
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function Sidebar({ role, mobileOpen, onCloseMobile }) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="border-b border-line px-4 py-4">
          <Logo />
        </div>
        <NavItems role={role} />
        <div className="border-t border-line px-4 py-3 text-xs text-ink-muted">
          Signed in as {ROLE_LABELS[role] || role}
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-slate-900/30" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface shadow-panel">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <Logo />
              <Button variant="ghost" size="icon" onClick={onCloseMobile} aria-label="Close navigation">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <NavItems role={role} onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}
