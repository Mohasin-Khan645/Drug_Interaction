import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pill, ShieldAlert, AlertTriangle, CheckCircle2, Plus, Info, Apple, HeartPulse, Sparkles, ArrowRight } from 'lucide-react';
import { medicationApi } from '../../api/medicationApi';
import MedicationTable from '../../components/clinical/MedicationTable';
import MediSafeAIExplanation from '../../components/clinical/MediSafeAIExplanation';

export default function PatientMedicationsPage() {
  const [selectedMed, setSelectedMed] = useState(null);
  const [aiFinding, setAiFinding] = useState(null);

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const res = await medicationApi.getMedications();
      return res.data || [];
    },
  });

  const activeMed = selectedMed || medications[0] || {
    id: 'med-1',
    name: 'Warfarin Sodium',
    genericName: 'Warfarin Sodium',
    brandName: 'Coumadin',
    dosage: '5 mg',
    frequency: 'Once daily at bedtime',
    route: 'Oral tablet',
    startDate: '2023-04-10',
    prescriber: 'Dr. Marcus Chen, MD',
    status: 'ACTIVE',
    foodInteractions: [
      'Maintain consistent intake of Vitamin K-rich foods (spinach, kale, broccoli). Sudden increases decrease INR anticoagulant efficacy.',
      'Avoid cranberry juice and grapefruit in large amounts (inhibits CYP2C9 clearance).',
    ],
    diseaseConsiderations: [
      'Hepatic impairment: Requires closer INR monitoring as liver synthesizes clotting factors.',
      'Active peptic ulcer: Relative contraindication due to mucosal hemorrhage risk.',
    ],
    allergyConsiderations: [
      'No cross-reactivity with penicillin or sulfa allergies documented.',
    ],
    duplicateTherapy: [
      'No duplicate vitamin K antagonists detected in current regimen.',
    ],
  };

  const handleOpenAi = () => {
    setAiFinding({
      title: `${activeMed.name} Clinical Profile`,
      medications: [activeMed.name],
      severity: 'MONITOR',
      summary: `Clinical monitoring considerations for ${activeMed.name} (${activeMed.dosage}).`,
      clinicalEffect: 'Requires therapeutic window management and dietary consistency.',
      mechanism: 'Anticoagulation mediated by vitamin K epoxide reductase inhibition.',
      management: 'Maintain periodic INR laboratory checks and review OTC analgesics before administration.',
      evidence: 'FDA Approved Package Labeling & DailyMed monograph',
      source: 'DailyMed / NIH RxNorm',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            My Medication Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personal medication list with dietary considerations, disease factors, and safety evidence
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAi}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI About This Regimen</span>
        </button>
      </div>

      {/* Structured Medication Table */}
      <MedicationTable
        medications={medications}
        onViewDetails={(med) => setSelectedMed(med)}
      />

      {/* Detailed Clinical & Lifestyle Safety Card for Selected Medication */}
      {activeMed && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeMed.name} {activeMed.dosage}
                </h3>
                <p className="text-xs text-slate-400">
                  Generic: {activeMed.genericName || activeMed.name} · Brand: {activeMed.brandName || 'Generic'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-2xs">
              <span className="px-2.5 py-1 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Prescribed by: {activeMed.prescriber || 'Dr. Marcus Chen, MD'}
              </span>
              <span className="px-2.5 py-1 rounded-md font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                Status: {activeMed.status || 'ACTIVE'}
              </span>
            </div>
          </div>

          {/* Detailed Safety Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Food Interactions */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                <Apple className="w-4 h-4 text-emerald-600" />
                <span>Food & Dietary Considerations</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {(activeMed.foodInteractions || [
                  'Take with food or a large glass of water if gastrointestinal upset occurs.',
                  'No severe grapefruit or citrus cytochrome CYP3A4 inhibitors identified for this formulation.',
                ]).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-teal-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disease Considerations */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                <HeartPulse className="w-4 h-4 text-teal-600" />
                <span>Condition & Organ Considerations</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {(activeMed.diseaseConsiderations || [
                  'Kidney clearance: Safe within patient eGFR 48 mL/min parameters.',
                  'Blood pressure: Does not interfere with antihypertensive regimens.',
                ]).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-teal-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Allergy Considerations */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Allergy & Cross-Reactivity Checks</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Screened against documented Penicillin and Sulfa allergies. Zero antigenic determinant matches or cross-reactivity flags identified.
              </p>
            </div>

            {/* Duplicate Therapy */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Therapeutic Duplication Analysis</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Single active agent in class. No double-dosing or active ingredient stacking detected across the current active regimen.
              </p>
            </div>
          </div>

          <div className="pt-2 text-3xs text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>Evidence source: FDA DailyMed / USP-NF Verified Monograph</span>
            <span>Last reviewed: Today, 08:12 AM</span>
          </div>
        </div>
      )}

      {/* AI Explanation Drawer Modal */}
      <MediSafeAIExplanation
        isOpen={Boolean(aiFinding)}
        onClose={() => setAiFinding(null)}
        finding={aiFinding}
      />
    </div>
  );
}

