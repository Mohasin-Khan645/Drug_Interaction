import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GitCompareArrows } from 'lucide-react';
import { reconciliationApi } from '../../api/prescriptionApi';
import { useToast } from '../../context/ToastContext';
import { errorMessage } from '../../lib/format';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert, EmptyState, LoadingSkeleton } from '../../components/ui/Feedback';

/**
 * Reconciliation is a proposal until a person selects what to apply. Duplicates
 * and unmatched lines are never applied automatically.
 */
export function ReconciliationPanel({ prescriptionId, patientId, items }) {
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState({});
  const toast = useToast();
  const queryClient = useQueryClient();

  const run = useMutation({
    mutationFn: () =>
      prescriptionId
        ? reconciliationApi.previewFromPrescription(prescriptionId)
        : reconciliationApi.preview(patientId, items),
    onSuccess: (data) => {
      setPreview(data);
      const next = {};
      (data.confirmedCandidates || []).forEach((candidate) => {
        next[candidate.drugId] = true;
      });
      setSelected(next);
    },
    onError: (error) => toast.error('Preview failed', errorMessage(error)),
  });

  const apply = useMutation({
    mutationFn: () =>
      reconciliationApi.apply(patientId, {
        additions: (preview.confirmedCandidates || [])
          .filter((candidate) => selected[candidate.drugId])
          .map((candidate) => ({
            drugId: candidate.drugId,
            prescriptionItemId: candidate.input && candidate.input.prescriptionItemId,
            strength: candidate.strength || undefined,
            doseForm: candidate.doseForm || undefined,
            route: candidate.route || undefined,
            frequency: candidate.frequency || undefined,
            source: 'RECONCILIATION',
          })),
      }),
    onSuccess: (result) => {
      toast.success('Reconciliation applied', `${result.created.length} medication(s) added.`);
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setPreview(null);
      setSelected({});
    },
    onError: (error) => toast.error('Could not apply', errorMessage(error)),
  });

  const chosen = Object.values(selected).filter(Boolean).length;

  return (
    <Card>
      <CardHeader
        title="Medication reconciliation"
        description="Compares this prescription against the patient's active medications."
        action={
          <Button variant="secondary" size="sm" icon={GitCompareArrows} loading={run.isPending} onClick={() => run.mutate()}>
            {preview ? 'Refresh preview' : 'Preview changes'}
          </Button>
        }
      />
      <CardBody className="space-y-5">
        {run.isPending && <LoadingSkeleton rows={3} />}

        {!preview && !run.isPending && (
          <EmptyState
            icon={GitCompareArrows}
            title="No preview yet"
            description="Generate a preview to see what would be added, what already exists, and what needs review."
          />
        )}

        {preview && (
          <>
            <section>
              <h3 className="section-title mb-2">Ready to add ({(preview.confirmedCandidates || []).length})</h3>
              {(preview.confirmedCandidates || []).length === 0 ? (
                <p className="text-sm text-ink-muted">Nothing new to add from this prescription.</p>
              ) : (
                <ul className="space-y-2">
                  {preview.confirmedCandidates.map((candidate) => (
                    <li key={candidate.drugId} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2">
                      <input
                        type="checkbox"
                        id={`add-${candidate.drugId}`}
                        checked={Boolean(selected[candidate.drugId])}
                        onChange={(event) =>
                          setSelected((current) => ({ ...current, [candidate.drugId]: event.target.checked }))
                        }
                        className="h-4 w-4 rounded border-line text-brand-600"
                      />
                      <label htmlFor={`add-${candidate.drugId}`} className="text-sm text-ink">
                        {candidate.displayName}
                        {candidate.strength ? ` · ${candidate.strength}` : ''}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="section-title mb-2">Already recorded ({(preview.duplicateCandidates || []).length})</h3>
              {(preview.duplicateCandidates || []).length === 0 ? (
                <p className="text-sm text-ink-muted">No duplicates detected.</p>
              ) : (
                <ul className="space-y-2">
                  {preview.duplicateCandidates.map((candidate, index) => (
                    <li key={`${candidate.drugId}-${index}`} className="rounded-lg border border-line px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-ink">{candidate.displayName}</span>
                        <Badge tone="warning">Duplicate</Badge>
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">{candidate.reason}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="section-title mb-2">Needs review ({(preview.reviewRequired || []).length})</h3>
              {(preview.reviewRequired || []).length === 0 ? (
                <p className="text-sm text-ink-muted">Every line was matched.</p>
              ) : (
                <ul className="space-y-2">
                  {preview.reviewRequired.map((entry, index) => (
                    <li key={index} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <p className="text-sm font-medium text-amber-900">
                        {(entry.input && (entry.input.rawText || entry.input.drugId)) || 'Unmatched line'}
                      </p>
                      <p className="text-sm text-amber-900/80">{entry.reason}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <Alert tone="info" title="Only the ticked additions are applied.">
              Existing medications are never removed here. Stop a medication from the medications page if it should end.
            </Alert>

            <Button loading={apply.isPending} disabled={chosen === 0} onClick={() => apply.mutate()}>
              Apply {chosen} addition{chosen === 1 ? '' : 's'}
            </Button>
          </>
        )}
      </CardBody>
    </Card>
  );
}
