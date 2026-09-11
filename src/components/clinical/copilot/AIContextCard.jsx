import React from 'react';
import { User, Pill, AlertTriangle, Activity, Shield, FileText, Server } from 'lucide-react';

export default function AIContextCard({
  role = 'PATIENT',
  patientContext,
  systemContext,
  className = '',
}) {
  if (role === 'ADMIN') {
    const sys = systemContext || {
      activeRulesCount: 26,
      evidenceSourcesCount: 5,
      monitoredPatientsCount: 142,
      dailySafetyChecks: 184,
      systemHealth: '100% Operational',
    };

    return (
      <div className={`p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl shadow-xs ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-3xs font-bold tracking-wider text-purple-300 uppercase">
              PLATFORM SYSTEM CONTEXT
            </span>
          </div>
          <span className="text-3xs px-2 py-0.5 rounded font-medium bg-purple-950/60 text-purple-300 border border-purple-500/30">
            AUDIT & GOVERNANCE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-2xs">
          <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="text-3xs text-slate-400 block font-medium">RULES ACTIVE</span>
            <span className="font-bold text-white text-xs">{sys.activeRulesCount} Rules</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="text-3xs text-slate-400 block font-medium">KNOWLEDGE FEEDS</span>
            <span className="font-bold text-teal-400 text-xs">{sys.evidenceSourcesCount} Sources</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="text-3xs text-slate-400 block font-medium">MONITORED ROSTER</span>
            <span className="font-bold text-white text-xs">{sys.monitoredPatientsCount} Patients</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="text-3xs text-slate-400 block font-medium">ENGINE STATUS</span>
            <span className="font-bold text-emerald-400 text-xs">{sys.systemHealth}</span>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'PHARMACIST') {
    return (
      <div className={`p-3 bg-slate-900/90 border border-teal-500/30 rounded-xl shadow-md ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-mono text-3xs font-black tracking-widest text-teal-300 uppercase">
              DISPENSING & RX CONTEXT
            </span>
          </div>
          <span className="font-mono text-3xs px-1.5 py-0.2 rounded bg-teal-950/60 text-teal-300 border border-teal-500/30">
            ACTIVE ORDER
          </span>
        </div>

        <div className="flex items-center justify-between text-2xs border-b border-slate-800/80 pb-2 mb-2">
          <div>
            <span className="font-bold text-white text-xs block">Sarah Jenkins</span>
            <span className="text-3xs text-slate-400 font-mono">Rx #84920-A • Inpatient Cardiology</span>
          </div>
          <div className="text-right">
            <span className="font-mono text-3xs text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 block">
              1 Safety Flag
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-3xs text-slate-400 font-mono">
          <span>Target: Warfarin 5mg + Aspirin 81mg</span>
          <span>•</span>
          <span className="text-emerald-400">Identity Matched</span>
        </div>
      </div>
    );
  }

  // PATIENT & DOCTOR CONTEXT
  const ctx = patientContext || {
    name: 'Sarah Jenkins',
    age: 67,
    gender: 'Female',
    activeMedicationsCount: 4,
    riskFindingsCount: 2,
    renalStatus: 'CKD 3a',
    egfr: 48,
  };

  return (
    <div className={`p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl shadow-xs relative overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-3xs font-bold tracking-wider text-teal-300 uppercase">
            {role === 'PATIENT' ? 'MY CLINICAL PROFILE' : 'PATIENT CONTEXT'}
          </span>
        </div>

        <span className="text-3xs px-2 py-0.5 rounded font-medium bg-teal-950/60 text-teal-300 border border-teal-500/30">
          SURVEILLANCE ACTIVE
        </span>
      </div>

      <div className="flex items-center justify-between text-2xs border-b border-slate-700/60 pb-2 mb-2">
        <div>
          <span className="font-bold text-white text-xs block">{ctx.name}</span>
          <span className="text-3xs text-slate-300">
            {ctx.age} yrs • {ctx.gender} • eGFR: <strong className="text-teal-300">{ctx.egfr} mL/min</strong> ({ctx.renalStatus})
          </span>
        </div>

        <div className="text-right">
          <span className="text-3xs text-rose-300 font-semibold px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-500/40 inline-block">
            {ctx.riskFindingsCount} Findings To Review
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-3xs text-slate-400">
        <div className="flex items-center gap-1">
          <Pill className="w-3 h-3 text-teal-400" />
          <span>{ctx.activeMedicationsCount} Active Medications</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>Verified against FDA DailyMed</span>
        </div>
      </div>
    </div>
  );
}
