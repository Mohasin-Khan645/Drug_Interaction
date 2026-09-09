import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, FilePlus2, Sparkles, Stethoscope } from 'lucide-react';
import { Badge, SeverityBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EvidenceList } from './EvidenceCard';
import { FINDING_CATEGORIES, FINDING_STATUSES } from '../../lib/constants';
import { cx, formatDateTime } from '../../lib/format';

const statusTone = (status) => {
  if (status === 'REVIEW_REQUIRED') return 'warning';
  if (status === 'ACCEPTED') return 'success';
  if (status === 'ACKNOWLEDGED') return 'brand';
  return 'neutral';
};

export function FindingCard({
  finding,
  drugNames = {},
  onExplain,
  onReview,
  onAddToReport,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const subjects = (finding.subjectDrugIds || []).map((id) => drugNames[id] || null).filter(Boolean);
  const reviews = finding.reviews || [];

  return (
    <article className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <Badge tone="neutral">{FINDING_CATEGORIES[finding.category] || finding.category}</Badge>
            <Badge tone={statusTone(finding.status)}>{FINDING_STATUSES[finding.status] || finding.status}</Badge>
          </div>
          <h3 className="text-sm font-semibold text-ink">{finding.title}</h3>
          <p className="mt-1 text-sm text-ink-muted">{finding.description}</p>
          {subjects.length > 0 && (
            <p className="mt-2 text-xs text-ink-muted">
              <span className="font-medium text-ink">Affected medications: </span>
              {subjects.join(', ')}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          icon={open ? ChevronUp : ChevronDown}
        >
          {open ? 'Hide details' : 'View details'}
        </Button>
      </div>

      <div className={cx('border-t border-line bg-slate-50/60 px-5 py-4', !open && 'hidden')}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Detail label="Clinical effect" value={finding.clinicalEffect} />
          <Detail label="Mechanism" value={finding.mechanism} />
          <Detail label="Management" value={finding.management} />
          <Detail
            label="Rule"
            value={finding.ruleId ? `${finding.ruleId.slice(0, 8)} · v${finding.ruleVersion ?? 1}` : 'Not rule-derived'}
          />
        </dl>

        <div className="mt-4">
          <p className="section-title mb-2 flex items-center gap-1.5">
            <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
            Evidence
          </p>
          <EvidenceList evidence={finding.evidence} />
        </div>

        {reviews.length > 0 && (
          <div className="mt-4">
            <p className="section-title mb-2">Clinician review</p>
            <ul className="space-y-2">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
                  <p className="font-medium text-ink">
                    {review.decision.replace(/_/g, ' ').toLowerCase()} ·{' '}
                    <span className="font-normal text-ink-muted">
                      {review.reviewer ? `${review.reviewer.name} (${review.reviewer.role})` : 'Clinician'}
                    </span>
                  </p>
                  <p className="text-xs text-ink-muted">{formatDateTime(review.createdAt)}</p>
                  {review.clinicalNote && <p className="mt-1 text-sm text-ink">{review.clinicalNote}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {onExplain && (
            <Button variant="secondary" size="sm" icon={Sparkles} onClick={() => onExplain(finding)}>
              Explain with AI
            </Button>
          )}
          {onReview && (
            <Button variant="secondary" size="sm" icon={Stethoscope} onClick={() => onReview(finding)}>
              Review
            </Button>
          )}
          {onAddToReport && (
            <Button variant="secondary" size="sm" icon={FilePlus2} onClick={() => onAddToReport(finding)}>
              Add to report
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value || 'Not recorded'}</dd>
    </div>
  );
}
