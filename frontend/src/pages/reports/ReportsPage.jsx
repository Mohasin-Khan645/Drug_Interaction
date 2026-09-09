import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { patientApi } from '../../api/patientApi';
import { usePatientScope } from '../../context/PatientScopeContext';
import { errorMessage, formatDateTime } from '../../lib/format';
import { Card, CardBody, PageHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { NoPatientSelected, PatientScopeBar } from '../../components/patients/PatientScopeBar';

export default function ReportsPage() {
  const { patientId } = usePatientScope();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['reports', patientId, page],
    queryFn: () => patientApi.listReports(patientId, { page, limit: 10 }),
    enabled: Boolean(patientId),
    placeholderData: keepPreviousData,
  });

  const rows = (query.data && query.data.items) || [];

  return (
    <>
      <PageHeader
        title="Safety reports"
        description="Point-in-time snapshots of a safety check, exportable as PDF."
      />

      <PatientScopeBar />

      {!patientId ? (
        <NoPatientSelected description="Select a patient to view their safety reports." />
      ) : (
        <Card>
          <CardBody>
            {query.isLoading && <LoadingSkeleton rows={4} />}
            {query.isError && <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />}

            <Table
              caption="Safety reports"
              columns={[
                { key: 'number', header: 'Report', render: (row) => row.reportNumber },
                { key: 'created', header: 'Created', render: (row) => formatDateTime(row.createdAt) },
                { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
                {
                  key: 'open',
                  header: '',
                  render: (row) => (
                    <Link to={`/reports/${row.id}`} className="text-sm font-medium text-brand-700 hover:underline">
                      Open
                    </Link>
                  ),
                },
              ]}
              rows={rows}
              getRowKey={(row) => row.id}
              empty={
                query.isSuccess ? (
                  <EmptyState
                    icon={FileText}
                    title="No reports yet"
                    description="Generate a report from a completed safety check."
                  />
                ) : null
              }
            />

            {query.data && <Pagination pagination={query.data.pagination} onPageChange={setPage} />}
          </CardBody>
        </Card>
      )}
    </>
  );
}
