import { cx } from '../../lib/format';

/**
 * Renders a semantic table on wide screens and a stacked card list on small
 * screens so clinical data stays readable on mobile.
 */
export function Table({ columns, rows, getRowKey, empty, onRowClick, caption }) {
  if (!rows || rows.length === 0) return empty || null;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
              {columns.map((column) => (
                <th key={column.key} scope="col" className={cx('px-4 py-3 font-medium', column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className={cx('align-middle', onRowClick && 'cursor-pointer hover:bg-slate-50')}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cx('px-4 py-3 text-ink', column.cellClassName)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {rows.map((row) => (
          <li key={getRowKey(row)} className="px-4 py-3">
            <dl className="space-y-1.5">
              {columns.map((column) => (
                <div key={column.key} className="flex items-start justify-between gap-3 text-sm">
                  <dt className="shrink-0 text-xs uppercase tracking-wide text-ink-muted">{column.header}</dt>
                  <dd className="text-right text-ink">{column.render(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
