import { SEVERITIES } from './constants';

/**
 * Severity presentation is defined once. Every badge carries a text label so
 * meaning never depends on colour alone.
 */
export const SEVERITY_META = {
  CONTRAINDICATED: {
    label: 'Contraindicated',
    tone: 'critical',
    className: 'bg-rose-50 text-rose-900 border-rose-300',
    dot: 'bg-rose-800',
    description: 'Do not combine without specialist direction.',
  },
  CRITICAL: {
    label: 'Critical',
    tone: 'critical',
    className: 'bg-red-50 text-red-800 border-red-300',
    dot: 'bg-red-600',
    description: 'Immediate clinical attention required.',
  },
  MAJOR: {
    label: 'Major',
    tone: 'danger',
    className: 'bg-orange-50 text-orange-900 border-orange-300',
    dot: 'bg-orange-600',
    description: 'High priority — clinician review recommended.',
  },
  MODERATE: {
    label: 'Moderate',
    tone: 'warning',
    className: 'bg-amber-50 text-amber-900 border-amber-300',
    dot: 'bg-amber-500',
    description: 'Monitor and consider adjustment.',
  },
  MINOR: {
    label: 'Minor',
    tone: 'info',
    className: 'bg-sky-50 text-sky-900 border-sky-200',
    dot: 'bg-sky-500',
    description: 'Low priority.',
  },
  INFORMATIONAL: {
    label: 'Informational',
    tone: 'neutral',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-400',
    description: 'Context only.',
  },
};

export const severityMeta = (severity) =>
  SEVERITY_META[severity] || SEVERITY_META.INFORMATIONAL;

export const severityRank = (severity) => {
  const index = SEVERITIES.indexOf(severity);
  return index === -1 ? SEVERITIES.length : index;
};

export const sortBySeverity = (findings = []) =>
  [...findings].sort((a, b) => {
    const bySeverity = severityRank(a.severity) - severityRank(b.severity);
    if (bySeverity !== 0) return bySeverity;
    const aReview = a.status === 'REVIEW_REQUIRED' ? 0 : 1;
    const bReview = b.status === 'REVIEW_REQUIRED' ? 0 : 1;
    return aReview - bReview;
  });

export const groupBySeverity = (findings = []) => {
  const groups = new Map();
  SEVERITIES.forEach((severity) => groups.set(severity, []));
  findings.forEach((finding) => {
    const bucket = groups.get(finding.severity) || [];
    bucket.push(finding);
    groups.set(finding.severity, bucket);
  });
  return [...groups.entries()]
    .filter(([, items]) => items.length > 0)
    .map(([severity, items]) => ({ severity, items }));
};

export const overallStatus = (findings = []) => {
  if (findings.length === 0) {
    return {
      label: 'No safety findings',
      detail: 'No curated rule matched this medication list.',
      className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    };
  }
  const highest = sortBySeverity(findings)[0].severity;
  const meta = severityMeta(highest);
  return {
    label: `Highest severity: ${meta.label}`,
    detail: meta.description,
    className: meta.className,
  };
};
