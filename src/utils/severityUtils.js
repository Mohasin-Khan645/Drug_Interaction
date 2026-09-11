/**
 * Severity configuration for DrugSafe Clinical Decision Support Engine.
 * Never relies solely on color: includes human-readable badges, labels, and icons.
 */
export const SEVERITY_LEVELS = {
  CRITICAL: 'CRITICAL',
  MAJOR: 'MAJOR',
  MODERATE: 'MODERATE',
  MINOR: 'MINOR',
  INFORMATIONAL: 'INFORMATIONAL',
};

export const SEVERITY_CONFIG = {
  [SEVERITY_LEVELS.CRITICAL]: {
    label: 'Critical Concern',
    badgeText: 'Critical',
    rank: 5,
    bgClass: 'bg-red-50',
    borderClass: 'border-red-300',
    textClass: 'text-red-800',
    iconClass: 'text-red-600',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    solidBg: 'bg-red-600',
    accentColor: '#dc2626',
    description: 'High risk of severe adverse reaction or life-threatening outcome. Action required.',
  },
  [SEVERITY_LEVELS.MAJOR]: {
    label: 'Major Concern',
    badgeText: 'Major',
    rank: 4,
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-300',
    textClass: 'text-orange-900',
    iconClass: 'text-orange-600',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    solidBg: 'bg-orange-600',
    accentColor: '#ea580c',
    description: 'Significant clinical interaction or contraindication. Close monitoring or dosage adjustment advised.',
  },
  [SEVERITY_LEVELS.MODERATE]: {
    label: 'Moderate Precaution',
    badgeText: 'Moderate',
    rank: 3,
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-300',
    textClass: 'text-amber-900',
    iconClass: 'text-amber-600',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    solidBg: 'bg-amber-600',
    accentColor: '#d97706',
    description: 'Potential interaction with modest clinical impact. May require observation or timing adjustments.',
  },
  [SEVERITY_LEVELS.MINOR]: {
    label: 'Minor Precaution',
    badgeText: 'Minor',
    rank: 2,
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-300',
    textClass: 'text-blue-900',
    iconClass: 'text-blue-600',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    solidBg: 'bg-blue-600',
    accentColor: '#2563eb',
    description: 'Low likelihood of clinically significant interaction. Routine monitoring sufficient.',
  },
  [SEVERITY_LEVELS.INFORMATIONAL]: {
    label: 'Informational Notice',
    badgeText: 'Informational',
    rank: 1,
    bgClass: 'bg-slate-50',
    borderClass: 'border-slate-200',
    textClass: 'text-slate-800',
    iconClass: 'text-slate-500',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    solidBg: 'bg-slate-600',
    accentColor: '#64748b',
    description: 'General pharmacologic observation or administrative record with no immediate safety hazard.',
  },
};

/**
 * Normalizes input severity strings to canonical uppercase format
 */
export function normalizeSeverity(severity) {
  if (!severity) return SEVERITY_LEVELS.INFORMATIONAL;
  const upper = String(severity).trim().toUpperCase();
  if (SEVERITY_CONFIG[upper]) return upper;
  if (upper.includes('CRIT')) return SEVERITY_LEVELS.CRITICAL;
  if (upper.includes('MAJ')) return SEVERITY_LEVELS.MAJOR;
  if (upper.includes('MOD')) return SEVERITY_LEVELS.MODERATE;
  if (upper.includes('MIN')) return SEVERITY_LEVELS.MINOR;
  return SEVERITY_LEVELS.INFORMATIONAL;
}

/**
 * Returns severity configuration object
 */
export function getSeverityConfig(severity) {
  const norm = normalizeSeverity(severity);
  return SEVERITY_CONFIG[norm] || SEVERITY_CONFIG[SEVERITY_LEVELS.INFORMATIONAL];
}

/**
 * Sorts findings or alerts by severity rank descending (Critical first)
 */
export function sortBySeverityDescending(items = []) {
  return [...items].sort((a, b) => {
    const rankA = getSeverityConfig(a.severity).rank;
    const rankB = getSeverityConfig(b.severity).rank;
    return rankB - rankA;
  });
}
