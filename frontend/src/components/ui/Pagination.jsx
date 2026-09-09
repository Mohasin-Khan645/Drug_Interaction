import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({ pagination, onPageChange }) {
  if (!pagination) return null;
  const { page = 1, totalPages = 0, total = 0, limit = 20 } = pagination;
  if (totalPages <= 1) {
    return (
      <p className="px-4 py-3 text-xs text-ink-muted">
        {total} {total === 1 ? 'result' : 'results'}
      </p>
    );
  }

  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 px-4 py-3">
      <p className="text-xs text-ink-muted">
        Showing {first}–{last} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Button>
        <span className="text-xs text-ink-muted">
          Page {page} of {totalPages}
        </span>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
