import { cx } from '../../lib/format';
import { severityMeta } from '../../lib/severity';

const TONES = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  critical: 'bg-rose-50 text-rose-900 border-rose-300',
  info: 'bg-sky-50 text-sky-900 border-sky-200',
};

export function Badge({ tone = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Colour is always paired with the severity word for accessibility. */
export function SeverityBadge({ severity, className }) {
  const meta = severityMeta(severity);
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        meta.className,
        className
      )}
    >
      <span aria-hidden="true" className={cx('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}
