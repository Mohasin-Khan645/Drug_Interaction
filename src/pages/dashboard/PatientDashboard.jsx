import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Pill,
  ShieldAlert,
  UploadCloud,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  HeartPulse,
  Activity,
  FileText,
  Calendar,
  AlertTriangle,
  Stethoscope,
  PhoneCall,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { medicationApi } from '../../api/medicationApi';
import { alertApi } from '../../api/alertApi';

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [takenDoses, setTakenDoses] = useState({
    'med-1': true,
    'med-2': false,
    'med-3': false,
  });

  const toggleDose = (id) => {
    setTakenDoses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Load medications
  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const res = await medicationApi.getMedications();
      return res.data || [];
    },
  });

  // Load alerts
  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await alertApi.getAlerts();
      return res.data || [];
    },
  });

  const patientFirstName = currentUser?.name?.split(' ')[0] || 'Sarah';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Patient Health Hero Banner (Calming Teal/Emerald) */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-teal-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden border border-teal-800 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-950/80 border border-teal-600/60 text-teal-300 mb-3">
              <HeartPulse className="w-3.5 h-3.5 text-teal-300" />
              <span>Personal Health Record · Continuous Medication Monitoring</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {patientFirstName}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
              Your prescription safety regimen is actively monitored for drug interactions, food precautions, and dosage schedules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/portal/patient/prescriptions"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-xs shadow-md transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Scan Prescription</span>
            </Link>
            <Link
              to="/portal/patient/safety"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-950/70 hover:bg-teal-900 border border-teal-600 text-white font-semibold text-xs transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-teal-300" />
              <span>Check Interaction</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Patient Key Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Prescriptions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Prescriptions
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Pill className="w-4 h-4 -rotate-45" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">
              {medications.length || 4}
            </span>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled & Current
            </p>
          </div>
        </div>

        {/* Adherence Rate */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Schedule Adherence
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">96%</span>
            <p className="text-xs text-slate-500 font-medium mt-1">
              27 of 28 doses taken on time
            </p>
          </div>
        </div>

        {/* Safety Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Safety Verification
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">Protected</span>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              Physician Reviewed
            </p>
          </div>
        </div>

        {/* Next Refill */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Next Pharmacy Refill
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">14 Days</span>
            <p className="text-xs text-amber-700 font-semibold mt-1">
              Warfarin 5mg · 2 Refills Left
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Patient View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Today's Schedule & Active Meds */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Dose Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-700" />
                  Today&apos;s Medication Schedule
                </h2>
                <p className="text-xs text-slate-500">
                  Track your daily doses to ensure optimal therapeutic drug levels
                </p>
              </div>
              <span className="text-3xs font-bold uppercase px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                Today
              </span>
            </div>

            <div className="space-y-3">
              {/* Morning Dose */}
              <div
                onClick={() => toggleDose('med-1')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  takenDoses['med-1']
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-teal-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      takenDoses['med-1']
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      Warfarin Sodium 5mg
                    </span>
                    <span className="text-3xs text-slate-500">
                      Morning (8:00 AM) · Take with water · Anticoagulant
                    </span>
                  </div>
                </div>
                <span
                  className={`text-3xs font-semibold px-2 py-0.5 rounded ${
                    takenDoses['med-1']
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {takenDoses['med-1'] ? 'Taken' : 'Mark Taken'}
                </span>
              </div>

              {/* Afternoon Dose */}
              <div
                onClick={() => toggleDose('med-2')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  takenDoses['med-2']
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-teal-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      takenDoses['med-2']
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      Aspirin 81mg (Low Dose)
                    </span>
                    <span className="text-3xs text-slate-500">
                      Noon (12:30 PM) · Take with food · Cardioprotective
                    </span>
                  </div>
                </div>
                <span
                  className={`text-3xs font-semibold px-2 py-0.5 rounded ${
                    takenDoses['med-2']
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {takenDoses['med-2'] ? 'Taken' : 'Mark Taken'}
                </span>
              </div>

              {/* Evening Dose */}
              <div
                onClick={() => toggleDose('med-3')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  takenDoses['med-3']
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-teal-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      takenDoses['med-3']
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      Atorvastatin Calcium 20mg
                    </span>
                    <span className="text-3xs text-slate-500">
                      Night (9:00 PM) · Lipid Regimen · Avoid Grapefruit
                    </span>
                  </div>
                </div>
                <span
                  className={`text-3xs font-semibold px-2 py-0.5 rounded ${
                    takenDoses['med-3']
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {takenDoses['med-3'] ? 'Taken' : 'Mark Taken'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Medication Regimen Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Current Prescription Regimen
                </h2>
                <p className="text-xs text-slate-500">
                  Prescribed and verified by your clinical care team
                </p>
              </div>
              <Link
                to="/portal/patient/medications"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <span>Manage all ({medications.length || 4})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Warfarin Sodium</span>
                  <span className="text-slate-500 ml-2">5mg Tablet · Daily</span>
                  <p className="text-3xs text-slate-400 mt-0.5">
                    Rx #RX-88491 · Dr. Marcus Chen, MD · 2 Refills Remaining
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Bayer Aspirin</span>
                  <span className="text-slate-500 ml-2">81mg Enteric · Daily</span>
                  <p className="text-3xs text-slate-400 mt-0.5">
                    OTC Cardioprotective · Monitored for Bleeding Risk
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Lipitor (Atorvastatin)</span>
                  <span className="text-slate-500 ml-2">20mg · Nightly</span>
                  <p className="text-3xs text-slate-400 mt-0.5">
                    Rx #RX-44912 · Dr. Marcus Chen, MD · Refill Available
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Safety Warnings & Care Team */}
        <div className="lg:col-span-5 space-y-6">
          {/* Patient-Friendly Safety & Food Precautions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Food & Safety Precautions
              </h2>
              <span className="text-3xs font-semibold text-slate-400">
                FDA DailyMed
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span>🥬</span>
                  <span>Vitamin K Consistency (Warfarin)</span>
                </p>
                <p className="text-3xs text-amber-800 mt-1 leading-relaxed">
                  Keep your intake of green leafy vegetables (spinach, kale) consistent each day. Sudden changes can affect INR levels.
                </p>
              </div>

              <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-xl">
                <p className="font-bold text-rose-900 flex items-center gap-1.5">
                  <span>🩸</span>
                  <span>Bleeding Risk Monitored</span>
                </p>
                <p className="text-3xs text-rose-800 mt-1 leading-relaxed">
                  Warfarin + Aspirin combination is physician-approved. Report unusual bruising, bleeding gums, or dizziness promptly.
                </p>
              </div>

              <div className="p-3 bg-teal-50/60 border border-teal-200/80 rounded-xl">
                <p className="font-bold text-teal-900 flex items-center gap-1.5">
                  <span>🍊</span>
                  <span>Grapefruit Interaction</span>
                </p>
                <p className="text-3xs text-teal-800 mt-1 leading-relaxed">
                  Avoid grapefruit and grapefruit juice while taking Atorvastatin as it can elevate statin concentration in blood.
                </p>
              </div>
            </div>
          </div>

          {/* My Healthcare Care Team */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-700" />
              My Care Team
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Dr. Marcus Chen, MD
                  </span>
                  <span className="text-3xs text-slate-500">
                    Primary Prescribing Physician · Cardiology
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-3xs font-semibold bg-teal-100 text-teal-800">
                  Active MD
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Elena Rostova, PharmD
                  </span>
                  <span className="text-3xs text-slate-500">
                    HealthRx Clinical Pharmacy · Dispensing
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-3xs font-semibold bg-emerald-100 text-emerald-800">
                  Pharmacy
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-teal-700 font-semibold">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>24/7 Clinical Nurse Triage: 1-800-555-DRUG</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
