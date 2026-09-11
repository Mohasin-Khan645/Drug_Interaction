import React from 'react';
import { NavLink } from 'react-router-dom';
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
  BookOpen,
  Database,
  History,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPortalDashboardPath, ROLE_METADATA } from '../../constants/roles';

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { role } = useAuth();
  const currentRole = (role || 'PATIENT').toUpperCase();

  const getNavItems = () => {
    switch (currentRole) {
      case 'DOCTOR':
        return [
          { to: '/portal/doctor/dashboard', label: 'Clinical Dashboard', icon: LayoutDashboard },
          { to: '/portal/doctor/patients', label: 'Assigned Patients', icon: Users },
          { to: '/portal/doctor/reviews', label: 'Clinical Review Queue', icon: CheckSquare, badge: '2' },
          { to: '/portal/doctor/interactions', label: 'Multi-Drug Checker', icon: ShieldAlert },
          { to: '/portal/doctor/reconciliation', label: 'Medication Reconciliation', icon: GitMerge },
          { to: '/portal/doctor/prescriptions', label: 'Electronic Prescriptions', icon: UploadCloud },
          { to: '/portal/doctor/search', label: 'Drug Monograph Database', icon: Search },
          { to: '/portal/doctor/reports', label: 'Clinical Safety Reports', icon: FileText },
          { to: '/portal/doctor/alerts', label: 'Clinical Alerts', icon: Bell, badge: '3' },
          { to: '/portal/doctor/profile', label: 'Provider Profile', icon: User },
        ];
      case 'PHARMACIST':
        return [
          { to: '/portal/pharmacist/dashboard', label: 'Pharmacy Dashboard', icon: LayoutDashboard },
          { to: '/portal/pharmacist/dispensing', label: 'Dispensing Review Queue', icon: CheckSquare, badge: '4' },
          { to: '/portal/pharmacist/prescriptions', label: 'Prescription OCR Intake', icon: UploadCloud },
          { to: '/portal/pharmacist/medications', label: 'Medication Registry', icon: Pill },
          { to: '/portal/pharmacist/reconciliation', label: 'Medication Reconciliation', icon: GitMerge },
          { to: '/portal/pharmacist/interactions', label: 'Safety Screener', icon: ShieldAlert },
          { to: '/portal/pharmacist/search', label: 'Drug Catalog & NDC', icon: Search },
          { to: '/portal/pharmacist/reports', label: 'Dispensing Reports', icon: FileText },
          { to: '/portal/pharmacist/alerts', label: 'Safety Alerts', icon: Bell },
          { to: '/portal/pharmacist/profile', label: 'Staff Profile', icon: User },
        ];
      case 'ADMIN':
        return [
          { to: '/portal/admin/dashboard', label: 'System Overview', icon: LayoutDashboard },
          { to: '/portal/admin/users', label: 'User Directory & RBAC', icon: Users },
          { to: '/portal/admin/patients', label: 'Master Patient Index', icon: Users },
          { to: '/portal/admin/drugs', label: 'Drug Formulary', icon: Pill },
          { to: '/portal/admin/rules', label: 'Safety Rules Engine', icon: ShieldCheck },
          { to: '/portal/admin/evidence', label: 'Evidence Sources', icon: Database },
          { to: '/portal/admin/audit', label: 'Audit Trail', icon: History },
          { to: '/portal/admin/analytics', label: 'Clinical Analytics', icon: BarChart3 },
          { to: '/portal/admin/settings', label: 'Platform Settings', icon: Settings },
        ];
      case 'PATIENT':
      default:
        return [
          { to: '/portal/patient/dashboard', label: 'My Health Dashboard', icon: LayoutDashboard },
          { to: '/portal/patient/medications', label: 'My Medications', icon: Pill },
          { to: '/portal/patient/safety', label: 'Safety & Interactions', icon: ShieldAlert },
          { to: '/portal/patient/prescriptions', label: 'Upload Prescription', icon: UploadCloud },
          { to: '/portal/patient/search', label: 'Medication Guide', icon: Search },
          { to: '/portal/patient/reports', label: 'Safety Reports', icon: FileText },
          { to: '/portal/patient/alerts', label: 'My Alerts', icon: Bell, badge: '1' },
          { to: '/portal/patient/profile', label: 'Medical Profile', icon: User },
        ];
    }
  };

  const navItems = getNavItems();
  const roleMeta = ROLE_METADATA[currentRole] || {
    portalName: 'DrugSafe Portal',
    themeColor: 'teal',
  };

  const getRoleTheme = () => {
    switch (currentRole) {
      case 'DOCTOR':
        return {
          activeClass: 'bg-blue-700 text-white shadow-sm font-semibold',
          badgeClass: 'bg-blue-950/90 text-blue-300 border border-blue-600/50',
          portalBadge: 'bg-blue-950/80 border-blue-700/60 text-blue-300',
        };
      case 'PHARMACIST':
        return {
          activeClass: 'bg-emerald-700 text-white shadow-sm font-semibold',
          badgeClass: 'bg-emerald-950/90 text-emerald-300 border border-emerald-600/50',
          portalBadge: 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300',
        };
      case 'ADMIN':
        return {
          activeClass: 'bg-purple-700 text-white shadow-sm font-semibold',
          badgeClass: 'bg-purple-950/90 text-purple-300 border border-purple-600/50',
          portalBadge: 'bg-purple-950/80 border-purple-700/60 text-purple-300',
        };
      case 'PATIENT':
      default:
        return {
          activeClass: 'bg-teal-700 text-white shadow-sm font-semibold',
          badgeClass: 'bg-teal-950/90 text-teal-300 border border-teal-600/50',
          portalBadge: 'bg-teal-950/80 border-teal-700/60 text-teal-300',
        };
    }
  };

  const roleTheme = getRoleTheme();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        <NavLink
          to={getPortalDashboardPath(currentRole)}
          className="flex items-center gap-2.5 min-w-0"
          onClick={onCloseMobile}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Pill className="w-5 h-5 -rotate-45" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="text-base font-black tracking-tight text-white flex items-center gap-0.5">
                DRUG<span className="text-teal-400">SAFE</span>
              </span>
              <p className="text-3xs uppercase tracking-widest text-slate-400 font-semibold truncate">
                Clinical Safety
              </p>
            </div>
          )}
        </NavLink>

        {/* Collapse toggle (tablet & desktop) */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Authoritative Active Portal Badge */}
      {!isCollapsed && (
        <div className="px-4 py-3 bg-slate-800/40 border-b border-slate-800/80">
          <div className="flex items-center justify-between gap-2">
            <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 truncate">
              Active Portal
            </span>
            <span
              className={`px-2 py-0.5 rounded text-2xs font-semibold border truncate ${roleTheme.portalBadge}`}
            >
              {roleMeta.portalName}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors group relative ${
                  isActive
                    ? roleTheme.activeClass
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-2xs font-bold ${roleTheme.badgeClass}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Safety Engine Status */}
      {!isCollapsed && (
        <div className="p-3 mx-2 mb-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-2xs space-y-1.5 shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Safety Engine Online</span>
          </div>
          <p className="text-slate-400 leading-tight">
            Connected to RxNorm, DailyMed & FDA clinical rules.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out border-r border-slate-800 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
