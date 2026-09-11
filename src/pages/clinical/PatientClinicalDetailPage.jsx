import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  HeartPulse,
  Pill,
  ShieldAlert,
  FileText,
  Activity,
  History,
  ArrowLeft,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Printer,
} from 'lucide-react';
import PatientHeader from '../../components/clinical/PatientHeader';
import SafetyFinding from '../../components/clinical/SafetyFinding';
import MedicationTable from '../../components/clinical/MedicationTable';
import PatientFactorsSummary from '../../components/clinical/PatientFactorsSummary';
import MediSafeAIExplanation from '../../components/clinical/MediSafeAIExplanation';
import { patientApi } from '../../api/patientApi';
import { medicationApi } from '../../api/medicationApi';
import { MOCK_PATIENTS } from '../../api/mock/mockData';

export default function PatientClinicalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFinding, setSelectedFinding] = useState(null);

  const { data: patientRes } = useQuery({
    queryKey: ['patient', id || 'pt-101'],
    queryFn: async () => {
      const res = await patientApi.getPatientById(id || 'pt-101');
      return res.data || MOCK_PATIENTS[0];
    },
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['patient-medications', id || 'pt-101'],
    queryFn: async () => {
      const res = await medicationApi.getMedications(id || 'pt-101');
      return res.data || [];
    },
  });

  const patient = patientRes || MOCK_PATIENTS[0];

  const tabs = [
    { id: 'overview', label: 'Overview & Factors', icon: HeartPulse },
    { id: 'medications', label: 'Active Medications', icon: Pill, badge: medications.length || 4 },
    { id: 'safety', label: 'Safety & Interactions', icon: ShieldAlert, badge: '1 Alert' },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'labs', label: 'Renal & Lab Markers', icon: Activity },
    { id: 'history', label: 'Clinical History', icon: History },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/doctor/patients')}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
              Physician Clinical Workspace • EHR Chart
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {patient.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Chart</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/doctor/interactions')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Run Safety Analysis</span>
          </button>
        </div>
      </div>

      {/* Patient Header Banner */}
      <PatientHeader patient={patient} />

      {/* Clinical Workspace Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none pb-px">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
                isActive
                  ? 'border-teal-500 text-teal-700 dark:text-teal-400 bg-teal-50/30 dark:bg-teal-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-md text-3xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Factors */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <PatientFactorsSummary patient={patient} />

          {/* Quick Conditions List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Documented Medical Diagnoses & Chronic Conditions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patient.conditions?.map((c) => (
                <div
                  key={c.id || c.conditionName}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.conditionName}</p>
                    <span className="text-3xs font-mono text-slate-400">ICD-10: {c.icd10Code}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                    {c.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Medications */}
      {activeTab === 'medications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Active Inpatient & Ambulatory Medication Regimen
            </h3>
            <button
              type="button"
              onClick={() => navigate('/doctor/reconciliation')}
              className="text-xs font-bold text-teal-600 hover:underline"
            >
              Go to Medication Reconciliation →
            </button>
          </div>
          <MedicationTable medications={medications} />
        </div>
      )}

      {/* Tab 3: Safety & Interactions */}
      {activeTab === 'safety' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>1 Active Critical Interaction Identified: Warfarin + Aspirin Bleeding Hazard</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setSelectedFinding({
                  severity: 'CRITICAL',
                  title: 'Warfarin + Aspirin',
                  medications: ['Warfarin', 'Aspirin'],
                  summary: 'Dual antiplatelet and antithrombotic therapy synergy.',
                  clinicalEffect: 'Severe gastrointestinal bleeding multiplier.',
                  mechanism: 'Platelet COX-1 inactivation and hepatic VKORC1 clotting factor depletion.',
                  management: 'Co-prescribe PPI gastroprotection or evaluate DOAC transition.',
                  evidence: 'FDA Labeling & CHEST 2024 Guidelines',
                  source: 'DailyMed',
                })
              }
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-2xs"
            >
              View Rationale
            </button>
          </div>

          <SafetyFinding
            severity="CRITICAL"
            title="Warfarin + Aspirin"
            medications={['Warfarin', 'Aspirin']}
            summary="Co-administration synergistically blocks platelet aggregation and clotting cascade, multiplying gastrointestinal bleeding risk."
            clinicalEffect="Severe gastrointestinal and intracranial bleeding hazard."
            mechanism="Irreversible COX-1 platelet inhibition combined with hepatic VKORC1 clotting factor depletion."
            management="Verify cardiology indication. Co-prescribe PPI gastroprotection if combination is mandatory."
            evidence="CHEST 2024 Guidelines & FDA Prescribing Information"
            source="DailyMed / FDA CDER"
            lastVerified="March 2026"
            onExplainAI={() =>
              setSelectedFinding({
                severity: 'CRITICAL',
                title: 'Warfarin + Aspirin',
                medications: ['Warfarin', 'Aspirin'],
                summary: 'Dual antiplatelet and antithrombotic therapy synergy.',
                clinicalEffect: 'Severe gastrointestinal bleeding multiplier.',
                mechanism: 'Platelet COX-1 inactivation and hepatic VKORC1 clotting factor depletion.',
                management: 'Co-prescribe PPI gastroprotection or evaluate DOAC transition.',
                evidence: 'FDA Labeling & CHEST 2024 Guidelines',
                source: 'DailyMed',
              })
            }
          />
        </div>
      )}

      {/* Tab 4: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Prescription Orders Archive</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Uploaded e-prescriptions, handwritten orders, and pharmacy receipts reconciled for {patient.name}.
          </p>
          <button
            type="button"
            onClick={() => navigate('/doctor/prescriptions')}
            className="mt-4 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
          >
            Review Uploaded Prescriptions
          </button>
        </div>
      )}

      {/* Tab 5: Renal & Lab Markers */}
      {activeTab === 'labs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Quantitative Biomarkers for Dosing Safety Engine
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-3xs font-bold uppercase text-slate-400">eGFR (CKD-EPI)</span>
              <p className="text-xl font-black text-amber-600 mt-1">48 mL/min</p>
              <span className="text-3xs text-slate-400">Stage 3a Renal Impairment</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-3xs font-bold uppercase text-slate-400">Serum Creatinine</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">1.4 mg/dL</p>
              <span className="text-3xs text-slate-400">Ref: 0.6 - 1.1 mg/dL</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-3xs font-bold uppercase text-slate-400">Serum Potassium (K+)</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">4.6 mEq/L</p>
              <span className="text-3xs text-emerald-600 font-medium">Normokalemic (3.5 - 5.0)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-3xs font-bold uppercase text-slate-400">INR Coagulation</span>
              <p className="text-xl font-black text-teal-600 mt-1">2.3</p>
              <span className="text-3xs text-teal-600 font-medium">Therapeutic Target: 2.0 - 3.0</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Physician Consultation & Safety Decision Trail
          </h3>
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            <div>
              <span className="text-3xs font-mono font-bold text-slate-400">Today, 08:12 AM</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Safety check performed by Dr. Marcus Chen
              </p>
              <p className="text-3xs text-slate-500">Flagged Warfarin + Aspirin synergism; review requested.</p>
            </div>
            <div>
              <span className="text-3xs font-mono font-bold text-slate-400">Jan 14, 2026</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Metformin dose titrated to 500mg BID
              </p>
              <p className="text-3xs text-slate-500">HbA1c verified at 6.8%.</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Explanation Drawer */}
      <MediSafeAIExplanation
        isOpen={Boolean(selectedFinding)}
        onClose={() => setSelectedFinding(null)}
        finding={selectedFinding}
      />
    </div>
  );
}
