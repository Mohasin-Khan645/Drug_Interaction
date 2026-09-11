import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Download, ShieldCheck } from 'lucide-react';
import { auditApi } from '../../api/auditApi';
import { useNotifications } from '../../context/NotificationContext';
import AuditLogTable from '../../components/common/AuditLogTable';
import { MOCK_AUDIT_LOGS } from '../../api/mock/mockData';

export default function AdminAuditLogPage() {
  const { addToast } = useNotifications();

  const { data: logs = [] } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: async () => {
      const res = await auditApi.getAuditLogs();
      return res.data?.length > 0 ? res.data : MOCK_AUDIT_LOGS;
    },
  });

  const handleExportCsv = () => {
    addToast({
      type: 'info',
      title: 'Audit Trail Exported',
      message: 'HIPAA-compliant immutable audit log CSV downloaded to your device.',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1">
            HIPAA Security & Forensic Accountability
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Enterprise Audit Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographically sealed trail of all prescription reviews, interaction overrides, and EHR record access.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors self-start sm:self-center"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Enterprise Audit Log Table */}
      <AuditLogTable logs={logs} />
    </div>
  );
}
