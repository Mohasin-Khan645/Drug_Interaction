import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { errorMessage } from '../../lib/format';
import { REVIEW_DECISIONS } from '../../lib/constants';
import { Card, CardBody, CardHeader, PageHeader, StatCard } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import { ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { SeverityChart } from '../../components/charts/SeverityChart';
import { CategoryChart } from '../../components/charts/CategoryChart';

const WINDOWS = [7, 30, 90, 365];

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);

  const analytics = useQuery({ queryKey: ['analytics', days], queryFn: () => adminApi.analytics(days) });

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Aggregate counts only — no patient-identifying data is included."
        actions={
          <Select
            aria-label="Time window"
            value={String(days)}
            onChange={(event) => setDays(Number(event.target.value))}
            options={WINDOWS.map((value) => ({ value: String(value), label: `Last ${value} days` }))}
          />
        }
      />

      {analytics.isLoading && <LoadingSkeleton rows={5} />}
      {analytics.isError && <ErrorState description={errorMessage(analytics.error)} onRetry={analytics.refetch} />}

      {analytics.isSuccess && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Safety checks" value={analytics.data.safety.checks} />
            <StatCard label="Notifications" value={analytics.data.notifications} tone="neutral" />
            <StatCard label="Patients" value={analytics.data.patients} tone="success" />
            <StatCard label="Active drugs" value={analytics.data.catalog.drugs} tone="warning" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Findings by severity" />
              <CardBody>
                <SeverityChart data={analytics.data.safety.findingsBySeverity} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Findings by category" />
              <CardBody>
                <CategoryChart data={analytics.data.safety.findingsByCategory} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Clinician decisions" />
              <CardBody>
                <dl className="grid gap-3 sm:grid-cols-3">
                  {Object.keys(REVIEW_DECISIONS).map((decision) => (
                    <div key={decision} className="rounded-lg border border-line px-3 py-2">
                      <dt className="text-xs uppercase tracking-wide text-ink-muted">
                        {REVIEW_DECISIONS[decision]}
                      </dt>
                      <dd className="text-lg font-semibold text-ink">{analytics.data.reviews[decision] || 0}</dd>
                    </div>
                  ))}
                </dl>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="AI explanation outcomes" description="Grounded explanations of existing findings only." />
              <CardBody>
                <dl className="grid gap-3 sm:grid-cols-3">
                  {Object.entries(analytics.data.ai || {}).map(([outcome, count]) => (
                    <div key={outcome} className="rounded-lg border border-line px-3 py-2">
                      <dt className="text-xs uppercase tracking-wide text-ink-muted">{outcome.toLowerCase()}</dt>
                      <dd className="text-lg font-semibold text-ink">{count}</dd>
                    </div>
                  ))}
                </dl>
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
