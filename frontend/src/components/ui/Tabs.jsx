import { cx } from '../../lib/format';

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div role="tablist" aria-orientation="horizontal" className={cx('flex gap-1 overflow-x-auto border-b border-line', className)}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cx(
              '-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-muted hover:border-line hover:text-ink'
            )}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-ink-muted">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
