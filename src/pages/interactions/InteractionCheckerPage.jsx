import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  X,
  Sparkles,
  Plus,
  ArrowRight,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileCheck,
  RotateCcw,
  Pill,
} from 'lucide-react';
import { interactionApi } from '../../api/interactionApi';
import { drugApi } from '../../api/drugApi';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import SeverityBadge from '../../components/common/SeverityBadge';
import FindingCard from '../../components/clinical/FindingCard';
import AIExplanationModal from '../../components/clinical/AIExplanationModal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

export default function InteractionCheckerPage() {
  const [searchParams] = useSearchParams();
  const prefill = searchParams.get('prefill');
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  // Selected medications state (default clinical pair: Warfarin & Aspirin)
  const [selectedDrugs, setSelectedDrugs] = useState(() => {
    if (prefill) {
      return [prefill, 'Aspirin'];
    }
    return ['Warfarin', 'Aspirin'];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // AI Modal state
  const [aiModalFinding, setAiModalFinding] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Added to report tracking
  const [reportFindings, setReportFindings] = useState([]);

  // Safety Analysis Mutation
  const checkMutation = useMutation({
    mutationFn: async (drugs) => {
      const res = await interactionApi.checkInteractions(drugs);
      return res.data;
    },
  });

  // Automatically analyze initial drugs on mount
  useEffect(() => {
    if (selectedDrugs.length > 0) {
      checkMutation.mutate(selectedDrugs);
    }
  }, []);

  // Medication search autocomplete
  useEffect(() => {
    let active = true;
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await drugApi.searchDrugs({ search: searchQuery, limit: 5 });
        if (active) {
          setSearchResults(res.data || []);
        }
      } finally {
        if (active) setIsSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleAddDrug = (drugName) => {
    if (!selectedDrugs.some((d) => d.toLowerCase() === drugName.toLowerCase())) {
      const next = [...selectedDrugs, drugName];
      setSelectedDrugs(next);
      setSearchQuery('');
      setSearchResults([]);
      checkMutation.mutate(next);
    }
  };

  const handleRemoveDrug = (drugToRemove) => {
    const next = selectedDrugs.filter((d) => d !== drugToRemove);
    setSelectedDrugs(next);
    if (next.length > 0) {
      checkMutation.mutate(next);
    } else {
      checkMutation.reset();
    }
  };

  const handleRunCheck = () => {
    if (selectedDrugs.length === 0) {
      addToast({
        title: 'Selection Required',
        message: 'Please add at least one medication to evaluate.',
        type: 'warning',
      });
      return;
    }
    checkMutation.mutate(selectedDrugs);
  };

  const handleExplainAI = (finding) => {
    setAiModalFinding(finding);
    setIsAiModalOpen(true);
  };

  const handleAddToReport = (finding) => {
    if (!reportFindings.some((f) => f.id === finding.id)) {
      setReportFindings((prev) => [...prev, finding]);
      addToast({
        title: 'Finding Added to Report',
        message: `${finding.title} will be included in the exported report.`,
        type: 'success',
      });
    }
  };

  const results = checkMutation.data;
  const isAnalyzing = checkMutation.isPending;

  // Preset clinical combinations for quick evaluation
  const presets = [
    { label: 'Bleed Risk: Warfarin + Aspirin', drugs: ['Warfarin', 'Aspirin'] },
    { label: 'Myopathy: Simvastatin + Clarithromycin', drugs: ['Simvastatin', 'Clarithromycin'] },
    { label: 'Hyperkalemia: Lisinopril + Spironolactone', drugs: ['Lisinopril', 'Spironolactone'] },
    { label: 'Triple Therapy: Warfarin + Aspirin + Lisinopril', drugs: ['Warfarin', 'Aspirin', 'Lisinopril'] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
          Clinical Decision Support Engine
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Multi-Medication Safety & Interaction Checker
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Simulate combinations of prescription medications, OTC remedies, and herbal supplements against verified pharmacological rules.
        </p>
      </div>

      {/* Main Selection & Action Card with 3D Depth */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-3d border border-teal-100 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-teal-700 -rotate-45" />
            Medication Selection & Formulary Matrix
          </label>
          <span className="text-3xs font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Real-Time Evaluator
          </span>
        </div>

        {/* Autocomplete Input */}
        <div className="relative">
          <div className="flex items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medication to add (e.g. Warfarin, Simvastatin, Clarithromycin, Metformin)..."
              className="w-full text-xs rounded-xl border border-slate-300 py-3 pl-10 pr-4 bg-white/90 text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 shadow-2xs"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-30 py-1.5 animate-in fade-in duration-150">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAddDrug(item.name)}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-teal-50 flex items-center justify-between group transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900 group-hover:text-teal-900">
                      {item.name}
                    </span>
                    <span className="text-2xs text-slate-500 ml-2">
                      ({item.genericName})
                    </span>
                  </div>
                  <span className="text-3xs px-2 py-0.5 rounded bg-slate-100 group-hover:bg-teal-100 text-slate-600 font-semibold">
                    {item.drugClass}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Drugs Chips Container with 3D Tactile Styling */}
        <div>
          <span className="text-2xs font-semibold text-slate-500 block mb-2">
            Selected Agents for Evaluation ({selectedDrugs.length}):
          </span>

          {selectedDrugs.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
              No medications currently selected. Type a medication above or click a clinical preset below.
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {selectedDrugs.map((drug) => (
                <span
                  key={drug}
                  className="card-3d inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-300 text-teal-950 shadow-2xs animate-in zoom-in-95 duration-150"
                >
                  <Pill className="w-3.5 h-3.5 text-teal-700 -rotate-45" />
                  <span>{drug}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDrug(drug)}
                    className="p-0.5 rounded-full hover:bg-teal-200/80 text-teal-700 transition-colors"
                    aria-label={`Remove ${drug}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={() => setSelectedDrugs([])}
                className="text-2xs font-medium text-slate-400 hover:text-red-600 ml-2 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Clinical Presets for Instant Demo */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-2xs text-slate-500">
          <span className="font-semibold text-slate-400">Clinical Test Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedDrugs(p.drugs);
                checkMutation.mutate(p.drugs);
              }}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-900 transition-colors font-medium text-slate-700"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
          <span className="text-2xs text-slate-400">
            Engine evaluates Drug-Drug, Drug-Disease, Drug-Allergy & Organ Dosing rules.
          </span>

          <Button
            variant="primary"
            size="md"
            onClick={handleRunCheck}
            isLoading={isAnalyzing}
            icon={ShieldCheck}
            disabled={selectedDrugs.length === 0}
            className="px-6 text-xs font-bold"
          >
            {isAnalyzing ? 'Analyzing medication combination...' : 'CHECK MEDICATION SAFETY'}
          </Button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {isAnalyzing && (
        <div className="bg-white p-8 rounded-2xl border border-teal-200 shadow-subtle text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto animate-spin">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Analyzing medication combination...
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cross-referencing selected agents across RxNorm active ingredients, DailyMed package inserts, and contraindicated metabolic pathways.
          </p>
        </div>
      )}

      {!isAnalyzing && results && (
        <div className="space-y-6">
          {/* Overall Safety Status Banner with 3D Depth & Glow */}
          <div
            className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3d transition-all ${
              results.overallSafetyStatus === 'CRITICAL_CONCERN'
                ? 'bg-gradient-to-r from-red-50 via-rose-50 to-red-100 border-red-300 text-red-950 glow-halo-rose'
                : results.overallSafetyStatus === 'MAJOR_CONCERN'
                ? 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100 border-orange-300 text-orange-950 glow-halo-amber'
                : results.overallSafetyStatus === 'MODERATE_PRECAUTION'
                ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border-amber-300 text-amber-950'
                : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-emerald-300 text-emerald-950 glow-halo-teal'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                  results.overallSafetyStatus === 'CRITICAL_CONCERN'
                    ? 'bg-red-600 shadow-glow-rose'
                    : results.overallSafetyStatus === 'MAJOR_CONCERN'
                    ? 'bg-orange-600 shadow-glow-amber'
                    : results.overallSafetyStatus === 'MODERATE_PRECAUTION'
                    ? 'bg-amber-600'
                    : 'bg-emerald-600 shadow-glow-teal'
                }`}
              >
                {results.overallSafetyStatus === 'CRITICAL_CONCERN' ? (
                  <AlertOctagon className="w-6 h-6" />
                ) : results.overallSafetyStatus === 'MAJOR_CONCERN' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>

              <div>
                <span className="text-2xs font-bold uppercase tracking-wider opacity-80 block">
                  Overall Safety Evaluation Status
                </span>
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {results.overallSafetyStatus === 'CRITICAL_CONCERN'
                    ? 'Critical Safety Concern Detected'
                    : results.overallSafetyStatus === 'MAJOR_CONCERN'
                    ? 'Major Clinical Concern Identified'
                    : results.overallSafetyStatus === 'MODERATE_PRECAUTION'
                    ? 'Moderate Precaution Advised'
                    : 'Verified Safe Compatibility'}
                </h2>
                <p className="text-xs opacity-90 mt-0.5">
                  Detected {results.totalFindings} clinical safety finding{results.totalFindings === 1 ? '' : 's'} across {results.evaluatedMedications?.length} evaluated agents.
                </p>
              </div>
            </div>

            {reportFindings.length > 0 && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate('/reports')}
                icon={FileCheck}
                className="text-xs whitespace-nowrap bg-teal-800 hover:bg-teal-900 self-start sm:self-center"
              >
                View Report ({reportFindings.length} Saved)
              </Button>
            )}
          </div>

          {/* Grouped Findings by Severity Hierarchy */}
          <div className="space-y-6">
            {/* CRITICAL FINDINGS */}
            {results.groupedFindings?.CRITICAL?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity="CRITICAL" size="md" />
                  <span className="text-xs font-bold text-red-900">
                    High-Risk Life Threatening / Major Harm ({results.groupedFindings.CRITICAL.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {results.groupedFindings.CRITICAL.map((finding) => (
                    <FindingCard
                      key={finding.id}
                      finding={finding}
                      onExplainAI={handleExplainAI}
                      onAddToReport={handleAddToReport}
                      isAddedToReport={reportFindings.some((f) => f.id === finding.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* MAJOR FINDINGS */}
            {results.groupedFindings?.MAJOR?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity="MAJOR" size="md" />
                  <span className="text-xs font-bold text-orange-900">
                    Significant Clinical Consequence / Intervention Required ({results.groupedFindings.MAJOR.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {results.groupedFindings.MAJOR.map((finding) => (
                    <FindingCard
                      key={finding.id}
                      finding={finding}
                      onExplainAI={handleExplainAI}
                      onAddToReport={handleAddToReport}
                      isAddedToReport={reportFindings.some((f) => f.id === finding.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* MODERATE FINDINGS */}
            {results.groupedFindings?.MODERATE?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity="MODERATE" size="md" />
                  <span className="text-xs font-bold text-amber-900">
                    Moderate Precaution / Monitor Closely ({results.groupedFindings.MODERATE.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {results.groupedFindings.MODERATE.map((finding) => (
                    <FindingCard
                      key={finding.id}
                      finding={finding}
                      onExplainAI={handleExplainAI}
                      onAddToReport={handleAddToReport}
                      isAddedToReport={reportFindings.some((f) => f.id === finding.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* MINOR & INFORMATIONAL */}
            {(results.groupedFindings?.INFORMATIONAL?.length > 0 || results.groupedFindings?.MINOR?.length > 0) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity="INFORMATIONAL" size="md" />
                  <span className="text-xs font-bold text-slate-700">
                    Informational Observations & Compatible Formularies
                  </span>
                </div>
                <div className="space-y-3">
                  {[...(results.groupedFindings.MINOR || []), ...(results.groupedFindings.INFORMATIONAL || [])].map((finding) => (
                    <FindingCard
                      key={finding.id}
                      finding={finding}
                      onExplainAI={handleExplainAI}
                      onAddToReport={handleAddToReport}
                      isAddedToReport={reportFindings.some((f) => f.id === finding.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grounded AI Explanation Modal */}
      <AIExplanationModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        finding={aiModalFinding}
      />
    </div>
  );
}
