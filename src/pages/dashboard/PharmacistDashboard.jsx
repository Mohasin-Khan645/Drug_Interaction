import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Pill,
  ShieldAlert,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowRight,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Search,
  CheckSquare,
  AlertOctagon,
  ScanLine,
  GitMerge,
  BadgeAlert,
  Archive,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PharmacistDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const dispensingQueue = [
    {
      id: 'RX-88491',
      patientName: 'Sarah Jenkins',
      mrn: 'MRN-84920',
      prescribedDrug: 'Warfarin Sodium 5mg',
      prescriber: 'Dr. Marcus Chen, MD',
      riskFlag: 'CRITICAL',
      status: 'Physician Override Logged',
      fillStatus: 'Ready to Dispense',
    },
    {
      id: 'RX-72314',
      patientName: 'Robert Martinez',
      mrn: 'MRN-72314',
      prescribedDrug: 'Spironolactone 25mg',
      prescriber: 'Dr. Marcus Chen, MD',
      riskFlag: 'MAJOR',
      status: 'Hyperkalemia Collision',
      fillStatus: 'Needs Verification',
    },
    {
      id: 'RX-99120',
      patientName: 'James Wilson',
      mrn: 'MRN-19283',
      prescribedDrug: 'Amoxicillin 500mg',
      prescriber: 'Dr. Marcus Chen, MD',
      riskFlag: 'CRITICAL',
      status: 'Penicillin Allergy Conflict',
      fillStatus: 'Dispense Blocked (HOLD)',
    },
    {
      id: 'RX-44912',
      patientName: 'Eleanor Vance',
      mrn: 'MRN-44912',
      prescribedDrug: 'Levothyroxine 75mcg',
      prescriber: 'Dr. Marcus Chen, MD',
      riskFlag: 'SAFE',
      status: 'No Collisions Detected',
      fillStatus: 'Ready to Fill',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Pharmacy Operations Hero Banner (Deep Emerald / Jade) */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden border border-emerald-900/60 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 mb-3">
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pharmacy Dispensing & Verification Hub · Active Inpatient/Retail Queue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {currentUser?.name || 'Elena Rostova'}, PharmD
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-2xl leading-relaxed">
              Licensed Clinical Pharmacist · License #RPH-84920 · Real-time electronic prescription verification, OCR validation, and drug collision screening.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/portal/pharmacist/dispensing"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md transition-all"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Dispense Queue (4)</span>
            </Link>
            <Link
              to="/portal/pharmacist/prescriptions"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500 text-white font-semibold text-xs transition-all"
            >
              <UploadCloud className="w-4 h-4 text-emerald-300" />
              <span>OCR Intake (2)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Pharmacy Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verification Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Dispensing Queue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">4</span>
            <p className="text-xs text-amber-700 font-semibold mt-1">
              2 Require Pharmacist Sign-Off
            </p>
          </div>
        </div>

        {/* OCR Scans Awaiting Verification */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              OCR Prescriptions Intake
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <ScanLine className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">2</span>
            <p className="text-xs text-teal-700 font-semibold mt-1">
              High OCR Confidence (&gt;90%)
            </p>
          </div>
        </div>

        {/* Duplicate Therapy Warnings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Allergy / Black Box Flags
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <BadgeAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-rose-700">1</span>
            <p className="text-xs text-rose-600 font-semibold mt-1">
              Penicillin Allergy Stop Order
            </p>
          </div>
        </div>

        {/* Formulary Stock & Safety */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              NABP Compliance
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">100%</span>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              Full Dispensing Audit Pass
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Pharmacy Layout: Dispensing Queue & OCR Intake Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 cols): Inbound Prescription Dispensing Queue */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                Inbound Prescription Dispensing Queue
              </h2>
              <p className="text-xs text-slate-500">
                Prescriptions screened for dosage boundaries, interactions, and allergy flags
              </p>
            </div>
            <Link
              to="/portal/pharmacist/dispensing"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>Detailed Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-3xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Rx ID & Patient</th>
                  <th className="py-2.5 px-3">Prescribed Drug</th>
                  <th className="py-2.5 px-3">Screening Assessment</th>
                  <th className="py-2.5 px-3">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dispensingQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{item.id}</span>
                      <span className="text-3xs text-slate-500">{item.patientName} · {item.mrn}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{item.prescribedDrug}</span>
                      <span className="text-3xs text-slate-400">{item.prescriber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-3xs font-bold uppercase border ${
                          item.riskFlag === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : item.riskFlag === 'MAJOR'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}
                      >
                        {item.riskFlag} · {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold text-3xs block ${
                          item.fillStatus.includes('HOLD')
                            ? 'text-rose-700 font-bold'
                            : item.fillStatus.includes('Ready')
                            ? 'text-emerald-700 font-bold'
                            : 'text-amber-700'
                        }`}
                      >
                        {item.fillStatus}
                      </span>
                      <Link
                        to="/portal/pharmacist/dispensing"
                        className="text-3xs font-bold text-emerald-700 hover:text-emerald-900 underline"
                      >
                        Verify & Dispense
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (4 cols): OCR Prescription Intake Pipeline & Quick Tools */}
        <div className="lg:col-span-4 space-y-6">
          {/* OCR Intake Pipeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-teal-700" />
                OCR Intake Pipeline (2)
              </h2>
              <span className="text-3xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Tesseract Engine
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">rx_document_8492.pdf</span>
                  <span className="text-3xs font-bold text-emerald-700">96% Match</span>
                </div>
                <p className="text-3xs text-slate-500 mt-1">
                  Detected: Metoprolol Tartrate 50mg PO BID
                </p>
                <div className="mt-2.5 flex justify-end">
                  <Link
                    to="/portal/pharmacist/prescriptions"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                  >
                    <span>Validate Script</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">rx_scan_handwritten.jpg</span>
                  <span className="text-3xs font-bold text-amber-700">78% Match</span>
                </div>
                <p className="text-3xs text-slate-500 mt-1">
                  Detected: Amoxicillin 500mg (Needs character check)
                </p>
                <div className="mt-2.5 flex justify-end">
                  <Link
                    to="/portal/pharmacist/prescriptions"
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
                  >
                    <span>Manual Confirmation</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Pharmacy Quick Links */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Archive className="w-4 h-4 text-emerald-700" />
              Pharmacy Desk Shortcuts
            </h2>

            <div className="space-y-2 text-xs">
              <Link
                to="/portal/pharmacist/medications"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-semibold transition-all"
              >
                <span className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  Formulary Registry
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>

              <Link
                to="/portal/pharmacist/search"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-semibold transition-all"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-600" />
                  NDC & Drug Catalog
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>

              <Link
                to="/portal/pharmacist/reconciliation"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-semibold transition-all"
              >
                <span className="flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-emerald-600" />
                  Discrepancy Reconciliation
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
