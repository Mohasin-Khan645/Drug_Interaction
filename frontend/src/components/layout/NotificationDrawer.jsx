import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellOff, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { alertApi } from '../../api/alertApi';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { SeverityBadge } from '../ui/Badge';
import { EmptyState, ErrorState, LoadingSkeleton } from '../ui/Feedback';
import { cx, errorMessage, formatDateTime } from '../../lib/format';

export function NotificationDrawer({ open, onClose }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['notifications', { limit: 20 }],
    queryFn: () => alertApi.list({ limit: 20 }),
    enabled: open,
  });

  const markRead = useMutation({
    mutationFn: (id) => alertApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const markAll = useMutation({
    mutationFn: () => alertApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const items = (query.data && query.data.items) || [];

  return (
    <Drawer open={open} onClose={onClose} title="Notifications" width="w-full sm:w-[26rem]">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <p className="text-xs text-ink-muted">{items.length} recent</p>
        <Button variant="ghost" size="sm" icon={CheckCheck} onClick={() => markAll.mutate()} loading={markAll.isPending}>
          Mark all read
        </Button>
      </div>

      <div className="p-4">
        {query.isLoading && <LoadingSkeleton rows={4} />}
        {query.isError && <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />}
        {query.isSuccess && items.length === 0 && (
          <EmptyState icon={BellOff} title="No notifications" description="Safety alerts and review requests appear here." />
        )}
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={cx('rounded-lg border px-3 py-2', item.readAt ? 'border-line bg-white' : 'border-brand-200 bg-brand-50')}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {item.severity && <SeverityBadge severity={item.severity} className="mb-1" />}
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-sm text-ink-muted">{item.message}</p>
                  <p className="mt-0.5 text-xs text-ink-subtle">{formatDateTime(item.createdAt)}</p>
                </div>
                {!item.readAt && (
                  <Button variant="ghost" size="sm" onClick={() => markRead.mutate(item.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>

        <Link to="/alerts" onClick={onClose} className="mt-4 inline-block text-sm font-medium text-brand-700 underline">
          Open notification centre
        </Link>
      </div>
    </Drawer>
  );
}
