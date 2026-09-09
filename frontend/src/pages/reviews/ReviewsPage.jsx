import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Stethoscope } from 'lucide-react';
import { safetyApi } from '../../api/safetyApi';
import { errorMessage } from '../../lib/format';
import { FINDING_CATEGORIES, FINDING_STATUSES, SEVERITIES } from '../../lib/constants';
import { severityMeta } from '../../lib/severity';
import { Card, CardBody, PageHeader } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import { Badge, SeverityBadge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';

export default function ReviewsPage() {
  const [status, setStatus] = useState('REVIEW_REQUIRED');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['findings', { status, severity, page, queue: true }],
    queryFn: () =>
      safetyApi.listFindings({
        status: status || undefined,
        severity: severity || undefined,
        page,
        limit: 10,
      }),
    placeholderData: keepPreviousData,
  });

  const rows = (query.data && query.data.items) || [];

  return (
    <>
      <PageHeader
        title="Clinician review queue"
        description="Findings awaiting a clinical decision. Decisions are recorded against the finding, never applied automatically."
      />

      <Card>
        <CardBody className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Status"
              value={status}
              placeholder="All statuses"
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              options={Object.entries(FINDING_STATUSES).map(([value, label]) => ({ value, label }))}
            />
            <Select
              label="Severity"
              value={severity}
              placeholder="All severities"
              onChange={(event) => {
                setSeverity(event.target.value);
                setPage(1);
              }}
              options={SEVERITIES.map((value) => ({ value, label: severityMeta(value).label }))}
            />
          </div>

          {query.isLoading && <LoadingSkeleton rows={4} />}
          {query.isError && <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />}

          <Table
            caption="Findings awaiting review"
            columns={[
              { key: 'severity', header: 'Severity', render: (row) => <SeverityBadge severity={row.severity} /> },
              { key: 'title', header: 'Finding', render: (row) => row.title },
              {
                key: 'category',
                header: 'Category',
                render: (row) => <Badge>{FINDING_CATEGORIES[row.category] || row.category}</Badge>,
              },
              { key: 'status', header: 'Status', render: (row) => <Badge>{FINDING_STATUSES[row.status] || row.status}</Badge> },
              {
                key: 'open',
                header: '',
                render: (row) => (
                  <Link to={`/reviews/${row.id}`} className="text-sm font-medium text-brand-700 hover:underline">
                    Review
                  </Link>
                ),
              },
            ]}
            rows={rows}
            getRowKey={(row) => row.id}
            empty={
              query.isSuccess ? (
                <EmptyState icon={Stethoscope} title="Queue is clear" description="No findings match these filters." />
              ) : null
            }
          />

          {query.data && <Pagination pagination={query.data.pagination} onPageChange={setPage} />}
        </CardBody>
      </Card>
    </>
  );
}
