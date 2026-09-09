import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cx } from '../../lib/format';

const baseField =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-brand-500 disabled:bg-slate-50';

export function Field({ label, hint, error, required, htmlFor, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="hint">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input(
  { label, hint, error, className, required, id, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        className={cx(baseField, error && 'border-red-400', className)}
        {...props}
      />
    </Field>
  );
});

export const PasswordInput = forwardRef(function PasswordInput(
  { label, hint, error, id, required, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? 'true' : undefined}
          className={cx(baseField, 'pr-10', error && 'border-red-400')}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-subtle hover:text-ink"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, hint, error, id, required, rows = 3, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        className={cx(baseField, error && 'border-red-400')}
        {...props}
      />
    </Field>
  );
});

export const Select = forwardRef(function Select(
  { label, hint, error, id, required, options = [], placeholder, children, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
      <select
        id={inputId}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        className={cx(baseField, error && 'border-red-400')}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
    </Field>
  );
});
