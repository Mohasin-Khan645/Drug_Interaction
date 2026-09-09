import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DISCLAIMER } from '../../lib/constants';
import { Spinner } from '../ui/Feedback';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  const { currentUser } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar
        role={currentUser && currentUser.role}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="border-t border-line bg-surface px-4 py-3 text-xs text-ink-muted sm:px-6">{DISCLAIMER}</footer>
      </div>
    </div>
  );
}
