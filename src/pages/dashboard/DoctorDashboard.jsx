import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  ShieldAlert,
  UploadCloud,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  Stethoscope,
  Activity,
  FileText,
  AlertTriangle,
  GitMerge,
  Search,
  CheckSquare,
  AlertOctagon,
  Eye,
  FileCheck2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { patientApi } from '../../api/patientApi';
import { alertApi } from '../../api/alertApi';

export default function DoctorDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Load patients
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const res = await patientApi.getPatients();
      return res.data || [];
    },
  });

  const patientPanel = [
    {
      id: '1',
      name: 'Sarah Jenkins',
      mrn: 'MRN-84920',
      age: 64,
      gender: 'F',
      conditions: 'CKD Stage 3a, AFib',
      regimen: 'Warfarin 5mg, Aspirin 81mg',
      risk: 'CRITICAL',
      status: 'Override Needed',
    },
    {
      id: '2',
      name: 'Robert Martinez',
      mrn: 'MRN-72314',
      age: 62,
      gender: 'M',
      conditions: 'Hypertension, HFrEF',
      regimen: 'Lisinopril 20mg, Spironolactone 25mg',
      risk: 'MAJOR',
      status: 'Hyperkalemia Risk',
    },
    {
      id: '3',
      name: 'James Wilson',
      mrn: 'MRN-19283',
      age: 71,
      gender: 'M',
      conditions: 'Type 2 Diabetes, Neuropathy',
      regimen: 'Metformin 1000mg, Gabapentin 300mg',
      risk: 'MAJOR',
      status: 'Renal Dose Check',
    },
    {
      id: '4',
      name: 'Eleanor Vance',
      mrn: 'MRN-44912',
      age: 58,
      gender: 'F',
      conditions: 'Hypothyroidism, Dyslipidemia',
      regimen: 'Levothyroxine 75mcg, Atorvastatin 20mg',
      risk: 'SAFE',
      status: 'Stable Regimen',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Clinical Physician Command Hero Banner (Hospital Blue) */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden border border-blue-900/60 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-600/60 text-blue-300 mb-3">
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
              <span>Clinician Decision Support Workspace · Active Prescribing Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Dr. {currentUser?.name?.replace(/^Dr\.\s*/i, '') || 'Marcus Chen'}, MD
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/80 mt-1 max-w-2xl leading-relaxed">
              Internal Medicine & Cardiology · License #CA-MD-92841 · Real-time multi-factor clinical screening for drug collisions, organ clearance, and black box warnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/portal/doctor/interactions"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Multi-Drug Checker</span>
            </Link>
            <Link
              to="/portal/doctor/reviews"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-500 text-white font-semibold text-xs transition-all"
            >
              <CheckSquare className="w-4 h-4 text-blue-300" />
              <span>Review Queue (2)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Clinician Workstation Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned Patients */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Assigned Patient Panel
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">142</span>
            <p className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <span>All Charts Reconciled</span>
            </p>
          </div>
        </div>

        {/* Pending Decision Overrides */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Safety Overrides
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-700">2</span>
            <p className="text-xs text-amber-800 font-semibold mt-1">
              Requires Documented Clinical Rationale
            </p>
          </div>
        </div>

        {/* Renal Clearance Warnings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Renal Dose Alerts (eGFR &lt; 50)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-rose-700">3</span>
            <p className="text-xs text-rose-600 font-semibold mt-1">
              CKD Dose Adjustments Needed
            </p>
          </div>
        </div>

        {/* Audit Compliance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              E-Prescribing Compliance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">100%</span>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              DEA / EPCS Verified
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Clinical Workspace: Patient Triage & Active Review Overrides */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 cols): High-Risk Patient Triage Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-700" />
                Patient Triage & Clinical Panel
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by interaction collision severity and organ impairment risk
              </p>
            </div>
            <Link
              to="/portal/doctor/patients"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <span>Full Panel (142)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-3xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Patient & MRN</th>
                  <th className="py-2.5 px-3">Clinical Condition</th>
                  <th className="py-2.5 px-3">Screening Acuity</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientPanel.map((pt) => (
                  <tr key={pt.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{pt.name}</span>
                      <span className="text-3xs text-slate-400 font-mono">
                        {pt.mrn} · {pt.gender}, {pt.age}y
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-800 block font-medium">{pt.conditions}</span>
                      <span className="text-3xs text-slate-500 truncate max-w-xs block">{pt.regimen}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-3xs font-bold uppercase border ${
                          pt.risk === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : pt.risk === 'MAJOR'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}
                      >
                        {pt.risk} · {pt.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Link
                        to={`/portal/doctor/patients/${pt.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                      >
                        <span>Open Chart</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (4 cols): Pending Clinician Overrides & Lab Warnings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pending Reviews Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                Pending Overrides (2)
              </h2>
              <span className="text-3xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                Action Required
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950">Warfarin + Aspirin</span>
                  <span className="text-3xs font-bold text-rose-700 uppercase">Critical</span>
                </div>
                <p className="text-3xs text-rose-900 mt-1">
                  Sarah Jenkins (MRN-84920) · Synergistic bleeding risk. Co-prescribing requires documented clinical rationale.
                </p>
                <div className="mt-3 flex justify-end">
                  <Link
                    to="/portal/doctor/reviews"
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 hover:text-rose-950 underline"
                  >
                    <span>Sign Off Override</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950">Lisinopril + Spironolactone</span>
                  <span className="text-3xs font-bold text-amber-700 uppercase">Major</span>
                </div>
                <p className="text-3xs text-amber-900 mt-1">
                  Robert Martinez (MRN-72314) · Severe hyperkalemia collision risk. Requires serum potassium & creatinine schedule.
                </p>
                <div className="mt-3 flex justify-end">
                  <Link
                    to="/portal/doctor/reviews"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 underline"
                  >
                    <span>Document Decision</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Rapid Clinical Prescribing Tools */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-700" />
              Clinical Decision Shortcuts
            </h2>

            <div className="space-y-2 text-xs">
              <Link
                to="/portal/doctor/reconciliation"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 font-semibold transition-all"
              >
                <span className="flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-blue-600" />
                  Medication Reconciliation
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>

              <Link
                to="/portal/doctor/search"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 font-semibold transition-all"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  FDA Drug Monograph Database
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>

              <Link
                to="/portal/doctor/reports"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 font-semibold transition-all"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Comprehensive Safety Reports
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
