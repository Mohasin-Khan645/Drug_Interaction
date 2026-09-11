import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import MainContent from './MainContent';
import NotificationPanel from './NotificationPanel';
import AIAssistant from '../clinical/AIAssistant';

export default function AppShell() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800 relative">
      {/* Original Dark Navy Clinical Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <TopNavbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <MainContent>
          <Outlet />
        </MainContent>

        {/* Floating MediSafe AI ChatBot in right corner, authorized across all 4 roles */}
        <AIAssistant />

        {/* Medication Safety Notifications Drawer */}
        <NotificationPanel />
      </div>
    </div>
  );
}
