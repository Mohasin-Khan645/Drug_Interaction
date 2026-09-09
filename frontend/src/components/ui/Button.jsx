import { Loader2 } from 'lucide-react';
import { cx } from '../../lib/format';

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50',
  secondary: 'bg-white text-ink border border-line hover:bg-slate-50',
  subtle: 'bg-slate-100 text-ink hover:bg-slate-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-ink-muted hover:bg-slate-100',
};

const SIZES = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
  icon: 'h-9 w-9 justify-center',
};

export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <Component
      className={cx(
        'inline-flex items-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={Component === 'button' ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon aria-hidden="true" className="h-4 w-4" />
      )}
      {children}
    </Component>
  );
}
