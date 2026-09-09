import { ShieldPlus } from 'lucide-react';
import { cx } from '../../lib/format';

export function Logo({ compact = false, className }) {
  return (
    <span className={cx('flex items-center gap-2.5', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
        <ShieldPlus aria-hidden="true" className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-sm font-semibold text-ink">DrugSafe</span>
          <span className="block text-xs text-ink-muted">Medication Safety Intelligence</span>
        </span>
      )}
    </span>
  );
}
