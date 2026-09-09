import { AlertTriangle, Info, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { cx } from '../../lib/format';
import { Button } from './Button';

const ALERT_TONES = {
  info: 'border-slate-200 bg-slate-50 text-ink',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-red-200 bg-red-50 text-red-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  brand: 'border-brand-200 bg-brand-50 text-brand-900',
};

export function Alert({ tone = 'info', title, icon: Icon = Info, children, className }) {
  return (
    <div role="note" className={cx('flex gap-3 rounded-lg border px-4 py-3 text-sm', ALERT_TONES[tone], className)}>
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cx(title && 'mt-0.5', 'opacity-90')}>{children}</div>}
      </div>
    </div>
  );
}

export function LoadingSkeleton({ rows = 3, className }) {
  return (
    <div className={cx('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton h-16 w-full" />
      ))}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-muted" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function EmptyState({ title, description, icon: Icon = ShieldCheck, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-ink-muted">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center" role="alert">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-700">
        <AlertTriangle aria-hidden="true" className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" icon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function ProgressBar({ value = 0, label }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${clamped}%` }} />
      </div>
      {label && <p className="mt-1 text-xs text-ink-muted">{label}</p>}
    </div>
  );
}
