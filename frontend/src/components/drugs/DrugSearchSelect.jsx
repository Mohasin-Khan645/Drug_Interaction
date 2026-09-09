import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { drugApi } from '../../api/drugApi';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { SearchInput } from '../ui/SearchInput';
import { drugDisplayName } from '../../lib/format';

/** Debounced catalog search used wherever a drug has to be picked. */
export function DrugSearchSelect({ onSelect, label = 'Search the drug catalog', placeholder, limit = 8 }) {
  const [term, setTerm] = useState('');
  const debounced = useDebouncedValue(term, 300);
  const enabled = debounced.trim().length >= 2;

  const query = useQuery({
    queryKey: ['drug-search', debounced, limit],
    queryFn: () => drugApi.search({ q: debounced.trim(), limit }),
    enabled,
  });

  const items = (query.data && query.data.items) || [];

  return (
    <div>
      <SearchInput value={term} onChange={setTerm} label={label} placeholder={placeholder || 'Type at least 2 characters…'} />

      {enabled && (
        <div className="mt-2 overflow-hidden rounded-lg border border-line">
          {query.isFetching && (
            <p className="flex items-center gap-2 px-3 py-2 text-sm text-ink-muted">
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              Searching…
            </p>
          )}
          {query.isSuccess && items.length === 0 && !query.isFetching && (
            <p className="px-3 py-2 text-sm text-ink-muted">No catalog match. Check the spelling or add it by name.</p>
          )}
          <ul className="max-h-64 divide-y divide-line overflow-y-auto">
            {items.map((drug) => (
              <li key={drug.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(drug);
                    setTerm('');
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{drugDisplayName(drug)}</span>
                    <span className="block truncate text-xs text-ink-muted">
                      {[drug.drugClass && drug.drugClass.name, drug.dosageForm, drug.route].filter(Boolean).join(' · ') ||
                        'No class recorded'}
                    </span>
                  </span>
                  <Plus aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-600" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
