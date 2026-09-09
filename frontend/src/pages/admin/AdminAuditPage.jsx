import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { auditApi } from '../../api/adminApi';
import { errorMessage, formatDateTime } from '../../lib/format';
import { Card, CardBody, PageHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';

export default function AdminAuditPage() {
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['audit', { action, from, to, page }],
    queryFn: () =>
      auditApi.list({
        action: action || undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
        page,
        limit: 20,
      }),
    placeholderData: keepPreviousData,
  });

  const rows = (query.data && query.data.items) || [];

  return (
    <>
      <PageHeader title="Audit log" description="Append-only record of privileged and patient-data access." />

      <Card>
        <CardBody className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              label="Action"
              placeholder="e.g. PATIENT_READ"
              value={action}
              onChange={(event) => {
                setAction(event.target.value);
                setPage(1);
              }}
            />
            <Input
              label="From"
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
            />
            <Input
              label="To"
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
            />
          </div>

          {query.isLoading && <LoadingSkeleton rows={5} />}
          {query.isError && <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />}

          <Table
            caption="Audit entries"
            columns={[
              { key: 'time', header: 'When', render: (row) => formatDateTime(row.createdAt) },
              { key: 'action', header: 'Action', render: (row) => <Badge>{row.action}</Badge> },
              {
                key: 'resource',
                header: 'Resource',
                render: (row) => (row.resourceType ? `${row.resourceType} ${row.resourceId || ''}`.trim() : '—'),
              },
              { key: 'user', header: 'User', render: (row) => row.userId || 'system' },
              { key: 'ip', header: 'IP', render: (row) => row.ipAddress || '—' },
            ]}
            rows={rows}
            getRowKey={(row) => row.id}
            empty={query.isSuccess ? <EmptyState title="No entries" description="No audit entry matched." /> : null}
          />

          {query.data && <Pagination pagination={query.data.pagination} onPageChange={setPage} />}
        </CardBody>
      </Card>
    </>
  );
}
