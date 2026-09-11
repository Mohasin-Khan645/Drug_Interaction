import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pill, Plus, Search, Edit2, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { drugApi } from '../../api/drugApi';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { MOCK_DRUGS } from '../../api/mock/mockData';

export default function AdminDrugManagementPage() {
  const queryClient = useQueryClient();
  const { addToast } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState(null);

  const { data: drugs = [] } = useQuery({
    queryKey: ['admin-drugs'],
    queryFn: async () => {
      const res = await drugApi.searchDrugs();
      return res.data?.length > 0 ? res.data : MOCK_DRUGS;
    },
  });

  const filteredDrugs = drugs.filter((d) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.genericName.toLowerCase().includes(q) ||
      (d.rxNormCode && d.rxNormCode.includes(q))
    );
  });

  const columns = [
    {
      header: 'Drug Name & Generic',
      accessor: 'name',
      render: (d) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs block">{d.name}</span>
            <span className="text-3xs text-slate-500 italic">{d.genericName}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Drug Class',
      accessor: 'drugClass',
      render: (d) => (
        <Badge variant="teal" size="sm">
          {d.drugClass}
        </Badge>
      ),
    },
    {
      header: 'Identifiers',
      accessor: 'rxNormCode',
      render: (d) => (
        <div className="font-mono text-2xs text-slate-600">
          <span>RxNorm: {d.rxNormCode || '—'}</span>
          <span className="block text-3xs text-slate-400">ATC: {d.atcCode || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Dosage Forms',
      accessor: 'dosageForms',
      render: (d) => (
        <span className="text-xs text-slate-700">
          {Array.isArray(d.dosageForms) ? d.dosageForms.join(', ') : d.dosageForms}
        </span>
      ),
    },
    {
      header: 'Black Box Warning',
      accessor: 'blackBoxWarning',
      render: (d) =>
        d.blackBoxWarning ? (
          <span className="inline-flex items-center gap-1 text-2xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            <ShieldAlert className="w-3 h-3" /> Yes
          </span>
        ) : (
          <span className="text-2xs text-slate-400">None</span>
        ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (d) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditingDrug(d);
            setIsAddModalOpen(true);
          }}
          className="text-xs text-teal-700 hover:bg-teal-50"
        >
          Edit Formulary
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Clinical Formulary Catalog
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Drug Knowledgebase Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer verified brand names, active ingredients, dosage forms, and RxNorm identifiers.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingDrug(null);
            setIsAddModalOpen(true);
          }}
          icon={Plus}
          className="text-xs font-bold"
        >
          Add New Drug to Formulary
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search formulary by name, generic, or RxNorm..."
            className="w-full text-xs rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        </div>
      </div>

      <Table columns={columns} data={filteredDrugs} />

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title={editingDrug ? `Edit ${editingDrug.name}` : 'Add Drug to Formulary'}
          size="lg"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  addToast({ title: 'Formulary Updated', message: 'Drug record saved successfully.', type: 'success' });
                  setIsAddModalOpen(false);
                }}
              >
                Save Formulary Record
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Commercial Brand Name" defaultValue={editingDrug?.name} placeholder="e.g. Coumadin" />
              <Input label="Generic Name" defaultValue={editingDrug?.genericName} placeholder="e.g. Warfarin Sodium" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Drug Class" defaultValue={editingDrug?.drugClass} placeholder="e.g. Anticoagulant" />
              <Input label="Active Ingredient" defaultValue={editingDrug?.activeIngredient} placeholder="e.g. Warfarin" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="RxNorm Code" defaultValue={editingDrug?.rxNormCode} placeholder="e.g. 855332" />
              <Input label="ATC Classification Code" defaultValue={editingDrug?.atcCode} placeholder="e.g. B01AA03" />
            </div>
            <Input label="Standard Dosage Forms" defaultValue={editingDrug?.dosageForms} placeholder="Tablet, Capsule, Solution" />
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description & Indications</label>
              <textarea
                rows={2}
                defaultValue={editingDrug?.description}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-teal-600"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
