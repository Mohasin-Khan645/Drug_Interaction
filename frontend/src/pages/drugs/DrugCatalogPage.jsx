import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Pill } from 'lucide-react';
import { drugApi } from '../../api/drugApi';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { PageHeader } from '../../components/ui/Card';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { DrugCard } from '../../components/drugs/DrugCard';
import { errorMessage } from '../../lib/format';

export default function DrugCatalogPage() {
  const [term, setTerm] = useState('');
  const [drugClassId, setDrugClassId] = useState('');
  const [sortBy, setSortBy] = useState('genericName');
  const [page, setPage] = useState(1);
  const debouncedTerm = useDebouncedValue(term, 300);
  const searching = debouncedTerm.trim().length >= 2;

  const classes = useQuery({ queryKey: ['drug-classes'], queryFn: () => drugApi.classes() });

  const query = useQuery({
    queryKey: ['drugs', { debouncedTerm, drugClassId, sortBy, page, searching }],
    queryFn: () =>
      searching
        ? drugApi.search({ q: debouncedTerm.trim(), page, limit: 12, sortBy })
        : drugApi.list({ page, limit: 12, sortBy, drugClassId: drugClassId || undefined }),
    placeholderData: keepPreviousData,
  });

  const items = (query.data && query.data.items) || [];

  return (
    <>
      <PageHeader
        title="Drug catalog"
        description="Search the curated catalog by generic name, brand, ingredient, class or identifier."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <SearchInput
          value={term}
          onChange={(value) => {
            setTerm(value);
            setPage(1);
          }}
          label="Search drugs"
          placeholder="Search by name, brand or ingredient…"
        />
        <Select
          label="Class"
          value={drugClassId}
          placeholder="All classes"
          disabled={searching}
          onChange={(event) => {
            setDrugClassId(event.target.value);
            setPage(1);
          }}
          options={(classes.data || []).map((item) => ({ value: item.id, label: item.name }))}
        />
        <Select
          label="Sort by"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          options={[
            { value: 'genericName', label: 'Generic name' },
            { value: 'brandName', label: 'Brand name' },
            { value: 'createdAt', label: 'Recently added' },
          ]}
        />
      </div>

      {searching && (
        <p className="mb-3 text-sm text-ink-muted">
          Showing results for “{debouncedTerm.trim()}”. Class filtering applies to the full catalog only.
        </p>
      )}

      {query.isLoading && <LoadingSkeleton rows={4} />}
      {query.isError && <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />}

      {query.isSuccess && items.length === 0 && (
        <div className="card">
          <EmptyState
            icon={Pill}
            title="No drugs matched"
            description="Try a different spelling, a brand name, or an active ingredient."
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((drug) => (
          <DrugCard key={drug.id} drug={drug} />
        ))}
      </div>

      {query.data && (
        <div className="card mt-5">
          <Pagination pagination={query.data.pagination} onPageChange={setPage} />
        </div>
      )}
    </>
  );
}
