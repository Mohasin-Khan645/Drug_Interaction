import { BookOpen, ExternalLink } from 'lucide-react';
import { formatDate } from '../../lib/format';

/** Evidence is only rendered when the backend actually supplied a source. */
export function EvidenceCard({ evidence }) {
  if (!evidence) return null;
  return (
    <div className="rounded-lg border border-line bg-slate-50 px-3 py-2 text-sm">
      <p className="flex items-center gap-2 font-medium text-ink">
        <BookOpen aria-hidden="true" className="h-4 w-4 text-brand-600" />
        {evidence.sourceName}
      </p>
      <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-ink-muted sm:grid-cols-4">
        {evidence.version && (
          <div>
            <dt className="inline">Version: </dt>
            <dd className="inline">{evidence.version}</dd>
          </div>
        )}
        {evidence.evidenceLevel && (
          <div>
            <dt className="inline">Evidence level: </dt>
            <dd className="inline">{evidence.evidenceLevel}</dd>
          </div>
        )}
        {evidence.retrievedAt && (
          <div>
            <dt className="inline">Retrieved: </dt>
            <dd className="inline">{formatDate(evidence.retrievedAt)}</dd>
          </div>
        )}
        {evidence.reviewedAt && (
          <div>
            <dt className="inline">Reviewed: </dt>
            <dd className="inline">{formatDate(evidence.reviewedAt)}</dd>
          </div>
        )}
      </dl>
      {evidence.reference && (
        <p className="mt-1 break-all text-xs text-brand-700">
          {/^https?:\/\//.test(evidence.reference) ? (
            <a className="inline-flex items-center gap-1 underline" href={evidence.reference} target="_blank" rel="noreferrer">
              {evidence.reference}
              <ExternalLink aria-hidden="true" className="h-3 w-3" />
            </a>
          ) : (
            evidence.reference
          )}
        </p>
      )}
    </div>
  );
}

export function EvidenceList({ evidence = [] }) {
  if (evidence.length === 0) {
    return <p className="text-sm text-ink-muted">No stored evidence is linked to this finding.</p>;
  }
  return (
    <div className="space-y-2">
      {evidence.map((item) => (
        <EvidenceCard key={item.id || `${item.sourceName}-${item.reference}`} evidence={item} />
      ))}
    </div>
  );
}
