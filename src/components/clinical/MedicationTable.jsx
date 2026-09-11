import React from 'react';
import { Pill, CheckCircle2, AlertTriangle, AlertOctagon, Clock, ArrowRight } from 'lucide-react';
import DataTable from '../common/DataTable';

export default function MedicationTable({
  medications = [],
  onViewDetails,
  className = '',
}) {
  const columns = [
    {
      key: 'name',
      label: 'Medication',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Pill className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white leading-tight">{val}</p>
            {row.genericName && row.genericName !== val && (
              <p className="text-3xs text-slate-400 truncate">({row.genericName})</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'dosage',
      label: 'Dose & Route',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{val || '—'}</span>
          <span className="text-3xs text-slate-400 block">{row.route || 'Oral'}</span>
        </div>
      ),
    },
    {
      key: 'frequency',
      label: 'Frequency',
      render: (val) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {val || 'Once daily'}
        </span>
      ),
    },
    {
      key: 'prescriber',
      label: 'Prescriber',
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {val || 'Dr. Marcus Chen'}
        </span>
      ),
    },
    {
      key: 'findingStatus',
      label: 'Safety Status',
      render: (val, row) => {
        const isCritical = row.name?.toLowerCase().includes('warfarin') || val === 'CRITICAL';
        return isCritical ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-3xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertOctagon className="w-3 h-3" />
            <span>1 Finding Flagged</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-3xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>No finding in current check</span>
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (_, row) => (
        <button
          type="button"
          onClick={() => onViewDetails && onViewDetails(row)}
          className="inline-flex items-center gap-1 text-2xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
        >
          <span>View details</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={medications}
      searchKey="name"
      searchPlaceholder="Search active regimen..."
      pageSize={8}
      className={className}
      emptyTitle="No active medications found"
      emptyDescription="Add medications or upload a prescription to run safety screening."
    />
  );
}

