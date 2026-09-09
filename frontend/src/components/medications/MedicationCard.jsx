import { Badge } from '../ui/Badge';
import { MEDICATION_SOURCES, MEDICATION_STATUSES } from '../../lib/constants';
import { formatDate } from '../../lib/format';

export const statusTone = (status) => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'PENDING_REVIEW') return 'warning';
  if (status === 'STOPPED') return 'neutral';
  return 'info';
};

export const medicationName = (medication) =>
  (medication.drug && medication.drug.genericName) || medication.rawName || 'Unidentified medication';

export function MedicationCard({ medication, actions }) {
  return (
    <article className="card px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">{medicationName(medication)}</h3>
          <p className="mt-0.5 text-sm text-ink-muted">
            {[medication.strength, medication.doseForm, medication.frequency].filter(Boolean).join(' · ') ||
              'No dose recorded'}
          </p>
        </div>
        <Badge tone={statusTone(medication.status)}>
          {MEDICATION_STATUSES[medication.status] || medication.status}
        </Badge>
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-muted">
        <div>
          <dt className="inline font-medium text-ink">Source: </dt>
          <dd className="inline">{MEDICATION_SOURCES[medication.source] || medication.source}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-ink">Added: </dt>
          <dd className="inline">{formatDate(medication.createdAt)}</dd>
        </div>
      </dl>
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </article>
  );
}
