import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Pill,
  ShieldCheck,
  Activity,
  AlertOctagon,
  ShieldAlert,
  Database,
  ArrowRight,
  TrendingUp,
  History,
  Lock,
  Cpu,
  RefreshCw,
  Sliders,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { adminApi } from '../../api/adminApi';
import { userApi } from '../../api/userApi';
import Button from '../../components/common/Button';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: analyticsRes } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await adminApi.getSystemAnalytics();
      return res.data;
    },
  });

  const { data: usersRes } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await userApi.getUsers();
      return res.data || [];
    },
  });

  const checkVolumeData = [
    { name: 'Mon', checks: 420, critical: 8 },
    { name: 'Tue', checks: 580, critical: 12 },
    { name: 'Wed', checks: 740, critical: 19 },
    { name: 'Thu', checks: 890, critical: 15 },
    { name: 'Fri', checks: 1100, critical: 24 },
    { name: 'Sat', checks: 350, critical: 6 },
    { name: 'Sun', checks: 280, critical: 4 },
  ];

  const recentAuditEvents = [
    {
      id: 'aud-1',
      action: 'IDOR_BLOCK_LOGGED',
      description: 'Cross-patient medical chart lookup rejected with HTTP 403',
      actor: 'Sarah Jenkins (PATIENT)',
      timestamp: '2 mins ago',
      severity: 'HIGH',
    },
    {
      id: 'aud-2',
      action: 'CLINICIAN_OVERRIDE',
      description: 'Documented clinical rationale for Warfarin + Aspirin co-therapy',
      actor: 'Dr. Marcus Chen (DOCTOR)',
      timestamp: '14 mins ago',
      severity: 'MEDIUM',
    },
    {
      id: 'aud-3',
      action: 'MFA_SESSION_VERIFIED',
      description: 'Two-factor time-based one-time password confirmed',
      actor: 'Elena Rostova (PHARMACIST)',
      timestamp: '42 mins ago',
      severity: 'INFO',
    },
    {
      id: 'aud-4',
      action: 'KNOWLEDGEBASE_SYNC',
      description: 'DailyMed & RxNorm v2026.08 clinical rule set verified',
      actor: 'System Daemon',
      timestamp: '2 hours ago',
      severity: 'INFO',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Administrative Control Center Hero Banner (Deep Purple / Indigo) */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden border border-purple-900/60 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/80 border border-purple-600/60 text-purple-300 mb-3">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              <span>Clinical Safety Governance & Platform Operations · Tier-1 Security</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Platform Command Center
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-2xl leading-relaxed">
              David Vance · Platform Administrator · Real-time multi-role RBAC enforcement, clinical rules engine telemetry, and immutable audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/portal/admin/rules"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Cpu className="w-4 h-4" />
              <span>Safety Rules Engine</span>
            </Link>
            <Link
              to="/portal/admin/users"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500 text-white font-semibold text-xs transition-all"
            >
              <Users className="w-4 h-4 text-purple-300" />
              <span>User Directory</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Platform Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registered Platform Users
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">1,248</span>
            <p className="text-xs text-purple-700 font-semibold mt-1">
              4 Authoritative Portals
            </p>
          </div>
        </div>

        {/* Safety Checks (24h) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Safety Checks (24h)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">4,820</span>
            <p className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12% from yesterday
            </p>
          </div>
        </div>

        {/* Active Clinical Rules */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Clinical Safety Rules
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">318</span>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              RxNorm & DailyMed Synced
            </p>
          </div>
        </div>

        {/* Security Uptime */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Security Anomaly Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">0.00%</span>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              100% IDOR Isolation Passing
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Admin Layout: Safety Check Volume & Live Audit Trail Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Safety Screening Activity Graph */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-700" />
                Clinical Safety Screening Volume (7-Day)
              </h2>
              <p className="text-xs text-slate-500">
                Total drug-drug checks executed vs. critical alerts generated
              </p>
            </div>
            <Link
              to="/portal/admin/analytics"
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="checks" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Checks Run" />
                <Bar dataKey="critical" fill="#ef4444" radius={[4, 4, 0, 0]} name="Critical Flags" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right (5 cols): Live Immutable Security & Audit Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-purple-700" />
                Security & Audit Trail
              </h2>
              <p className="text-xs text-slate-500">
                Immutable compliance event stream
              </p>
            </div>
            <Link
              to="/portal/admin/audit"
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              <span>Export Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {recentAuditEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:border-purple-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono text-3xs">
                    {evt.action}
                  </span>
                  <span className="text-3xs text-slate-400">{evt.timestamp}</span>
                </div>
                <p className="text-xs text-slate-700 mt-1 font-medium leading-tight">
                  {evt.description}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-3xs text-slate-500">
                  <span>Actor: {evt.actor}</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded ${
                      evt.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-800'
                        : evt.severity === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {evt.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
