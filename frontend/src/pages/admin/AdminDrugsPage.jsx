import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { drugApi } from '../../api/drugApi';
import { useToast } from '../../context/ToastContext';
import { errorMessage } from '../../lib/format';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { Card, CardBody, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';

export default function AdminDrugsPage() {
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [aliasFor, setAliasFor] = useState(null);
  const [deactivating, setDeactivating] = useState(null);
  const debounced = useDebouncedValue(term, 300);
  const toast = useToast();
  const queryClient = useQueryClient();

  const searching = debounced.trim().length >= 2;
  const query = useQuery({
    queryKey: ['admin-drugs', { debounced, page }],
    queryFn: () =>
      searching ? drugApi.search({ q: debounced.trim(), page, limit: 10 }) : drugApi.list({ page, limit: 10 }),
    placeholderData: keepPreviousData,
  });

  const classes = useQuery({ queryKey: ['drug-classes'], queryFn: () => drugApi.classes() });

  const deactivate = useMutation({
    mutationFn: (drug) => adminApi.deactivateDrug(drug.id),
    onSuccess: () => {
      toast.success('Drug deactivated', 'It stays in the catalog for historical records.');
      queryClient.invalidateQueries({ queryKey: ['admin-drugs'] });
      setDeactivating(null);
    },
    onError: (error) => toast.error('Could not deactivate', errorMessage(error)),
  });

  const rows = (query.data && query.data.items) || [];

  return (
    <>
      <PageHeader
        title="Drug catalog"
        description="Curated drug records. Deactivating hides a drug from new entries without deleting history."
        actions={
          <Button icon={Plus} onClick={() => setCreating(true)}>
            New drug
          </Button>
        }
      />

      <Card>
        <CardBody className="space-y-4">
          <SearchInput
            label="Search drugs"
            placeholder="Generic or brand name"
            value={term}
            onChange={(value) => {
              setTerm(value);
              setPage(1);
            }}
          />

          {query.isLoading && <LoadingSkeleton rows={4} />}
          {query.isError && <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />}

          <Table
            caption="Drug catalog"
            columns={[
              { key: 'generic', header: 'Generic name', render: (row) => row.genericName },
              { key: 'brand', header: 'Brand', render: (row) => row.brandName || '—' },
              { key: 'class', header: 'Class', render: (row) => (row.drugClass ? row.drugClass.name : '—') },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <Badge tone={row.isActive ? 'success' : 'neutral'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>,
              },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setAliasFor(row)}>
                      Aliases
                    </Button>
                    <Button variant="ghost" size="sm" disabled={!row.isActive} onClick={() => setDeactivating(row)}>
                      Deactivate
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={rows}
            getRowKey={(row) => row.id}
            empty={query.isSuccess ? <EmptyState title="No drugs" description="No catalog entry matched." /> : null}
          />

          {query.data && <Pagination pagination={query.data.pagination} onPageChange={setPage} />}
        </CardBody>
      </Card>

      <CreateDrugDialog open={creating} onClose={() => setCreating(false)} classes={classes.data || []} />
      <AliasDialog drug={aliasFor} onClose={() => setAliasFor(null)} />

      <ConfirmDialog
        open={Boolean(deactivating)}
        onClose={() => setDeactivating(null)}
        onConfirm={() => deactivate.mutate(deactivating)}
        loading={deactivate.isPending}
        variant="danger"
        title="Deactivate this drug?"
        confirmLabel="Deactivate"
        description={
          deactivating
            ? `${deactivating.genericName} will no longer be selectable. Existing medication records and rules are unchanged.`
            : ''
        }
      />
    </>
  );
}

function CreateDrugDialog({ open, onClose, classes }) {
  const [values, setValues] = useState({});
  const toast = useToast();
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: () =>
      adminApi.createDrug({
        genericName: values.genericName,
        brandName: values.brandName || undefined,
        description: values.description || undefined,
        drugClassId: values.drugClassId || undefined,
      }),
    onSuccess: () => {
      toast.success('Drug created');
      queryClient.invalidateQueries({ queryKey: ['admin-drugs'] });
      setValues({});
      onClose();
    },
    onError: (error) => toast.error('Could not create drug', errorMessage(error)),
  });

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Create drug">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <Input label="Generic name" required value={values.genericName || ''} onChange={set('genericName')} />
        <Input label="Brand name" value={values.brandName || ''} onChange={set('brandName')} />
        <Select
          label="Drug class"
          placeholder="Unclassified"
          value={values.drugClassId || ''}
          onChange={set('drugClassId')}
          options={classes.map((item) => ({ value: item.id, label: item.name }))}
        />
        <Textarea label="Description" rows={3} value={values.description || ''} onChange={set('description')} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AliasDialog({ drug, onClose }) {
  const [alias, setAlias] = useState('');
  const [type, setType] = useState('SYNONYM');
  const toast = useToast();
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: () => adminApi.addAlias(drug.id, { alias, type }),
    onSuccess: () => {
      toast.success('Alias added', 'Search and OCR normalization will match it.');
      queryClient.invalidateQueries({ queryKey: ['admin-drugs'] });
      setAlias('');
      onClose();
    },
    onError: (error) => toast.error('Could not add alias', errorMessage(error)),
  });

  return (
    <Modal open={Boolean(drug)} onClose={onClose} title={drug ? `Aliases for ${drug.genericName}` : ''}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          add.mutate();
        }}
      >
        {drug && (drug.aliases || []).length > 0 && (
          <ul className="space-y-1 text-sm text-ink">
            {drug.aliases.map((entry) => (
              <li key={entry.id} className="rounded border border-line px-2 py-1">
                {entry.alias} <span className="text-ink-muted">· {entry.type.toLowerCase()}</span>
              </li>
            ))}
          </ul>
        )}
        <Input label="Alias" required value={alias} onChange={(event) => setAlias(event.target.value)} />
        <Select
          label="Type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          options={['BRAND', 'SYNONYM', 'ABBREVIATION', 'MISSPELLING'].map((value) => ({
            value,
            label: value.charAt(0) + value.slice(1).toLowerCase(),
          }))}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" loading={add.isPending} disabled={alias.trim().length < 2}>
            Add alias
          </Button>
        </div>
      </form>
    </Modal>
  );
}
