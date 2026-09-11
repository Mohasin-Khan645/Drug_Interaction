import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Pill,
  User,
  Clock,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  FileText,
  ExternalLink,
} from 'lucide-react';
import PatientHeader from '../../components/clinical/PatientHeader';
import SafetyFinding from '../../components/clinical/SafetyFinding';
import { MOCK_PATIENTS } from '../../api/mock/mockData';

export default function DispensingReviewPage() {
  const navigate = useNavigate();
  const patient = MOCK_PATIENTS[0]; // Sarah Jenkins

  const [checklist, setChecklist] = useState({
    medicationIdentified: true,
    patientMatched: true,
    allergyCheckCompleted: true,
    interactionCheckCompleted: true,
    duplicateTherapyCompleted: true,
    prescriptionReviewed: false,
  });

  const [reviewNote, setReviewNote] = useState('');
  const [outcomeStatus, setOutcomeStatus] = useState(null);

  const toggleItem = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasCriticalInteraction = true; // Warfarin + Aspirin
  const allChecked = Object.values(checklist).every(Boolean);

  const handleAction = (actionType) => {
    setOutcomeStatus(actionType);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/pharmacist/dashboard')}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
              Prescription Dispensing Review • Rx #9821
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Medication Safety & Verification Workspace
            </h1>
          </div>
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              hasCriticalInteraction
                ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            <span>{hasCriticalInteraction ? '🔴' : '🟢'}</span>
            <span>{hasCriticalInteraction ? 'SAFETY CONCERN DETECTED' : 'READY FOR PHARMACIST REVIEW'}</span>
          </span>
        </div>
      </div>

      {/* Patient Header Banner */}
      <PatientHeader patient={patient} />

      {/* Safety Findings Matrix */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-600" />
          <span>Clinical Safety Findings Identified</span>
        </h3>

        <SafetyFinding
          severity="CRITICAL"
          title="Warfarin Sodium + Aspirin Severe Synergism"
          medications={['Warfarin Sodium 5mg', 'Aspirin 81mg EC']}
          summary="Co-prescription produces dual hemostatic blockage (platelet antiaggregation + clotting factor clearance), multiplying major GI hemorrhage risk."
          clinicalEffect="High risk of major gastrointestinal hemorrhage and prolonged bleeding time."
          mechanism="Aspirin irreversibly acetylates platelet COX-1; Warfarin blocks vitamin K recycling via hepatic VKORC1."
          management="Pharmacist intervention required: Verify if combination is deliberate under specialist cardiology protocol. If required, co-prescribe PPI gastroprotection and request physician acknowledgment."
          evidence="FDA Black-Box Prescribing Labeling & CHEST 2024 Antithrombotic Guidelines"
          source="DailyMed / FDA CDER"
          lastVerified="March 2026"
          status="SAFETY_CONCERN"
        />
      </div>

      {/* 2-Column: Dispensing Checklist & Pharmacist Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Checklist */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-teal-600" />
              <span>Dispensing Verification Checklist</span>
            </h3>
            <span className="text-3xs font-semibold text-slate-400">
              Mandatory Protocol
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { key: 'medicationIdentified', label: 'Medication identified and active ingredient verified' },
              { key: 'patientMatched', label: 'Patient matched with MRN and clinical profile' },
              { key: 'allergyCheckCompleted', label: 'Allergy check completed against patient history' },
              { key: 'interactionCheckCompleted', label: 'Interaction check completed against current regimen' },
              { key: 'duplicateTherapyCompleted', label: 'Duplicate therapy check completed' },
              { key: 'prescriptionReviewed', label: 'Prescription directions and dosages confirmed' },
            ].map((item) => (
              <label
                key={item.key}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  checklist[item.key]
                    ? 'bg-teal-50/50 border-teal-200 dark:bg-teal-950/20 dark:border-teal-800'
                    : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist[item.key]}
                  onChange={() => toggleItem(item.key)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Pharmacist Action Panel */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Pharmacist Review Decision
            </h3>
            <p className="text-3xs text-slate-400 mt-0.5">
              Record clinical intervention, flag concern, or approve for dispensing
            </p>
          </div>

          {outcomeStatus ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Decision Logged: {outcomeStatus}</span>
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Action recorded to the immutable clinical audit trail.
              </p>
              <button
                type="button"
                onClick={() => navigate('/pharmacist/dashboard')}
                className="mt-2 text-xs font-bold text-teal-600 hover:underline"
              >
                ← Return to Prescription Queue
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Clinical Note / Rationale for Prescriber
                </label>
                <textarea
                  rows={4}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="e.g. Flagged Warfarin + Aspirin bleeding synergy. Recommending prescriber re-evaluation or adding omeprazole 20mg for gastroprotection."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => handleAction('SAFETY CONCERN FLAGGED')}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
                >
                  Flag Concern
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('CLARIFICATION REQUESTED')}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors"
                >
                  Request Clarification
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('APPROVED FOR DISPENSING')}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
                >
                  Mark Reviewed
                </button>
              </div>

              <p className="text-3xs text-slate-400 text-center">
                *All pharmacist decisions are signed with digital credential RPH-55419.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

