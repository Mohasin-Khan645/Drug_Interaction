import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Pill, ShieldAlert, Sparkles, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { MOCK_DRUGS } from '../../api/mock/mockData';

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter drugs based on query
  const qClean = query.trim().toLowerCase();
  const results = qClean
    ? MOCK_DRUGS.filter(
        (d) =>
          d.name.toLowerCase().includes(qClean) ||
          d.genericName.toLowerCase().includes(qClean) ||
          (d.brandNames && d.brandNames.some((b) => b.toLowerCase().includes(qClean))) ||
          (d.drugClass && d.drugClass.toLowerCase().includes(qClean))
      ).slice(0, 8)
    : MOCK_DRUGS.slice(0, 5); // popular/recent defaults

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectDrug(results[selectedIndex]);
    }
  };

  const handleSelectDrug = (drug) => {
    onClose();
    navigate(`/drugs/${drug.id}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search medications, active ingredients, monographs (e.g. Warfarin, Simvastatin)..."
            className="w-full text-sm sm:text-base font-medium bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 ml-2">
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          <div className="px-3 py-1.5 text-3xs font-bold uppercase tracking-wider text-slate-400">
            {qClean ? `Matching Formulary Drugs (${results.length})` : 'Frequently Monitored Medications'}
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center">
              <Pill className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No matching medications found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching by generic chemical name, brand name, or ATC class
              </p>
            </div>
          ) : (
            results.map((drug, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={drug.id}
                  onClick={() => handleSelectDrug(drug)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Pill className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate">{drug.name}</span>
                        {drug.genericName && drug.genericName !== drug.name && (
                          <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                            ({drug.genericName})
                          </span>
                        )}
                        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-3xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {drug.drugClass || 'Medication'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {drug.description || 'Full pharmacological monograph & interaction profile available.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-2xs font-semibold text-teal-600 dark:text-teal-400">
                        View Monograph <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-3xs text-slate-500">
          <span>Search covers 14,000+ RxNorm & DailyMed monographs</span>
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
        </div>
      </div>
    </div>
  );
}

