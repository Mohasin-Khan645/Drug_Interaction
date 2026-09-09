import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { patientApi } from '../../api/patientApi';
import { safetyApi } from '../../api/safetyApi';
import { usePatientScope } from '../../context/PatientScopeContext';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDateTime } from '../../lib/format';
import { FINDING_CATEGORIES, FINDING_STATUSES, SEVERITIES } from '../../lib/constants';
import { severityMeta } from '../../lib/severity';
import { Card, CardBody, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Badge, SeverityBadge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Alert, EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { NoPatientSelected, PatientScopeBar } from '../../components/patients/PatientScopeBar';

export default function SafetyPage() {
  const { patientId } = usePatientScope();
  const [severity, setSeverity] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const toast = useToast();
  const queryClient = useQueryClient();

  const checks = useQuery({
    queryKey: ['safety-checks', patientId, { limit: 5 }],
    queryFn: () => patientApi.listSafetyChecks(patientId, { limit: 5 }),
    enabled: Boolean(patientId),
  });

  const findings = useQuery({
    queryKey: ['findings', { patientId, severity, category, status, page }],
    queryFn: () =>
      safetyApi.listFindings({
        patientId,
        severity: severity || undefined,
        category: category || undefined,
        status: status || undefined,
        page,
        limit: 10,
      }),
    enabled: Boolean(patientId),
    placeholderData: keepPreviousData,
  });

  const run = useMutation({
    mutationFn: () => safetyApi.runCheck(patientId, true),
    onSuccess: (check) => {
      toast.success('Safety check complete', `${check.findings.length} finding(s) recorded.`);
      queryClient.invalidateQueries({ queryKey: ['safety-checks'] });
      queryClient.invalidateQueries({ queryKey: ['findings'] });
    },
    onError: (error) => toast.error('Safety check failed', errorMessage(error)),
  });

  const rows = (findings.data && findings.data.items) || [];

  return (
    <>
      <PageHeader
        title="Safety checks"
        description="Deterministic screening of the active medication list against curated rules."
        actions={
          <Button icon={ShieldCheck} loading={run.isPending} disabled={!patientId} onClick={() => run.mutate()}>
            Run safety check
          </Button>
        }
      />

      <PatientScopeBar />

      {!patientId ? (
        <NoPatientSelected description="Select a patient to run and review safety checks." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <Card>
              <CardHeader title="Findings" description="Every severity is listed — nothing is hidden." />
              <CardBody className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
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
                  <Select
                    label="Category"
                    value={category}
                    placeholder="All categories"
                    onChange={(event) => {
                      setCategory(event.target.value);
                      setPage(1);
                    }}
                    options={Object.entries(FINDING_CATEGORIES).map(([value, label]) => ({ value, label }))}
                  />
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
                </div>

                {findings.isLoading && <LoadingSkeleton rows={4} />}
                {findings.isError && <ErrorState description={errorMessage(findings.error)} onRetry={findings.refetch} />}

                <Table
                  caption="Safety findings"
                  columns={[
                    { key: 'severity', header: 'Severity', render: (row) => <SeverityBadge severity={row.severity} /> },
                    { key: 'title', header: 'Finding', render: (row) => row.title },
                    {
                      key: 'category',
                      header: 'Category',
                      render: (row) => <Badge>{FINDING_CATEGORIES[row.category] || row.category}</Badge>,
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      render: (row) => <Badge>{FINDING_STATUSES[row.status] || row.status}</Badge>,
                    },
                    {
                      key: 'link',
                      header: '',
                      render: (row) => (
                        <Link to={`/safety/${row.safetyCheckId}`} className="text-sm font-medium text-brand-700 hover:underline">
                          Open check
                        </Link>
                      ),
                    },
                  ]}
                  rows={rows}
                  getRowKey={(row) => row.id}
                  empty={
                    findings.isSuccess ? (
                      <EmptyState
                        title="No findings"
                        description="No curated rule matched the current medication list and patient factors."
                      />
                    ) : null
                  }
                />

                {findings.data && <Pagination pagination={findings.data.pagination} onPageChange={setPage} />}
              </CardBody>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader title="Recent checks" />
              <CardBody className="space-y-2">
                {checks.isLoading && <LoadingSkeleton rows={3} />}
                {checks.isSuccess && checks.data.items.length === 0 && (
                  <EmptyState title="No checks yet" description="Run a safety check to screen the medication list." />
                )}
                {checks.data &&
                  checks.data.items.map((check) => (
                    <Link
                      key={check.id}
                      to={`/safety/${check.id}`}
                      className="block rounded-lg border border-line px-3 py-2 hover:border-brand-400"
                    >
                      <p className="text-sm font-medium text-ink">{formatDateTime(check.createdAt)}</p>
                      <p className="text-xs text-ink-muted">
                        {check.summary && check.summary.totalFindings != null
                          ? `${check.summary.totalFindings} finding(s)`
                          : `Status ${check.status}`}
                      </p>
                    </Link>
                  ))}
              </CardBody>
            </Card>

            <Alert tone="info" title="How screening works">
              Findings come from versioned, curated rules — not from a language model. AI can only explain findings that
              already exist.
            </Alert>
          </div>
        </div>
      )}
    </>
  );
}
