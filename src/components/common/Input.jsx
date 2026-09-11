import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(function Input(
  {
    label,
    name,
    type = 'text',
    error,
    helperText,
    prefixIcon: PrefixIcon,
    suffixIcon: SuffixIcon,
    onSuffixClick,
    className = '',
    required = false,
    disabled = false,
    ...props
  },
  ref
) {
  const id = props.id || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {PrefixIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <PrefixIcon className="h-4 w-4" />
          </div>
        )}

        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={`block w-full rounded-lg border text-sm transition-colors
            ${PrefixIcon ? 'pl-9' : 'pl-3.5'}
            ${SuffixIcon ? 'pr-9' : 'pr-3.5'}
            py-2.5 bg-white text-slate-900 placeholder-slate-400
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-900'
                : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600 hover:border-slate-400'
            }
            ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}
            ${className}`}
          {...props}
        />

        {SuffixIcon && (
          <button
            type="button"
            onClick={onSuffixClick}
            tabIndex={onSuffixClick ? 0 : -1}
            disabled={disabled}
            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
              onSuffixClick
                ? 'text-slate-500 hover:text-slate-700 focus:outline-none cursor-pointer'
                : 'pointer-events-none text-slate-400'
            }`}
          >
            <SuffixIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-center text-xs text-red-600 font-medium"
        >
          <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="mt-1 text-xs text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
