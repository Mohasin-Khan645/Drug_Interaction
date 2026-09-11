import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Select = forwardRef(function Select(
  {
    label,
    name,
    options = [],
    error,
    helperText,
    placeholder = 'Select an option',
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

      <select
        ref={ref}
        id={id}
        name={name}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={`block w-full rounded-lg border text-sm py-2.5 px-3.5 bg-white text-slate-900 transition-colors
          ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600 hover:border-slate-400'
          }
          ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}
          ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const value = typeof opt === 'object' ? opt.value : opt;
          const labelText = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={value} value={value}>
              {labelText}
            </option>
          );
        })}
      </select>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center text-xs text-red-600 font-medium">
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

export default Select;
