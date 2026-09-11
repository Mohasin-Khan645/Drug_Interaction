import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Pill,
  Plus,
  ShieldCheck,
  Edit3,
  Trash2,
  Filter,
  Search,
  UploadCloud,
  GitMerge,
  Eye,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { medicationApi } from '../../api/medicationApi';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import AddMedicationModal from './AddMedicationModal';
import { formatDate } from '../../utils/formatters';

export default function MedicationListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useNotifications();

  const [activeSourceFilter, setActiveSourceFilter] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [deletingMedication, setDeletingMedication] = useState(null);

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const res = await medicationApi.getMedications();
      return res.data || [];
    },
  });

  const addOrUpdateMutation = useMutation({
    mutationFn: async (medData) => {
      if (editingMedication) {
        return medicationApi.updateMedication(editingMedication.id, medData);
      }
      return medicationApi.addMedication(medData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      addToast({
        title: editingMedication ? 'Medication Updated' : 'Medication Registered',
        message: 'Patient medication list synchronized.',
        type: 'success',
      });
      setEditingMedication(null);
      setIsAddModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return medicationApi.deleteMedication(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      addToast({
        title: 'Medication Removed',
        message: `${deletingMedication?.medicationName} removed from active regimen.`,
        type: 'info',
      });
      setDeletingMedication(null);
    },
  });

  const filteredMedications = medications.filter((m) => {
    if (activeSourceFilter !== 'ALL' && m.source !== activeSourceFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        m.medicationName.toLowerCase().includes(q) ||
        (m.genericName && m.genericName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const sourceBadges = {
    Prescription: 'teal',
    OTC: 'blue',
    Supplement: 'emerald',
    Manual: 'slate',
  };

  const columns = [
    {
      header: 'Medication',
      accessor: 'medicationName',
      render: (m) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs block">
              {m.medicationName}
            </span>
            <span className="text-2xs text-slate-400 font-mono">
              {m.rxNormCode ? `RxNorm: ${m.rxNormCode}` : ''}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Generic Name',
      accessor: 'genericName',
      render: (m) => (
        <span className="text-xs text-slate-600 italic">
          {m.genericName || '—'}
        </span>
      ),
    },
    {
      header: 'Strength & Form',
      accessor: 'strength',
      render: (m) => (
        <div className="text-xs text-slate-700 font-medium">
          {m.strength}
          {m.form && <span className="text-slate-400 block text-2xs">{m.form} • {m.frequency}</span>}
        </div>
      ),
    },
    {
      header: 'Source',
      accessor: 'source',
      render: (m) => (
        <Badge variant={sourceBadges[m.source] || 'slate'} size="sm">
          {m.source}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (m) => (
        <span className="inline-flex items-center gap-1 text-2xs font-semibold text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {m.status || 'Active'}
        </span>
      ),
    },
    {
      header: 'Added Date',
      accessor: 'addedDate',
      render: (m) => (
        <span className="text-xs text-slate-600">
          {formatDate(m.addedDate || m.startDate)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/interactions?prefill=${encodeURIComponent(m.medicationName)}`)}
            title="Check Safety"
            className="p-1.5 text-teal-700 hover:bg-teal-50"
          >
            <ShieldCheck className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingMedication(m);
              setIsAddModalOpen(true);
            }}
            title="Edit"
            className="p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <button
            type="button"
            onClick={() => setDeletingMedication(m)}
            title="Remove from regimen"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
            Regimen Surveillance
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Complete Medication Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active patient medications tracked across prescription, over-the-counter, and dietary supplement categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/medications/reconciliation')}
            icon={GitMerge}
            className="text-xs"
          >
            Reconciliation
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/prescriptions')}
            icon={UploadCloud}
            className="text-xs"
          >
            Upload Prescription
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingMedication(null);
              setIsAddModalOpen(true);
            }}
            icon={Plus}
            className="text-xs"
          >
            Add Medication
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="search"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search medications..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        </div>

        {/* Source Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Prescription', 'OTC', 'Supplement', 'Manual'].map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveSourceFilter(src)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeSourceFilter === src
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {src === 'ALL' ? 'All Sources' : src}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : (
        <Table
          columns={columns}
          data={filteredMedications}
          emptyMessage="No medications currently registered in this category."
        />
      )}

      {/* Add / Edit Modal */}
      <AddMedicationModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMedication(null);
        }}
        onSubmitMedication={(data) => addOrUpdateMutation.mutateAsync(data)}
        initialData={editingMedication}
        isLoading={addOrUpdateMutation.isPending}
      />

      {/* Confirm Deletion Dialog (Requirement: Do not automatically delete medications) */}
      <ConfirmDialog
        isOpen={!!deletingMedication}
        onClose={() => setDeletingMedication(null)}
        onConfirm={() => deleteMutation.mutate(deletingMedication?.id)}
        title="Remove Medication from Regimen"
        description={`Are you sure you want to remove ${deletingMedication?.medicationName} (${deletingMedication?.strength})? This will archive the record and exclude it from future clinical safety evaluations.`}
        confirmText="Remove Medication"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
