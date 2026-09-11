import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, Printer, ShieldCheck, Share2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { formatDate } from '../../utils/formatters';

export default function ReportListPage() {
  const navigate = useNavigate();

  const mockReports = [
    {
      id: 'DS-2026-9812',
      patientName: 'Sarah Jenkins',
      mrn: 'MRN-84920',
      createdAt: '2026-09-09T08:12:00Z',
      status: 'VERIFIED',
      reviewedStatus: 'REVIEWED_BY_PHYSICIAN',
      reviewer: 'Dr. Marcus Chen, MD',
      findingsCount: 3,
      criticalCount: 1,
    },
    {
      id: 'DS-2026-9740',
      patientName: 'Robert Martinez',
      mrn: 'MRN-72314',
      createdAt: '2026-09-04T16:20:00Z',
      status: 'VERIFIED',
      reviewedStatus: 'REVIEWED_BY_PHARMACIST',
      reviewer: 'Elena Rostova, PharmD',
      findingsCount: 1,
      criticalCount: 0,
    },
    {
      id: 'DS-2026-9655',
      patientName: 'Sarah Jenkins',
      mrn: 'MRN-84920',
      createdAt: '2026-08-15T11:30:00Z',
      status: 'ARCHIVED',
      reviewedStatus: 'ACKNOWLEDGED',
      reviewer: 'Dr. Marcus Chen, MD',
      findingsCount: 2,
      criticalCount: 0,
    },
  ];

  const columns = [
    {
      header: 'Report ID',
      accessor: 'id',
      render: (r) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-700" />
          <span className="font-mono font-bold text-slate-900 text-xs">{r.id}</span>
        </div>
      ),
    },
    {
      header: 'Patient',
      accessor: 'patientName',
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{r.patientName}</span>
          <span className="text-3xs text-slate-400 font-mono">{r.mrn}</span>
        </div>
      ),
    },
    {
      header: 'Created Date',
      accessor: 'createdAt',
      render: (r) => <span className="text-xs text-slate-600">{formatDate(r.createdAt)}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => (
        <Badge variant={r.status === 'VERIFIED' ? 'emerald' : 'slate'} size="sm">
          {r.status}
        </Badge>
      ),
    },
    {
      header: 'Clinical Review Status',
      accessor: 'reviewedStatus',
      render: (r) => (
        <div>
          <span className="text-xs font-semibold text-teal-800 block">
            {r.reviewedStatus.replace(/_/g, ' ')}
          </span>
          <span className="text-3xs text-slate-400">{r.reviewer}</span>
        </div>
      ),
    },
    {
      header: 'Findings',
      accessor: 'findingsCount',
      render: (r) => (
        <span className="text-xs font-medium text-slate-700">
          {r.findingsCount} findings {r.criticalCount > 0 && <strong className="text-red-700">({r.criticalCount} Critical)</strong>}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/reports/${r.id}`)}
            icon={Eye}
            className="text-xs"
          >
            View / Print PDF
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Clinical Documentation
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Safety & Clinical Intelligence Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Archived medication safety evaluations, physician attestations, and printable PDF records.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/interactions')}
          icon={FileText}
          className="text-xs font-bold"
        >
          Generate New Safety Report
        </Button>
      </div>

      <Table columns={columns} data={mockReports} />
    </div>
  );
}
