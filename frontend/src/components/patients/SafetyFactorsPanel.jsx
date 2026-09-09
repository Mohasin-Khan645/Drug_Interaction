import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { patientApi } from '../../api/patientApi';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDate, titleCase } from '../../lib/format';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { EmptyState, LoadingSkeleton } from '../ui/Feedback';

const ALLERGY_SEVERITIES = ['MILD', 'MODERATE', 'SEVERE', 'UNKNOWN'];
const CONDITION_STATUSES = ['ACTIVE', 'RESOLVED', 'SUSPECTED'];

/**
 * Conditions, allergies and lab values feed the deterministic safety engines,
 * so they are editable in one place with the same emphasis as medications.
 */
export function SafetyFactorsPanel({ patientId, canEdit = true }) {
  const [dialog, setDialog] = useState(null);

  const conditions = useQuery({
    queryKey: ['conditions', patientId],
    queryFn: () => patientApi.listConditions(patientId),
    enabled: Boolean(patientId),
  });
  const allergies = useQuery({
    queryKey: ['allergies', patientId],
    queryFn: () => patientApi.listAllergies(patientId),
    enabled: Boolean(patientId),
  });
  const labs = useQuery({
    queryKey: ['labs', patientId],
    queryFn: () => patientApi.listLabResults(patientId),
    enabled: Boolean(patientId),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader
          title="Conditions"
          action={
            canEdit ? (
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setDialog('condition')}>
                Add
              </Button>
            ) : null
          }
        />
        <CardBody className="space-y-2">
          {conditions.isLoading && <LoadingSkeleton rows={2} />}
          {conditions.isSuccess && conditions.data.length === 0 && (
            <EmptyState title="No conditions recorded" description="Conditions drive drug–disease screening." />
          )}
          {(conditions.data || []).map((entry) => (
            <div key={entry.id} className="rounded-lg border border-line px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{entry.condition.name}</span>
                <Badge>{titleCase(entry.status)}</Badge>
              </div>
              {entry.notes && <p className="text-sm text-ink-muted">{entry.notes}</p>}
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Allergies"
          action={
            canEdit ? (
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setDialog('allergy')}>
                Add
              </Button>
            ) : null
          }
        />
        <CardBody className="space-y-2">
          {allergies.isLoading && <LoadingSkeleton rows={2} />}
          {allergies.isSuccess && allergies.data.length === 0 && (
            <EmptyState title="No allergies recorded" description="Allergies drive drug–allergy screening." />
          )}
          {(allergies.data || []).map((entry) => (
            <div key={entry.id} className="rounded-lg border border-line px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{entry.allergen}</span>
                <Badge tone={entry.severity === 'SEVERE' ? 'danger' : 'neutral'}>{titleCase(entry.severity)}</Badge>
              </div>
              {entry.reaction && <p className="text-sm text-ink-muted">{entry.reaction}</p>}
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Lab results"
          action={
            canEdit ? (
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setDialog('lab')}>
                Add
              </Button>
            ) : null
          }
        />
        <CardBody className="space-y-2">
          {labs.isLoading && <LoadingSkeleton rows={2} />}
          {labs.isSuccess && labs.data.length === 0 && (
            <EmptyState title="No lab results" description="Renal and hepatic values refine patient-factor rules." />
          )}
          {(labs.data || []).map((entry) => (
            <div key={entry.id} className="rounded-lg border border-line px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{entry.name}</span>
                <span className="text-sm text-ink">
                  {entry.value} {entry.unit || ''}
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                {entry.code} · {formatDate(entry.takenAt)}
              </p>
            </div>
          ))}
        </CardBody>
      </Card>

      <AddFactorDialog patientId={patientId} kind={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}

function AddFactorDialog({ patientId, kind, onClose }) {
  const [values, setValues] = useState({});
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (kind === 'condition') {
        return patientApi.addCondition(patientId, {
          name: values.name,
          status: values.status || 'ACTIVE',
          notes: values.notes || undefined,
        });
      }
      if (kind === 'allergy') {
        return patientApi.addAllergy(patientId, {
          allergen: values.allergen,
          reaction: values.reaction || undefined,
          severity: values.severity || 'UNKNOWN',
          notes: values.notes || undefined,
        });
      }
      return patientApi.addLabResult(patientId, {
        code: values.code,
        name: values.name,
        value: Number(values.value),
        unit: values.unit || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Saved', 'Run a new safety check to screen against it.');
      queryClient.invalidateQueries({ queryKey: [kind === 'lab' ? 'labs' : `${kind}s`, patientId] });
      setValues({});
      onClose();
    },
    onError: (error) => toast.error('Could not save', errorMessage(error)),
  });

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  const titles = { condition: 'Add condition', allergy: 'Add allergy', lab: 'Add lab result' };

  return (
    <Modal open={Boolean(kind)} onClose={onClose} title={titles[kind] || ''}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        {kind === 'condition' && (
          <>
            <Input label="Condition" required value={values.name || ''} onChange={set('name')} />
            <Select
              label="Status"
              value={values.status || 'ACTIVE'}
              onChange={set('status')}
              options={CONDITION_STATUSES.map((value) => ({ value, label: titleCase(value) }))}
            />
            <Textarea label="Notes" rows={2} value={values.notes || ''} onChange={set('notes')} />
          </>
        )}

        {kind === 'allergy' && (
          <>
            <Input label="Allergen" required value={values.allergen || ''} onChange={set('allergen')} />
            <Input label="Reaction" value={values.reaction || ''} onChange={set('reaction')} />
            <Select
              label="Severity"
              value={values.severity || 'UNKNOWN'}
              onChange={set('severity')}
              options={ALLERGY_SEVERITIES.map((value) => ({ value, label: titleCase(value) }))}
            />
          </>
        )}

        {kind === 'lab' && (
          <>
            <Input label="Code" required placeholder="EGFR" value={values.code || ''} onChange={set('code')} />
            <Input label="Name" required placeholder="Estimated GFR" value={values.name || ''} onChange={set('name')} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Value" required type="number" step="any" value={values.value || ''} onChange={set('value')} />
              <Input label="Unit" value={values.unit || ''} onChange={set('unit')} />
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
