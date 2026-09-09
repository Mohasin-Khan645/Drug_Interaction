import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../../api/safetyApi';
import { REVIEW_DECISIONS } from '../../lib/constants';
import { errorMessage } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select, Textarea } from '../ui/Input';
import { Alert } from '../ui/Feedback';
import { SeverityBadge } from '../ui/Badge';

export function ReviewDialog({ open, onClose, finding }) {
  const [decision, setDecision] = useState('ACKNOWLEDGED');
  const [clinicalNote, setClinicalNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => reviewApi.create(finding.id, { decision, clinicalNote: clinicalNote || undefined }),
    onSuccess: () => {
      toast.success('Review recorded', 'The finding status has been updated.');
      queryClient.invalidateQueries({ queryKey: ['safety'] });
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      setConfirming(false);
      setClinicalNote('');
      onClose();
    },
    onError: (error) => toast.error('Review failed', errorMessage(error)),
  });

  if (!finding) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Clinical review"
      description="Recorded against the finding with your name and a timestamp."
      footer={
        confirming ? (
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)} disabled={mutation.isPending}>
              Back
            </Button>
            <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
              Confirm decision
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => setConfirming(true)}>Continue</Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-line bg-slate-50 px-3 py-2">
          <SeverityBadge severity={finding.severity} />
          <p className="mt-1.5 text-sm font-medium text-ink">{finding.title}</p>
          <p className="text-sm text-ink-muted">{finding.description}</p>
        </div>

        {confirming ? (
          <Alert tone="warning" title="Confirm this review">
            Decision: <strong>{REVIEW_DECISIONS[decision]}</strong>
            {clinicalNote ? ` · Note: ${clinicalNote}` : ''}
          </Alert>
        ) : (
          <>
            <Select
              label="Decision"
              required
              value={decision}
              onChange={(event) => setDecision(event.target.value)}
              options={Object.entries(REVIEW_DECISIONS).map(([value, label]) => ({ value, label }))}
            />
            <Textarea
              label="Clinical note"
              rows={4}
              value={clinicalNote}
              onChange={(event) => setClinicalNote(event.target.value)}
              hint="Optional. Visible to the care team and included in reports."
            />
          </>
        )}
      </div>
    </Modal>
  );
}
