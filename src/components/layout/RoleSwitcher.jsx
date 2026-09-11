import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Stethoscope, Pill, ChevronDown, Check } from 'lucide-react';

const ROLES_CONFIG = [
  {
    role: 'PATIENT',
    label: 'Patient',
    subtitle: 'Sarah Jenkins (Consumer View)',
    route: '/patient/dashboard',
    icon: UserCheck,
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
  {
    role: 'DOCTOR',
    label: 'Doctor',
    subtitle: 'Dr. Marcus Chen, MD (Clinical View)',
    route: '/doctor/dashboard',
    icon: Stethoscope,
    color: 'teal',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
  },
  {
    role: 'PHARMACIST',
    label: 'Pharmacist',
    subtitle: 'Elena Rostova, PharmD (Dispensing View)',
    route: '/pharmacist/dashboard',
    icon: Pill,
    color: 'cyan',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
  },
  {
    role: 'ADMIN',
    label: 'System Admin',
    subtitle: 'David Vance (Platform Operations)',
    route: '/admin/dashboard',
    icon: ShieldCheck,
    color: 'indigo',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  },
];

export default function RoleSwitcher({ className = '' }) {
  const { role, switchDemoRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const currentRole = (role || 'PATIENT').toUpperCase();
  const activeConfig = ROLES_CONFIG.find((r) => r.role === currentRole) || ROLES_CONFIG[0];
  const Icon = activeConfig.icon;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (targetRole, targetRoute) => {
    switchDemoRole(targetRole);
    setIsOpen(false);
    navigate(targetRoute);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-400 dark:hover:border-teal-500 shadow-sm transition-all focus:outline-none"
        title="Switch clinical perspective / active role"
      >
        <div className="w-5 h-5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="font-medium text-slate-500 dark:text-slate-400">Role:</span>
        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-2xs">
          {activeConfig.label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">
              Select Experience Perspective
            </p>
            <p className="text-3xs text-slate-500 mt-0.5">
              Instantly transitions UI to role-specific workflow & permissions
            </p>
          </div>

          <div className="p-1 space-y-1">
            {ROLES_CONFIG.map((item) => {
              const ItemIcon = item.icon;
              const isSelected = item.role === currentRole;

              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleSelectRole(item.role, item.route)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{item.label}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded text-3xs font-semibold bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-3xs text-slate-400 dark:text-slate-500 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

