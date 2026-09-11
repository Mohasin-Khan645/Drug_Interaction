import React from 'react';
import { ShieldCheck, Calendar, User, Pill, AlertTriangle, CheckCircle2, Printer } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import Button from '../common/Button';
import { formatDate, formatDateTime } from '../../utils/formatters';

export default function SafetyReportPrintView({
  report,
  patient,
  medications = [],
  findings = [],
  allergies = [],
  conditions = [],
  onPrint,
}) {
  if (!report) return null;

  return (
    <div className="bg-white max-w-4xl mx-auto my-6 p-8 border border-slate-200 shadow-md rounded-2xl print:m-0 print:p-0 print:border-none print:shadow-none">
      {/* Non-printed header action bar */}
      <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Official Clinical Document</span>
          <h2 className="text-xl font-bold text-slate-900">Medication Safety Intelligence Report</h2>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={onPrint || (() => window.print())}
          icon={Printer}
        >
          Print / Export PDF
        </Button>
      </div>

      {/* Official Header */}
      <div className="flex items-start justify-between pb-6 border-b-2 border-teal-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-base">
              DS
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                DRUG<span className="text-teal-700">SAFE</span>
              </h1>
              <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
                Medication Safety Intelligence Platform
              </p>
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-slate-600">
          <div className="font-mono font-bold text-slate-900 text-sm">
            REPORT #{report.id || 'DS-2026-9812'}
          </div>
          <div>Generated: {formatDateTime(report.createdAt || new Date().toISOString())}</div>
          <div>Status: <span className="font-semibold text-teal-800">{report.status || 'VERIFIED'}</span></div>
        </div>
      </div>

      {/* Patient Clinical Profile Summary */}
      <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block text-2xs uppercase tracking-wider">Patient Name</span>
          <strong className="text-slate-900 text-sm">{patient?.name || 'Sarah Jenkins'}</strong>
          <span className="text-slate-500 block">MRN: {patient?.mrn || 'PT-98241'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-2xs uppercase tracking-wider">DOB / Age</span>
          <span className="text-slate-800 font-medium">1959-04-12 (67 yrs)</span>
          <span className="text-slate-500 block">Gender: {patient?.gender || 'Female'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-2xs uppercase tracking-wider">Known Allergies</span>
          <span className="text-red-700 font-bold">
            {allergies.length > 0 ? allergies.map(a => typeof a === 'string' ? a : a.allergen).join(', ') : 'Penicillin (Anaphylaxis)'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-2xs uppercase tracking-wider">Documented Conditions</span>
          <span className="text-slate-800 font-medium">
            {conditions.length > 0 ? conditions.map(c => typeof c === 'string' ? c : c.conditionName).join(', ') : 'Hypertension, CKD Stage 3, Atrial Fibrillation'}
          </span>
        </div>
      </div>

      {/* Evaluated Medications Table */}
      <div className="my-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
          <Pill className="w-4 h-4 text-teal-700" />
          <span>Active Medications Under Evaluation ({medications.length})</span>
        </h3>
        <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-100 text-slate-600 uppercase text-2xs font-semibold">
            <tr>
              <th className="p-2 border-b">Medication</th>
              <th className="p-2 border-b">Generic</th>
              <th className="p-2 border-b">Dose / Frequency</th>
              <th className="p-2 border-b">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {medications.map((m, idx) => (
              <tr key={idx}>
                <td className="p-2 font-bold text-slate-900">{m.medicationName || m.name}</td>
                <td className="p-2 text-slate-600">{m.genericName || '—'}</td>
                <td className="p-2 text-slate-700">{m.strength} {m.frequency}</td>
                <td className="p-2 text-slate-600">{m.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Safety Findings Prioritized by Severity */}
      <div className="my-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Clinical Decision-Support Findings ({findings.length})</span>
        </h3>

        {findings.map((finding, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 avoid-break"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{finding.title}</span>
              <SeverityBadge severity={finding.severity} size="sm" />
            </div>
            <p className="text-xs text-slate-800 leading-relaxed">
              <strong>Clinical Effect:</strong> {finding.clinicalEffect}
            </p>
            {finding.mechanism && (
              <p className="text-2xs text-slate-600 font-mono">
                <strong>Mechanism:</strong> {finding.mechanism}
              </p>
            )}
            <div className="p-2 rounded bg-slate-50 text-2xs text-slate-700 border border-slate-100">
              <strong>Actionable Clinical Recommendation:</strong> {finding.recommendation}
            </div>
            <div className="text-3xs text-slate-400 pt-1 flex justify-between">
              <span>Evidence Level: {finding.evidenceLevel || 'Level 1 (FDA Package Label)'}</span>
              <span>Source: {finding.source || 'DailyMed / openFDA'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Clinician Review & Attestation Sign-off */}
      <div className="mt-8 pt-6 border-t-2 border-slate-200 avoid-break">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
          Clinician Review & Formal Decision Sign-Off
        </h4>
        <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-2xs uppercase">Attending Clinician</span>
            <strong className="text-slate-900">{report.reviewerName || 'Dr. Marcus Chen, MD'}</strong>
            <span className="text-slate-500 block">License: CA-MD-89210 • Internal Medicine</span>
            <div className="mt-2 text-2xs text-slate-600">
              Decision: <span className="font-bold text-emerald-800">{report.decision || 'ACCEPTED & MONITORED'}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-2xs uppercase">Clinical Review Note</span>
            <p className="text-slate-700 italic">
              &quot;{report.reviewNote || 'Co-administration reviewed with patient. Dose of warfarin adjusted with INR target 2.0-2.5. Repeat labs ordered in 72 hours.'}&quot;
            </p>
            <div className="mt-2 text-2xs text-slate-500">
              Signed Digitally: {formatDateTime(report.reviewedAt || new Date().toISOString())}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
