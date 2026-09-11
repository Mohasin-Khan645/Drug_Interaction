import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search by medication name, generic, brand, or RxNorm...',
  isLoading = false,
  className = '',
  autoFocus = false,
  onClear,
  ...props
}) {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
        <Search className="h-4 w-4" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-colors focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 hover:border-slate-400"
        {...props}
      />

      <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1.5">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
        {value && !isLoading && (
          <button
            type="button"
            onClick={onClear || (() => onChange(''))}
            aria-label="Clear search"
            className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
