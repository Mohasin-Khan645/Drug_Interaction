import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Pill, Plus, ArrowRight, ShieldCheck, Database, X } from 'lucide-react';
import { drugApi } from '../../api/drugApi';
import { medicationApi } from '../../api/medicationApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useNotifications } from '../../context/NotificationContext';
import SearchInput from '../../components/common/SearchInput';
import DrugCard from '../../components/clinical/DrugCard';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';

export default function DrugSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedClass, setSelectedClass] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: drugData, isLoading } = useQuery({
    queryKey: ['drugs', debouncedSearch, selectedClass, page],
    queryFn: async () => {
      const res = await drugApi.searchDrugs({
        search: debouncedSearch,
        drugClass: selectedClass || undefined,
        page,
        limit: pageSize,
      });
      return res;
    },
  });

  const drugs = drugData?.data || [];
  const total = drugData?.total || 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const handleAddMedication = async (drug) => {
    try {
      await medicationApi.addMedication({
        medicationName: drug.name,
        genericName: drug.genericName,
        strength: drug.strength || 'Standard Dose',
        form: drug.dosageForms?.[0] || 'Tablet',
        route: drug.route || 'Oral',
        frequency: 'Once daily',
        source: 'Manual',
        rxNormCode: drug.rxNormCode,
        startDate: new Date().toISOString().split('T')[0],
      });
      addToast({
        title: 'Medication Added',
        message: `${drug.name} has been added to your active medication list.`,
        type: 'success',
      });
    } catch {
      addToast({
        title: 'Error',
        message: 'Could not add medication. Please try again.',
        type: 'error',
      });
    }
  };

  const handleCheckInteraction = (drug) => {
    navigate(`/interactions?prefill=${encodeURIComponent(drug.name)}`);
  };

  const drugClassOptions = [
    'Vitamin K Antagonist Anticoagulant',
    'Salicylate / Antiplatelet / NSAID',
    'Angiotensin Converting Enzyme (ACE) Inhibitor',
    'Biguanide Antidiabetic Agent',
    'Aminopenicillin Antibiotic',
    'HMG-CoA Reductase Inhibitor (Statin)',
    'Macrolide Antibiotic / Potent CYP3A4 Inhibitor',
    'Aldosterone Receptor Antagonist / Potassium-Sparing Diuretic',
    'Nonsteroidal Anti-inflammatory Drug (NSAID)',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
          Pharmacopeia Knowledgebase
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Medication Search & Clinical Monographs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search across generic names, brand names, active ingredients, RxNorm codes, and pharmacological classes.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <SearchInput
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
            placeholder="Type medication name (e.g. Warfarin, Aspirin, Lisinopril, Metformin)..."
            isLoading={isLoading}
            className="flex-1"
          />

          <div className="w-full sm:w-72">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-300 py-2.5 px-3 bg-white text-slate-700 focus:border-teal-600 focus:outline-none"
            >
              <option value="">All Drug Classes</option>
              {drugClassOptions.map((dc) => (
                <option key={dc} value={dc}>
                  {dc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Search Tags */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-1">
          <span className="text-2xs font-semibold text-slate-400">Popular Queries:</span>
          {['Warfarin', 'Aspirin', 'Lisinopril', 'Metformin', 'Amoxicillin', 'Simvastatin'].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setSearchTerm(name);
                setPage(1);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-2xs font-medium transition-colors"
            >
              {name}
            </button>
          ))}
          {selectedClass && (
            <button
              type="button"
              onClick={() => setSelectedClass('')}
              className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-2xs font-medium flex items-center gap-1"
            >
              <span>Class: {selectedClass.substring(0, 20)}...</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Results Count & Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span>
            Found <strong className="text-slate-800">{total}</strong> verified formulary medications
          </span>
          <span className="text-2xs text-teal-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> RxNorm & DailyMed Synced
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LoadingSkeleton variant="card" count={6} />
          </div>
        ) : drugs.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="No matching medications found"
            description="No medications matched your query. Try searching by generic ingredient (e.g. Warfarin) or brand name (e.g. Coumadin)."
            actionLabel="Reset Search Filters"
            onAction={() => {
              setSearchTerm('');
              setSelectedClass('');
              setPage(1);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drugs.map((drug) => (
              <DrugCard
                key={drug.id}
                drug={drug}
                onViewDetails={() => navigate(`/drugs/${drug.id}`)}
                onAddMedication={handleAddMedication}
                onCheckInteraction={handleCheckInteraction}
              />
            ))}
          </div>
        )}

        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
    </div>
  );
}
