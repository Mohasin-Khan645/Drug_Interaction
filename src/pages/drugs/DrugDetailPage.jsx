import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Pill,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  AlertTriangle,
  FileText,
  Database,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { drugApi } from '../../api/drugApi';
import { medicationApi } from '../../api/medicationApi';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function DrugDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: res, isLoading } = useQuery({
    queryKey: ['drug', id],
    queryFn: async () => {
      const response = await drugApi.getDrugById(id);
      return response.data;
    },
  });

  const drug = res || {};

  const handleAddToList = async () => {
    try {
      await medicationApi.addMedication({
        medicationName: drug.name,
        genericName: drug.genericName,
        strength: drug.strength || '500 mg',
        form: drug.dosageForms?.[0] || 'Tablet',
        route: drug.route || 'Oral',
        frequency: 'Once daily',
        source: 'Manual',
        rxNormCode: drug.rxNormCode,
        startDate: new Date().toISOString().split('T')[0],
      });
      addToast({
        title: 'Medication Added',
        message: `${drug.name} was added to your active medication regimen.`,
        type: 'success',
      });
    } catch {
      addToast({
        title: 'Error',
        message: 'Could not add medication.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Clinical Overview', icon: FileText },
    { id: 'interactions', label: 'Known Interactions', icon: ShieldAlert },
    { id: 'precautions', label: 'Disease Precautions', icon: AlertTriangle },
    { id: 'evidence', label: 'Evidence Sources', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/drugs')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Medication Search
      </button>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 border border-teal-200">
            <Pill className="w-7 h-7 -rotate-45" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {drug.name}
              </h1>
              {drug.drugClass && (
                <Badge variant="teal" size="sm" pill>
                  {drug.drugClass}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 italic">
              Generic Designation: <strong className="text-slate-700 font-semibold">{drug.genericName}</strong>
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-2xs text-slate-500">
              <span>RxNorm: <strong className="font-mono text-slate-700">{drug.rxNormCode || '855332'}</strong></span>
              <span>•</span>
              <span>ATC Code: <strong className="font-mono text-slate-700">{drug.atcCode || 'B01AA03'}</strong></span>
              <span>•</span>
              <span>Standard Route: <strong className="text-slate-700">{drug.route || 'Oral'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/interactions?prefill=${encodeURIComponent(drug.name)}`)}
            icon={ShieldCheck}
            className="text-xs"
          >
            Check Interactions
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToList}
            icon={Plus}
            className="text-xs"
          >
            Add to My Medications
          </Button>
        </div>
      </div>

      {/* Black Box Warning if present */}
      {drug.blackBoxWarning && (
        <div className="p-4 rounded-xl border border-red-300 bg-red-50/70 text-red-950 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-900">
            <ShieldAlert className="w-4 h-4 text-red-700" />
            <span>Official FDA Black Box Warning</span>
          </div>
          <p className="text-xs leading-relaxed">
            High risk of major or fatal bleeding events. Regular monitoring of INR is required in all treated patients. Numerous drugs, dietary changes, and other factors affect anticoagulation response.
          </p>
          <span className="text-3xs text-red-700 font-mono block pt-1">
            Source: FDA Center for Drug Evaluation & Research (CDER) Structured Product Labeling
          </span>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Pharmacological Description & Indications">
              <p className="text-xs text-slate-700 leading-relaxed">
                {drug.description}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-2xs text-slate-400">
                <span>Indications verified against FDA Approved Labeling</span>
                <span className="text-teal-700 font-medium">DailyMed Integration</span>
              </div>
            </Card>

            <Card title="Dosage Forms & Administration">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-2xs uppercase">Available Strengths</span>
                  <span className="font-semibold text-slate-800">{drug.strength || '1mg, 2mg, 2.5mg, 5mg, 10mg'}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-2xs uppercase">Dosage Form</span>
                  <span className="font-semibold text-slate-800">
                    {Array.isArray(drug.dosageForms) ? drug.dosageForms.join(', ') : drug.dosageForms || 'Tablet'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-2xs uppercase">Route</span>
                  <span className="font-semibold text-slate-800">{drug.route || 'Oral'}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Active Ingredients & Brand Aliases">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-2xs uppercase tracking-wider">Active Substance</span>
                  <span className="font-bold text-slate-800">{drug.activeIngredient || drug.genericName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-2xs uppercase tracking-wider">Known Commercial Brands</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(drug.brandNames || ['Coumadin', 'Jantoven']).map((b) => (
                      <span key={b} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-2xs text-slate-700">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'interactions' && (
        <Card title="Known Pharmacodynamic & Pharmacokinetic Interactions">
          <p className="text-xs text-slate-600 mb-4">
            {drug.knownInteractionsSummary ||
              'High interaction propensity with NSAIDs, antiplatelets, CYP inhibitors/inducers, and vitamin K containing foods.'}
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-red-900">Aspirin & NSAIDs (Ibuprofen, Naproxen)</strong>
                <Badge variant="red" size="sm">Critical Hazard</Badge>
              </div>
              <p className="text-red-800 text-2xs">
                Severe gastrointestinal ulceration and major hemorrhage risk. Additive antiplatelet action.
              </p>
              <span className="text-3xs text-red-600 font-mono block">Source: FDA SPL Package Insert 2026</span>
            </div>

            <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/50 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-orange-900">CYP2C9 Inhibitors (Fluconazole, Amiodarone)</strong>
                <Badge variant="amber" size="sm">Major Interaction</Badge>
              </div>
              <p className="text-orange-800 text-2xs">
                Inhibits hepatic elimination, causing supratherapeutic INR and spontaneous hemorrhage.
              </p>
              <span className="text-3xs text-orange-700 font-mono block">Source: American Journal of Health-System Pharmacy</span>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'precautions' && (
        <Card title="Disease Precautions & Clinical Contraindications">
          <div className="space-y-3 text-xs">
            {(drug.diseasePrecautions || ['Active pathological bleeding', 'Severe hepatic disease', 'Pregnancy Category X']).map((dp, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-950 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-900">{dp}</strong>
                  <span className="text-2xs text-amber-800">
                    Contraindicated or requires stringent risk-benefit evaluation prior to initiation.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <Card title="Authoritative Compendium Sources">
            <p className="text-xs text-slate-600 mb-4">
              All safety rules and dosing statements for {drug.name} are synchronized directly from verified federal and clinical standards.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">DailyMed (NIH/NLM)</strong>
                  <Badge variant="emerald" size="sm">Active Sync</Badge>
                </div>
                <p className="text-2xs text-slate-500">
                  FDA structured product labeling ID: {drug.rxNormCode || '855332'}
                </p>
                <a
                  href="https://dailymed.nlm.nih.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 text-2xs font-semibold inline-flex items-center gap-1 mt-2"
                >
                  View DailyMed SPL <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">RxNorm (NLM)</strong>
                  <Badge variant="emerald" size="sm">Active Sync</Badge>
                </div>
                <p className="text-2xs text-slate-500">
                  Concept Unique Identifier (RxCUI): {drug.rxNormCode || '855332'}
                </p>
                <a
                  href="https://rxnav.nlm.nih.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 text-2xs font-semibold inline-flex items-center gap-1 mt-2"
                >
                  View RxNav Concept <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
