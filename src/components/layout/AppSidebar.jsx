import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  ShieldAlert,
  UploadCloud,
  Search,
  FileText,
  User,
  Bell,
  Users,
  CheckSquare,
  GitMerge,
  Database,
  History,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  LogOut,
  Activity,
  HeartPulse,
  ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function AppSidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { role, currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const currentRole = (role || 'PATIENT').toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavSections = () => {
    switch (currentRole) {
      case 'DOCTOR':
        return [
          {
            title: 'WORKSPACE',
            items: [
              { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/doctor/patients', label: 'Patients', icon: Users, badge: '142' },
              { to: '/doctor/prescriptions', label: 'Prescriptions', icon: UploadCloud, badge: '8' },
            ],
          },
          {
            title: 'CLINICAL SAFETY',
            items: [
              { to: '/doctor/interactions', label: 'Interactions', icon: ShieldAlert },
              { to: '/doctor/reconciliation', label: 'Reconciliation', icon: GitMerge },
              { to: '/doctor/alerts', label: 'Alerts', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : '3' },
              { to: '/doctor/reports', label: 'Safety Reports', icon: FileText },
            ],
          },
          {
            title: 'ANALYTICS',
            items: [
              { to: '/doctor/analytics', label: 'Analytics', icon: BarChart3 },
              { to: '/doctor/profile', label: 'Profile', icon: User },
            ],
          },
        ];
      case 'PHARMACIST':
        return [
          {
            title: 'WORKSPACE',
            items: [
              { to: '/pharmacist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/pharmacist/prescriptions', label: 'Prescription Queue', icon: CheckSquare, badge: '14' },
              { to: '/pharmacist/dispensing', label: 'Dispensing Reviews', icon: ClipboardCheck, badge: '4' },
            ],
          },
          {
            title: 'MEDICATIONS',
            items: [
              { to: '/pharmacist/search', label: 'Medication Search', icon: Search },
              { to: '/pharmacist/interactions', label: 'Interaction Checker', icon: ShieldAlert },
              { to: '/pharmacist/medications', label: 'Patient Medications', icon: Pill },
            ],
          },
          {
            title: 'SAFETY',
            items: [
              { to: '/pharmacist/alerts', label: 'Safety Alerts', icon: Bell },
              { to: '/pharmacist/reports', label: 'Reports', icon: FileText },
              { to: '/pharmacist/profile', label: 'Profile', icon: User },
            ],
          },
        ];
      case 'ADMIN':
        return [
          {
            title: 'CONTROL CENTER',
            items: [
              { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/admin/users', label: 'Users', icon: Users, badge: '248' },
              { to: '/admin/patients', label: 'Patients', icon: User },
            ],
          },
          {
            title: 'KNOWLEDGE',
            items: [
              { to: '/admin/drugs', label: 'Drug Database', icon: Pill },
              { to: '/admin/rules', label: 'Interaction Rules', icon: ShieldCheck },
              { to: '/admin/evidence', label: 'Data Sources', icon: Database, badge: 'Active' },
            ],
          },
          {
            title: 'SYSTEM',
            items: [
              { to: '/admin/audit', label: 'Audit Logs', icon: History },
              { to: '/admin/alerts', label: 'System Alerts', icon: Bell },
              { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
              { to: '/admin/settings', label: 'Settings', icon: Settings },
            ],
          },
        ];
      case 'PATIENT':
      default:
        return [
          {
            title: null,
            items: [
              { to: '/patient/dashboard', label: 'Home', icon: LayoutDashboard },
              { to: '/patient/medications', label: 'My Medications', icon: Pill, badge: '4' },
              { to: '/patient/safety', label: 'Safety', icon: ShieldAlert },
              { to: '/patient/prescriptions', label: 'Prescriptions', icon: UploadCloud },
              { to: '/patient/reports', label: 'Reports', icon: FileText },
              { to: '/patient/profile', label: 'Profile', icon: User },
            ],
          },
        ];
    }
  };

  const navSections = getNavSections();

  const roleLabel = {
    PATIENT: 'MY HEALTH',
    DOCTOR: 'PHYSICIAN WORKSPACE',
    PHARMACIST: 'PHARMACY OPERATIONS',
    ADMIN: 'CONTROL CENTER',
  }[currentRole] || 'DRUGSAFE';

  const firstRoute = navSections[0]?.items[0]?.to || '/dashboard';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1428] text-slate-300 select-none border-r border-[#16233B]">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#16233B] shrink-0">
        <NavLink
          to={firstRoute}
          className="flex items-center gap-3 min-w-0"
          onClick={onCloseMobile}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
            <Pill className="w-5 h-5 -rotate-45" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="text-base font-black tracking-tight text-white flex items-center gap-0.5">
                DRUG<span className="text-teal-400">SAFE</span>
              </span>
              <p className="text-3xs uppercase tracking-widest text-slate-400 font-semibold truncate">
                Clinical Medication Safety
              </p>
            </div>
          )}
        </NavLink>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Role Indicator Banner */}
      {!isCollapsed && (
        <div className="px-4 py-2.5 bg-[#111C32] border-b border-[#16233B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-200">
              {roleLabel}
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            {currentRole}
          </span>
        </div>
      )}

      {/* Grouped Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && section.title && (
              <p className="px-3 pt-1 pb-1 text-3xs font-bold uppercase tracking-widest text-slate-500 font-mono">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                      isActive
                        ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20 font-bold'
                        : 'text-slate-300 hover:bg-[#111C32] hover:text-white'
                    }`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ItemIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-md text-3xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Continuous Safety Engine Status Indicator */}
      {!isCollapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-[#111C32] border border-[#16233B] text-slate-300">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse shrink-0" />
            <span className="text-2xs font-bold text-white uppercase tracking-wider">
              Safety Engine v2.4
            </span>
          </div>
          <p className="text-3xs text-slate-400 mt-1 leading-relaxed">
            Continuous screening against DailyMed, RxNorm, and FDA Labeling.
          </p>
        </div>
      )}

      {/* User Profile & Logout Footer */}
      <div className="p-3 border-t border-[#16233B] bg-[#0B1428] shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.name || 'User'}
                </p>
                <p className="text-3xs text-slate-400 truncate">
                  {currentUser?.email || 'Active Session'}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Sign out of DRUGSAFE"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-xs h-full bg-[#0B1428] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

