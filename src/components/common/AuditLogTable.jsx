import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import { formatDate } from '../../utils/formatters';
import { ShieldCheck, UserCheck, Stethoscope, Pill, AlertTriangle, CheckCircle2, History } from 'lucide-react';

const ROLE_BADGES = {
  PATIENT: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  DOCTOR: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
  PHARMACIST: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
  ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
};

export default function AuditLogTable({ logs = [], className = '' }) {
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    if (roleFilter === 'ALL') return logs;
    return logs.filter((l) => l.userRole === roleFilter);
  }, [logs, roleFilter]);

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-3xs text-slate-500 dark:text-slate-400">
          {val ? new Date(val).toLocaleString() : 'Just now'}
        </span>
      ),
    },
    {
      key: 'userName',
      label: 'User & Identity',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white leading-tight">{val || 'System Engine'}</p>
          <span
            className={`inline-block px-1.5 py-0.2 rounded text-3xs font-semibold border mt-0.5 ${
              ROLE_BADGES[row.userRole] || 'bg-slate-100 text-slate-600'
            }`}
          >
            {row.userRole}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action Performed',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {val}
        </span>
      ),
    },
    {
      key: 'resource',
      label: 'Target Resource',
      render: (val, row) => (
        <span className="text-3xs font-mono text-slate-600 dark:text-slate-400">
          {val} {row.resourceId ? `(#${row.resourceId})` : ''}
        </span>
      ),
    },
    {
      key: 'patientRecord',
      label: 'Patient Record',
      render: (val) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'result',
      label: 'Result & Outcome',
      sortable: true,
      render: (val, row) => {
        const isFlag = val?.toLowerCase().includes('flag') || row.status === 'WARNING';
        const isFail = val?.toLowerCase().includes('fail') || row.status === 'CRITICAL';
        return (
          <span
            className={`inline-flex items-center gap-1 text-3xs font-bold px-2 py-0.5 rounded-full ${
              isFail
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                : isFlag
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            {isFail || isFlag ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            <span>{val || 'Completed'}</span>
          </span>
        );
      },
    },
    {
      key: 'ipAddress',
      label: 'IP / Terminal',
      render: (val) => (
        <span className="font-mono text-3xs text-slate-400">
          {val || '192.168.1.10'}
        </span>
      ),
    },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Role Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-white">
            Immutable Audit Trail
          </span>
        </div>

        <div className="flex items-center gap-1">
          {['ALL', 'DOCTOR', 'PHARMACIST', 'PATIENT', 'ADMIN'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-colors ${
                roleFilter === r
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredLogs}
        searchKey="action"
        searchPlaceholder="Filter by action or user (e.g. Safety Check, Prescription)..."
        pageSize={10}
        emptyTitle="No audit records found"
        emptyDescription="Audit records will appear here as users perform actions."
      />
    </div>
  );
}

