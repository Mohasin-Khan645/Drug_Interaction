import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { ocrApi } from '../../api/prescriptionApi';
import { useToast } from '../../context/ToastContext';
import { confidenceLabel, drugDisplayName, errorMessage } from '../../lib/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DrugSearchSelect } from '../../components/drugs/DrugSearchSelect';

const STATUS_TONE = { CONFIRMED: 'success', REJECTED: 'neutral', PENDING_REVIEW: 'warning' };

/**
 * One OCR line. A low-confidence match can only be confirmed after a drug is
 * chosen explicitly — the backend enforces the same rule.
 */
export function OcrItemRow({ item, prescriptionId }) {
  const [drug, setDrug] = useState(null);
  const [strength, setStrength] = useState(item.strength || '');
  const [frequency, setFrequency] = useState(item.frequency || '');
  const [picking, setPicking] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const confidence = confidenceLabel(item.confidence);
  const lowConfidence = (item.confidence || 0) < 0.9;

  const mutation = useMutation({
    mutationFn: (status) =>
      ocrApi.confirmItem(item.id, {
        status,
        drugId: drug ? drug.id : undefined,
        strength: strength || undefined,
        frequency: frequency || undefined,
      }),
    onSuccess: (_data, status) => {
      toast.success(status === 'CONFIRMED' ? 'Line confirmed' : 'Line rejected');
      queryClient.invalidateQueries({ queryKey: ['prescription-items', prescriptionId] });
    },
    onError: (error) => toast.error('Update failed', errorMessage(error)),
  });

  const proposed = drug ? drugDisplayName(drug) : item.displayName;
  const canConfirm = Boolean(drug) || (item.candidateDrugId && !lowConfidence);

  return (
    <article className="rounded-lg border border-line px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-ink-muted">Read from image</p>
          <p className="text-sm font-medium text-ink">{item.rawText}</p>
          <p className="mt-1 text-sm text-ink-muted">
            Proposed match: <span className="text-ink">{proposed || 'None'}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={confidence.tone}>{confidence.label} confidence</Badge>
          <Badge tone={STATUS_TONE[item.status] || 'neutral'}>{item.status.replace(/_/g, ' ').toLowerCase()}</Badge>
        </div>
      </div>

      {item.status === 'PENDING_REVIEW' && (
        <div className="mt-3 space-y-3">
          {lowConfidence && !drug && (
            <p className="text-xs font-medium text-amber-800">
              Confidence is too low to confirm the proposed match. Choose the correct drug from the catalog.
            </p>
          )}

          {picking || (lowConfidence && !drug) ? (
            <DrugSearchSelect
              label="Correct drug"
              onSelect={(selected) => {
                setDrug(selected);
                setPicking(false);
              }}
            />
          ) : (
            <Button variant="ghost" size="sm" type="button" onClick={() => setPicking(true)}>
              {drug ? 'Change drug' : 'Pick a different drug'}
            </Button>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Strength" value={strength} onChange={(event) => setStrength(event.target.value)} />
            <Input label="Frequency" value={frequency} onChange={(event) => setFrequency(event.target.value)} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              icon={Check}
              disabled={!canConfirm}
              loading={mutation.isPending && mutation.variables === 'CONFIRMED'}
              onClick={() => mutation.mutate('CONFIRMED')}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={X}
              loading={mutation.isPending && mutation.variables === 'REJECTED'}
              onClick={() => mutation.mutate('REJECTED')}
            >
              Reject
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
