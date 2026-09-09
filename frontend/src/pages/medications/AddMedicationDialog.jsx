import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { medicationApi } from '../../api/medicationApi';
import { normalizationApi } from '../../api/drugApi';
import { medicationSchema } from '../../lib/validation';
import { confidenceLabel, drugDisplayName, errorMessage } from '../../lib/format';
import { MEDICATION_SOURCES } from '../../lib/constants';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Feedback';
import { Badge } from '../../components/ui/Badge';
import { DrugSearchSelect } from '../../components/drugs/DrugSearchSelect';

/**
 * A medication is only linked to a catalog drug when the user picks it from
 * the catalog or explicitly confirms a normalization candidate. Uncertain
 * matches are stored as free text instead of being guessed.
 */
export function AddMedicationDialog({ open, onClose, patientId }) {
  const [drug, setDrug] = useState(null);
  const [candidates, setCandidates] = useState(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(medicationSchema),
    defaultValues: { rawName: '', strength: '', doseForm: '', route: '', frequency: '', source: 'SELF_REPORTED', notes: '' },
  });

  const normalize = useMutation({
    mutationFn: (name) => normalizationApi.normalize([name]),
    onSuccess: (data) => setCandidates((data.results && data.results[0]) || null),
    onError: (error) => toast.error('Lookup failed', errorMessage(error)),
  });

  const create = useMutation({
    mutationFn: (values) =>
      medicationApi.create(patientId, {
        ...(drug ? { drugId: drug.id } : { rawName: values.rawName }),
        strength: values.strength || undefined,
        doseForm: values.doseForm || undefined,
        route: values.route || undefined,
        frequency: values.frequency || undefined,
        source: values.source,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      toast.success('Medication added', 'Run a safety check to screen the updated list.');
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      reset();
      onClose();
    },
    onError: (error) => toast.error('Could not add medication', errorMessage(error)),
  });

  const reset = () => {
    form.reset();
    setDrug(null);
    setCandidates(null);
  };

  const rawName = form.watch('rawName');

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add a medication"
      description="Search the catalog, or record it by name if it is not listed."
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit((values) => create.mutate(values))}
            loading={create.isPending}
            disabled={!drug && !(rawName || '').trim()}
          >
            Add medication
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit((values) => create.mutate(values))}>
        {drug ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2">
            <span>
              <span className="block text-sm font-medium text-ink">{drugDisplayName(drug)}</span>
              <span className="block text-xs text-ink-muted">Linked to the drug catalog</span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => setDrug(null)} type="button">
              Change
            </Button>
          </div>
        ) : (
          <DrugSearchSelect
            onSelect={(selected) => {
              setDrug(selected);
              setCandidates(null);
              form.setValue('rawName', selected.genericName);
            }}
          />
        )}

        {!drug && (
          <>
            <Input
              label="Medication name"
              required
              placeholder="e.g. Warfarin 5mg tablet"
              error={form.formState.errors.rawName && form.formState.errors.rawName.message}
              {...form.register('rawName')}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={normalize.isPending}
                disabled={(rawName || '').trim().length < 2}
                onClick={() => normalize.mutate(rawName.trim())}
              >
                Find catalog match
              </Button>
              <p className="text-xs text-ink-muted">Optional — helps safety screening find curated rules.</p>
            </div>

            {candidates && (
              <div className="space-y-2 rounded-lg border border-line bg-slate-50 px-3 py-3">
                {candidates.requiresReview && (
                  <Alert tone="warning" title="No confident match">
                    Pick a candidate only if you are sure it is the same medication. Otherwise it is saved as free text and
                    will not be screened against drug-specific rules.
                  </Alert>
                )}
                {(candidates.candidates || []).length === 0 && (
                  <p className="text-sm text-ink-muted">No catalog candidate was found for this name.</p>
                )}
                {(candidates.candidates || []).map((candidate) => {
                  const confidence = confidenceLabel(candidate.confidence);
                  return (
                    <button
                      key={candidate.candidateDrugId}
                      type="button"
                      onClick={() => setDrug({ id: candidate.candidateDrugId, genericName: candidate.displayName })}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-white px-3 py-2 text-left hover:border-brand-400"
                    >
                      <span className="text-sm text-ink">{candidate.displayName}</span>
                      <Badge tone={confidence.tone}>{confidence.label} confidence</Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Strength" placeholder="e.g. 5 mg" {...form.register('strength')} />
          <Input label="Dose form" placeholder="e.g. Tablet" {...form.register('doseForm')} />
          <Input label="Route" placeholder="e.g. Oral" {...form.register('route')} />
          <Input label="Frequency" placeholder="e.g. Once daily" {...form.register('frequency')} />
        </div>

        <Select
          label="Source"
          options={Object.entries(MEDICATION_SOURCES).map(([value, label]) => ({ value, label }))}
          {...form.register('source')}
        />
        <Textarea label="Notes" rows={3} {...form.register('notes')} />
      </form>
    </Modal>
  );
}
