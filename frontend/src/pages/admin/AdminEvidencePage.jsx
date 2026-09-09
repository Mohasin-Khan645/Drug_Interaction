import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDate } from '../../lib/format';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { Card, CardBody, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { Alert, EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';

export default function AdminEvidencePage() {
  const [term, setTerm] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [page, setPage] = useState(1);
  const [addingSource, setAddingSource] = useState(false);
  const [addingDocument, setAddingDocument] = useState(false);
  const debounced = useDebouncedValue(term, 300);

  const sources = useQuery({ queryKey: ['evidence-sources'], queryFn: () => adminApi.listSources() });
  const documents = useQuery({
    queryKey: ['evidence-documents', { debounced, sourceId, page }],
    queryFn: () =>
      adminApi.listDocuments({
        q: debounced || undefined,
        sourceId: sourceId || undefined,
        page,
        limit: 10,
      }),
    placeholderData: keepPreviousData,
  });

  const sourceList = sources.data || [];
  const rows = (documents.data && documents.data.items) || [];

  return (
    <>
      <PageHeader
        title="Evidence library"
        description="Every finding and AI explanation must cite one of these curated documents."
      />

      <Alert tone="info" title="Evidence is the grounding boundary." className="mb-6">
        The AI explainer may only quote documents stored here. It never generates new references.
      </Alert>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader
            title="Sources"
            action={
              <Button size="sm" variant="secondary" icon={Plus} onClick={() => setAddingSource(true)}>
                Add
              </Button>
            }
          />
          <CardBody className="space-y-2">
            {sources.isLoading && <LoadingSkeleton rows={3} />}
            {sources.isError && <ErrorState description={errorMessage(sources.error)} onRetry={sources.refetch} />}
            {sources.isSuccess && sourceList.length === 0 && (
              <EmptyState title="No sources" description="Add a reference source first." />
            )}
            {sourceList.map((source) => (
              <button
                key={source.id}
                type="button"
                onClick={() => {
                  setSourceId(sourceId === source.id ? '' : source.id);
                  setPage(1);
                }}
                aria-pressed={sourceId === source.id}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                  sourceId === source.id ? 'border-brand-500 bg-brand-50' : 'border-line hover:border-brand-300'
                }`}
              >
                <span className="font-medium text-ink">{source.name}</span>
                {source.version && <span className="text-ink-muted"> · {source.version}</span>}
              </button>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Documents"
            action={
              <Button size="sm" icon={Plus} onClick={() => setAddingDocument(true)} disabled={sourceList.length === 0}>
                New document
              </Button>
            }
          />
          <CardBody className="space-y-4">
            <SearchInput
              label="Search evidence"
              placeholder="Title or content"
              value={term}
              onChange={(value) => {
                setTerm(value);
                setPage(1);
              }}
            />

            {documents.isLoading && <LoadingSkeleton rows={4} />}
            {documents.isError && (
              <ErrorState description={errorMessage(documents.error)} onRetry={documents.refetch} />
            )}

            <Table
              caption="Evidence documents"
              columns={[
                { key: 'title', header: 'Title', render: (row) => row.title },
                { key: 'source', header: 'Source', render: (row) => (row.source ? row.source.name : '—') },
                { key: 'level', header: 'Level', render: (row) => row.evidenceLevel || '—' },
                { key: 'reviewed', header: 'Reviewed', render: (row) => formatDate(row.reviewedAt) },
              ]}
              rows={rows}
              getRowKey={(row) => row.id}
              empty={
                documents.isSuccess ? (
                  <EmptyState title="No documents" description="No evidence matched this filter." />
                ) : null
              }
            />

            {documents.data && <Pagination pagination={documents.data.pagination} onPageChange={setPage} />}
          </CardBody>
        </Card>
      </div>

      <SourceDialog open={addingSource} onClose={() => setAddingSource(false)} />
      <DocumentDialog open={addingDocument} onClose={() => setAddingDocument(false)} sources={sourceList} />
    </>
  );
}

function SourceDialog({ open, onClose }) {
  const [values, setValues] = useState({});
  const toast = useToast();
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: () =>
      adminApi.createSource({
        name: values.name,
        url: values.url || undefined,
        version: values.version || undefined,
        description: values.description || undefined,
      }),
    onSuccess: () => {
      toast.success('Source added');
      queryClient.invalidateQueries({ queryKey: ['evidence-sources'] });
      setValues({});
      onClose();
    },
    onError: (error) => toast.error('Could not add source', errorMessage(error)),
  });

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Add evidence source">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <Input label="Name" required value={values.name || ''} onChange={set('name')} />
        <Input label="URL" type="url" value={values.url || ''} onChange={set('url')} />
        <Input label="Version" value={values.version || ''} onChange={set('version')} />
        <Textarea label="Description" rows={2} value={values.description || ''} onChange={set('description')} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Add source
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DocumentDialog({ open, onClose, sources }) {
  const [values, setValues] = useState({});
  const toast = useToast();
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: () =>
      adminApi.createDocument({
        sourceId: values.sourceId,
        title: values.title,
        content: values.content,
        reference: values.reference || undefined,
        version: values.version || undefined,
        evidenceLevel: values.evidenceLevel || undefined,
      }),
    onSuccess: () => {
      toast.success('Evidence document added');
      queryClient.invalidateQueries({ queryKey: ['evidence-documents'] });
      setValues({});
      onClose();
    },
    onError: (error) => toast.error('Could not add document', errorMessage(error)),
  });

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Add evidence document" size="lg">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <Select
          label="Source"
          required
          placeholder="Select a source"
          value={values.sourceId || ''}
          onChange={set('sourceId')}
          options={sources.map((source) => ({ value: source.id, label: source.name }))}
        />
        <Input label="Title" required value={values.title || ''} onChange={set('title')} />
        <Textarea
          label="Content"
          required
          rows={6}
          hint="Quoted reference text. This is what the AI explainer may cite."
          value={values.content || ''}
          onChange={set('content')}
        />
        <Input label="Reference" value={values.reference || ''} onChange={set('reference')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Version" value={values.version || ''} onChange={set('version')} />
          <Input label="Evidence level" value={values.evidenceLevel || ''} onChange={set('evidenceLevel')} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Add document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
