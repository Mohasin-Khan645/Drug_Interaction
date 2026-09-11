import React from 'react';

/**
 * StatusBadge - Shared Design System Badge
 * Enforces accessible color coding and clear text for medication & clinical statuses.
 */
export default function StatusBadge({
  variant = 'neutral', // 'critical' | 'major' | 'moderate' | 'safe' | 'info' | 'neutral'
  label,
  dot = true,
  className = '',
}) {
  const styles = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50',
    major: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
    moderate: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900/50',
    safe: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const dotColors = {
    critical: 'bg-rose-500',
    major: 'bg-amber-500',
    moderate: 'bg-yellow-500',
    safe: 'bg-emerald-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-400',
  };

  const selectedVariant = styles[variant?.toLowerCase()] ? variant.toLowerCase() : 'neutral';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[selectedVariant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[selectedVariant]}`} />}
      <span>{label}</span>
    </span>
  );
}

