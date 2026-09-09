import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDate } from '../../lib/format';
import { SEVERITIES } from '../../lib/constants';
import { severityMeta } from '../../lib/severity';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Badge, SeverityBadge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Alert, EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { DrugSearchSelect } from '../../components/drugs/DrugSearchSelect';

const severityField = { name: 'severity', label: 'Severity', type: 'select', options: SEVERITIES, required: true };

/**
 * Field specs per rule kind. They mirror the backend validators so an admin
 * cannot submit a shape the API will reject.
 */
export const RULE_FIELDS = {
  interaction: [
    { name: 'drugAId', label: 'First drug', type: 'drug', required: true },
    { name: 'drugBId', label: 'Second drug', type: 'drug', required: true },
    severityField,
    { name: 'interactionType', label: 'Interaction type' },
    { name: 'clinicalEffect', label: 'Clinical effect', type: 'textarea' },
    { name: 'mechanism', label: 'Mechanism', type: 'textarea' },
    { name: 'management', label: 'Management', type: 'textarea' },
  ],
  disease: [
    { name: 'drugId', label: 'Drug', type: 'drug', required: true },
    { name: 'conditionId', label: 'Condition ID', required: true, hint: 'UUID of the curated condition.' },
    {
      name: 'ruleType',
      label: 'Rule type',
      type: 'select',
      options: ['CONTRAINDICATION', 'PRECAUTION', 'WARNING'],
      required: true,
    },
    severityField,
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'management', label: 'Management', type: 'textarea' },
  ],
  allergy: [
    { name: 'allergen', label: 'Allergen', required: true },
    {
      name: 'relation',
      label: 'Relation',
      type: 'select',
      options: ['EXACT_DRUG', 'INGREDIENT', 'CLASS', 'CROSS_SENSITIVITY'],
      required: true,
    },
    { name: 'drugId', label: 'Drug', type: 'drug' },
    severityField,
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'management', label: 'Management', type: 'textarea' },
  ],
  duplication: [
    {
      name: 'ruleType',
      label: 'Rule type',
      type: 'select',
      options: ['SAME_DRUG', 'SAME_INGREDIENT', 'THERAPEUTIC'],
      required: true,
    },
    severityField,
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'management', label: 'Management', type: 'textarea' },
  ],
  factor: [
    { name: 'drugId', label: 'Drug', type: 'drug', required: true },
    {
      name: 'factorType',
      label: 'Factor',
      type: 'select',
      options: ['AGE_MIN', 'AGE_MAX', 'WEIGHT_MIN', 'WEIGHT_MAX', 'RENAL_FUNCTION', 'HEPATIC_FUNCTION', 'LAB_VALUE'],
      required: true,
    },
    { name: 'labCode', label: 'Lab code' },
    { name: 'operator', label: 'Operator', type: 'select', options: ['LT', 'LTE', 'GT', 'GTE', 'EQ'], required: true },
    { name: 'threshold', label: 'Threshold', type: 'number', required: true },
    { name: 'unit', label: 'Unit' },
    severityField,
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'management', label: 'Management', type: 'textarea' },
  ],
};

const describeRule = (kind, rule) => {
  if (kind === 'interaction') return rule.interactionType || rule.clinicalEffect || 'Drug–drug interaction';
  return rule.description || rule.allergen || rule.ruleType || '—';
};

export function RulesManager({ kind, title, description }) {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [deactivating, setDeactivating] = useState(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-rules', kind, page],
    queryFn: () => adminApi.listRules(kind, { page, limit: 10 }),
    placeholderData: keepPreviousData,
  });

  const deactivate = useMutation({
    mutationFn: (rule) => adminApi.deactivateRule(kind, rule.id),
    onSuccess: () => {
      toast.success('Rule deactivated', 'Past findings that used it are unchanged.');
      queryClient.invalidateQueries({ queryKey: ['admin-rules', kind] });
      setDeactivating(null);
    },
    onError: (error) => toast.error('Could not deactivate', errorMessage(error)),
  });

  const rows = (query.data && query.data.items) || [];

  return (
    <>
      <Card>
        <CardHeader
          title={title}
          description={description}
          action={
            <Button size="sm" icon={Plus} onClick={() => setCreating(true)}>
              New rule
            </Button>
          }
        />
        <CardBody className="space-y-4">
          <Alert tone="info" title="Rules are versioned.">
            Editing a rule archives the current version and creates the next one, so historical safety results stay
            reproducible.
          </Alert>

          {query.isLoading && <LoadingSkeleton rows={4} />}
          {query.isError && <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />}

          <Table
            caption={`${title} rules`}
            columns={[
              { key: 'summary', header: 'Rule', render: (row) => describeRule(kind, row) },
              { key: 'severity', header: 'Severity', render: (row) => <SeverityBadge severity={row.severity} /> },
              { key: 'version', header: 'Version', render: (row) => `v${row.version ?? 1}` },
              { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
              { key: 'created', header: 'Created', render: (row) => formatDate(row.createdAt) },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <Button variant="ghost" size="sm" disabled={row.status !== 'ACTIVE'} onClick={() => setDeactivating(row)}>
                    Deactivate
                  </Button>
                ),
              },
            ]}
            rows={rows}
            getRowKey={(row) => row.id}
            empty={query.isSuccess ? <EmptyState title="No rules" description="No curated rule of this kind yet." /> : null}
          />

          {query.data && <Pagination pagination={query.data.pagination} onPageChange={setPage} />}
        </CardBody>
      </Card>

      <RuleDialog kind={kind} open={creating} onClose={() => setCreating(false)} />

      <ConfirmDialog
        open={Boolean(deactivating)}
        onClose={() => setDeactivating(null)}
        onConfirm={() => deactivate.mutate(deactivating)}
        loading={deactivate.isPending}
        variant="danger"
        title="Deactivate this rule?"
        confirmLabel="Deactivate"
        description="New safety checks will stop applying it. Existing findings and reports are untouched."
      />
    </>
  );
}

function RuleDialog({ kind, open, onClose }) {
  const [values, setValues] = useState({});
  const toast = useToast();
  const queryClient = useQueryClient();
  const fields = RULE_FIELDS[kind] || [];

  const create = useMutation({
    mutationFn: () => {
      const payload = {};
      fields.forEach((field) => {
        const value = values[field.name];
        if (value === undefined || value === '') return;
        payload[field.name] = field.type === 'number' ? Number(value) : value;
      });
      return adminApi.createRule(kind, payload);
    },
    onSuccess: () => {
      toast.success('Rule created', 'It applies to safety checks from now on.');
      queryClient.invalidateQueries({ queryKey: ['admin-rules', kind] });
      setValues({});
      onClose();
    },
    onError: (error) => toast.error('Could not create rule', errorMessage(error)),
  });

  const set = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  return (
    <Modal open={open} onClose={onClose} title="Create rule" size="lg">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        {fields.map((field) => {
          if (field.type === 'drug') {
            return (
              <div key={field.name}>
                <DrugSearchSelect label={field.label} onSelect={(drug) => set(field.name, drug.id)} />
                {values[field.name] && <p className="hint mt-1">Selected drug id: {values[field.name]}</p>}
              </div>
            );
          }
          if (field.type === 'select') {
            return (
              <Select
                key={field.name}
                label={field.label}
                required={field.required}
                placeholder="Select…"
                value={values[field.name] || ''}
                onChange={(event) => set(field.name, event.target.value)}
                options={field.options.map((value) => ({
                  value,
                  label: field.name === 'severity' ? severityMeta(value).label : value.replace(/_/g, ' ').toLowerCase(),
                }))}
              />
            );
          }
          if (field.type === 'textarea') {
            return (
              <Textarea
                key={field.name}
                label={field.label}
                required={field.required}
                rows={2}
                value={values[field.name] || ''}
                onChange={(event) => set(field.name, event.target.value)}
              />
            );
          }
          return (
            <Input
              key={field.name}
              label={field.label}
              hint={field.hint}
              required={field.required}
              type={field.type === 'number' ? 'number' : 'text'}
              step={field.type === 'number' ? 'any' : undefined}
              value={values[field.name] || ''}
              onChange={(event) => set(field.name, event.target.value)}
            />
          );
        })}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Create rule
          </Button>
        </div>
      </form>
    </Modal>
  );
}
