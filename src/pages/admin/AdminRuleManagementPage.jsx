import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Layers,
  Edit2,
  PowerOff,
  Power,
  History,
  AlertTriangle,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SeverityBadge from '../../components/common/SeverityBadge';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { MOCK_INTERACTIONS_RULES } from '../../api/mock/mockData';

export default function AdminRuleManagementPage() {
  const queryClient = useQueryClient();
  const { addToast } = useNotifications();

  const [activeTypeFilter, setActiveTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRuleHistory, setSelectedRuleHistory] = useState(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['admin-rules'],
    queryFn: async () => {
      const res = await adminApi.getRules();
      return res.data?.length > 0 ? res.data : MOCK_INTERACTIONS_RULES;
    },
  });

  const filteredRules = rules.filter((r) => {
    if (activeTypeFilter !== 'ALL' && r.ruleType !== activeTypeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.primaryDrugId.toLowerCase().includes(q) ||
        r.secondaryEntity.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const ruleTypeLabels = {
    DRUG_DRUG: 'Drug-Drug',
    DRUG_DISEASE: 'Drug-Disease',
    DRUG_ALLERGY: 'Drug-Allergy',
    DUPLICATION: 'Duplication',
    PATIENT_FACTOR: 'Patient Factor',
  };

  const columns = [
    {
      header: 'Rule ID',
      accessor: 'id',
      render: (r) => <span className="font-mono text-2xs font-bold text-slate-700">{r.id}</span>,
    },
    {
      header: 'Rule Type',
      accessor: 'ruleType',
      render: (r) => (
        <Badge variant="teal" size="sm">
          {ruleTypeLabels[r.ruleType] || r.ruleType}
        </Badge>
      ),
    },
    {
      header: 'Primary & Secondary Entity',
      accessor: 'primaryDrugId',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">{r.title}</span>
          <span className="text-2xs text-slate-500">
            {r.primaryDrugId} ↔ {r.secondaryEntity}
          </span>
        </div>
      ),
    },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (r) => <SeverityBadge severity={r.severity} size="sm" />,
    },
    {
      header: 'Source & Evidence',
      accessor: 'source',
      render: (r) => (
        <div>
          <span className="text-xs text-slate-700 font-medium block truncate max-w-[180px]">
            {r.source}
          </span>
          <span className="text-3xs text-slate-400">{r.evidenceLevel}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => (
        <Badge variant={r.status === 'ACTIVE' ? 'emerald' : 'slate'} size="sm">
          {r.status || 'ACTIVE'}
        </Badge>
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
            variant="ghost"
            onClick={() => setSelectedRuleHistory(r)}
            className="p-1 text-slate-500"
            title="View History"
          >
            <History className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              addToast({
                title: 'Rule Status Toggled',
                message: `${r.id} status updated.`,
                type: 'info',
              })
            }
            className="p-1 text-slate-500"
            title="Toggle Status"
          >
            {r.status === 'ACTIVE' ? (
              <Power className="w-4 h-4 text-emerald-600" />
            ) : (
              <PowerOff className="w-4 h-4 text-slate-400" />
            )}
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
            Clinical Logic Repository
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Safety Rules Engine Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Drug-Drug, Drug-Disease, Drug-Allergy, Duplication, and Patient-Factor decision logic.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          icon={Plus}
          className="text-xs font-bold"
        >
          Create Safety Rule
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rules by entity, title, or ID..."
            className="w-full text-xs rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'DRUG_DRUG', 'DRUG_DISEASE', 'DRUG_ALLERGY', 'DUPLICATION', 'PATIENT_FACTOR'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTypeFilter === type
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' ? 'All Rule Types' : ruleTypeLabels[type] || type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={filteredRules} />

      {/* Rule History Modal */}
      {selectedRuleHistory && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRuleHistory(null)}
          title={`Version History & Audit: ${selectedRuleHistory.id}`}
          subtitle={selectedRuleHistory.title}
          size="md"
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 block text-2xs uppercase">Current Version</span>
              <strong className="text-slate-800">Version 2.4 (Active)</strong>
              <p className="text-slate-600">{selectedRuleHistory.clinicalEffect}</p>
            </div>

            <h4 className="font-bold text-slate-800 pt-2">Audit Changes:</h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded border border-slate-100 bg-white">
                <span className="text-3xs text-slate-400">Sep 08, 2026 by David Vance</span>
                <p className="text-2xs text-slate-700">Severity escalated from MAJOR to CRITICAL based on updated FDA labeling.</p>
              </div>
              <div className="p-2.5 rounded border border-slate-100 bg-white">
                <span className="text-3xs text-slate-400">May 12, 2026 by Dr. Marcus Chen</span>
                <p className="text-2xs text-slate-700">Initial clinical rule ingestion from RxNorm and DailyMed ontology.</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Rule Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Clinical Safety Rule"
          subtitle="Define interaction criteria, severity, and evidence citations"
          size="lg"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  addToast({ title: 'Rule Created', message: 'New safety rule deployed.', type: 'success' });
                  setIsCreateModalOpen(false);
                }}
              >
                Deploy Rule
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Select
              label="Rule Classification"
              options={[
                { value: 'DRUG_DRUG', label: 'Drug-Drug Interaction' },
                { value: 'DRUG_DISEASE', label: 'Drug-Disease Precaution' },
                { value: 'DRUG_ALLERGY', label: 'Drug-Allergy Cross-Reactivity' },
                { value: 'DUPLICATION', label: 'Therapeutic Duplication' },
                { value: 'PATIENT_FACTOR', label: 'Patient Organ Dosing Factor' },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Primary Medication / Identifier" placeholder="e.g. Warfarin" />
              <Input label="Interacting Entity" placeholder="e.g. Aspirin, CKD, or Penicillin" />
            </div>
            <Select
              label="Severity Rating"
              options={['CRITICAL', 'MAJOR', 'MODERATE', 'MINOR', 'INFORMATIONAL']}
            />
            <Input label="Clinical Effect Title" placeholder="e.g. Severe Hemorrhage Risk" />
            <Input label="Pharmacological Mechanism" placeholder="e.g. Additive platelet and clotting factor inhibition" />
            <Input label="Evidence Source" placeholder="e.g. DailyMed / FDA SPL Labeling" />
          </div>
        </Modal>
      )}
    </div>
  );
}
