import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  GitMerge,
  AlertTriangle,
  Pill,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { reconciliationApi } from '../../api/reconciliationApi';
import { medicationApi } from '../../api/medicationApi';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

export default function MedicationReconciliationPage() {
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState(null);

  // Load medications
  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const res = await medicationApi.getMedications();
      return res.data || [];
    },
  });

  // Load discrepancies
  const { data: reconData } = useQuery({
    queryKey: ['reconciliation'],
    queryFn: async () => {
      const res = await reconciliationApi.runReconciliation({
        patientId: 'pt-101',
        medications,
      });
      return res.data;
    },
  });

  const discrepancies = reconData?.discrepancies || [];

  const existingRx = medications.filter((m) => m.source === 'Prescription');
  const existingOtc = medications.filter((m) => m.source === 'OTC');
  const existingSupp = medications.filter((m) => m.source === 'Supplement');

  const handleResolve = (resolution) => {
    addToast({
      title: 'Discrepancy Resolved',
      message: `Reconciliation note recorded: ${resolution}`,
      type: 'success',
    });
    setSelectedDiscrepancy(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Clinical Harmonization
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Medication Regimen Reconciliation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify duplicate active ingredients, conflicting hospital discharge regimens, and therapeutic overlaps.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={ArrowRight}
          onClick={() => navigate('/interactions')}
          className="text-xs font-bold"
        >
          Proceed to Safety Check
        </Button>
      </div>

      {/* Discrepancies Alert Banner */}
      {discrepancies.length > 0 && (
        <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/70 text-amber-950 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="text-sm font-bold text-amber-900">
              {discrepancies.length} Potential Medication Discrepancies Requiring Review
            </h3>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            The clinical reconciliation engine has detected potential duplicate therapy or conflicting records. In accordance with clinical safety protocols, no medications will be automatically altered or deleted.
          </p>
        </div>
      )}

      {/* Discrepancy Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-700" />
          <span>Active Discrepancy Queue</span>
        </h2>

        {discrepancies.map((disc) => (
          <Card key={disc.id} className="p-5 border-amber-200 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="amber" size="sm">
                    {disc.type === 'DUPLICATE_THERAPY' ? 'Duplicate Active Ingredient' : 'Conflicting Record'}
                  </Badge>
                  <h4 className="text-sm font-bold text-slate-900">{disc.title}</h4>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-teal-700" />
                    <strong>Agent A:</strong> {disc.primaryMedication}
                  </div>
                  <span className="text-slate-400">vs.</span>
                  <div className="flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-amber-700" />
                    <strong>Agent B:</strong> {disc.conflictingMedication}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Clinical Reason:</strong> {disc.reason}
                </p>
                <p className="text-2xs text-teal-900 font-semibold bg-teal-50 p-2 rounded border border-teal-200">
                  <strong>Recommendation:</strong> {disc.recommendation}
                </p>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setSelectedDiscrepancy(disc)}
                  className="text-xs font-semibold"
                >
                  Review Discrepancy
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 4 Categorized Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Prescription Medications */}
        <Card title="Prescription Medications" subtitle={`${existingRx.length} Active Records`}>
          <div className="space-y-2.5 text-xs">
            {existingRx.map((m) => (
              <div key={m.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">{m.medicationName}</span>
                <span className="text-2xs text-slate-500">{m.strength} • {m.frequency}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* OTC Medications */}
        <Card title="Over-the-Counter (OTC)" subtitle={`${existingOtc.length} Self-Administered`}>
          <div className="space-y-2.5 text-xs">
            {existingOtc.map((m) => (
              <div key={m.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">{m.medicationName}</span>
                <span className="text-2xs text-slate-500">{m.strength} • {m.frequency}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Dietary Supplements */}
        <Card title="Dietary & Herbal Supplements" subtitle={`${existingSupp.length} Documented`}>
          <div className="space-y-2.5 text-xs">
            {existingSupp.length === 0 ? (
              <p className="text-2xs text-slate-400 italic">No dietary supplements recorded.</p>
            ) : (
              existingSupp.map((m) => (
                <div key={m.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block">{m.medicationName}</span>
                  <span className="text-2xs text-slate-500">{m.strength} • {m.frequency}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Discrepancy Review Resolution Modal */}
      {selectedDiscrepancy && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDiscrepancy(null)}
          title="Resolve Medication Discrepancy"
          subtitle="Clinical decision recorded to patient history"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="text-slate-900 block mb-1">{selectedDiscrepancy.title}</strong>
              <p className="text-slate-600">{selectedDiscrepancy.reason}</p>
            </div>

            <p className="font-semibold text-slate-700">Select clinical action:</p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleResolve('Discontinue secondary duplicate product')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-colors"
              >
                <strong className="text-slate-900 block">Discontinue Duplicate Agent</strong>
                <span className="text-2xs text-slate-500">Stop secondary agent and counsel patient on single active ingredient.</span>
              </button>

              <button
                type="button"
                onClick={() => handleResolve('Maintain dual therapy under strict clinical surveillance')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-colors"
              >
                <strong className="text-slate-900 block">Maintain Under Close Monitoring</strong>
                <span className="text-2xs text-slate-500">Keep both agents with explicit daily dosage cap ceiling.</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
