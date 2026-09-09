import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { alertApi } from '../../api/alertApi';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDateTime } from '../../lib/format';
import { Card, CardBody, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { SeverityBadge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';

export default function AlertsPage() {
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const toast = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', { tab, page }],
    queryFn: () => alertApi.list({ unreadOnly: tab === 'unread' || undefined, page, limit: 15 }),
    placeholderData: keepPreviousData,
  });

  const markRead = useMutation({
    mutationFn: (notificationId) => alertApi.markRead(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (error) => toast.error('Could not update alert', errorMessage(error)),
  });

  const markAll = useMutation({
    mutationFn: () => alertApi.markAllRead(),
    onSuccess: () => {
      toast.success('All alerts marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => toast.error('Could not update alerts', errorMessage(error)),
  });

  const items = (query.data && query.data.items) || [];

  return (
    <>
      <PageHeader
        title="Alerts"
        description="Safety notifications raised for you. Lower-severity alerts are kept too."
        actions={
          <Button variant="secondary" icon={CheckCheck} loading={markAll.isPending} onClick={() => markAll.mutate()}>
            Mark all read
          </Button>
        }
      />

      <Tabs
        className="mb-5"
        value={tab}
        onChange={(value) => {
          setTab(value);
          setPage(1);
        }}
        tabs={[
          { value: 'all', label: 'All' },
          { value: 'unread', label: 'Unread' },
        ]}
      />

      <Card>
        <CardBody className="space-y-3">
          {query.isLoading && <LoadingSkeleton rows={5} />}
          {query.isError && <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />}
          {query.isSuccess && items.length === 0 && (
            <EmptyState icon={Bell} title="No alerts" description="You are all caught up." />
          )}

          {items.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-lg border px-4 py-3 ${notification.readAt ? 'border-line' : 'border-brand-200 bg-brand-50/40'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {notification.severity && <SeverityBadge severity={notification.severity} />}
                    <span className="text-xs text-ink-muted">{formatDateTime(notification.createdAt)}</span>
                  </div>
                  <h2 className="text-sm font-semibold text-ink">{notification.title}</h2>
                  <p className="text-sm text-ink-muted">{notification.message}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {notification.resourceType === 'SafetyCheck' && notification.resourceId && (
                    <Button as={Link} to={`/safety/${notification.resourceId}`} variant="secondary" size="sm">
                      Open check
                    </Button>
                  )}
                  {!notification.readAt && (
                    <Button variant="ghost" size="sm" onClick={() => markRead.mutate(notification.id)}>
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}

          {query.data && <Pagination pagination={query.data.pagination} onPageChange={setPage} />}
        </CardBody>
      </Card>
    </>
  );
}
