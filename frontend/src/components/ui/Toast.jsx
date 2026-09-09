import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cx } from '../../lib/format';

const VARIANTS = {
  success: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
  error: { icon: AlertTriangle, className: 'border-red-200 bg-red-50 text-red-900' },
  info: { icon: Info, className: 'border-slate-200 bg-white text-ink' },
};

export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
    >
      {toasts.map((toast) => {
        const variant = VARIANTS[toast.variant] || VARIANTS.info;
        const Icon = variant.icon;
        return (
          <div
            key={toast.id}
            role={toast.variant === 'error' ? 'alert' : 'status'}
            className={cx('pointer-events-auto flex gap-3 rounded-lg border px-4 py-3 shadow-panel animate-slide-up', variant.className)}
          >
            <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-sm opacity-90">{toast.description}</p>}
            </div>
            <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification" className="shrink-0 opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
