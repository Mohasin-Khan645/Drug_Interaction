import { Search, X } from 'lucide-react';
import { cx } from '../../lib/format';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  label,
  className,
  autoFocus,
  onKeyDown,
}) {
  return (
    <div className={cx('relative', className)}>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        aria-label={label || placeholder}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-9 text-sm text-ink placeholder:text-ink-subtle focus:border-brand-500"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-subtle hover:bg-slate-100 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
