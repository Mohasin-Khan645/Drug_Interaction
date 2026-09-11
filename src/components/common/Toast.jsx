import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

export default function Toast({
  id,
  type = 'info',
  title,
  message,
  onDismiss,
  duration = 4500,
}) {
  const Icon = icons[type] || Info;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex items-start gap-3 w-full max-w-sm rounded-xl border p-4 shadow-lg backdrop-blur-xs transition-all transform animate-in slide-in-from-top-2 ${
        styles[type] || styles.info
      }`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <h5 className="text-xs font-bold uppercase tracking-wider mb-0.5">{title}</h5>}
        <p className="text-xs leading-relaxed">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="rounded p-1 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
