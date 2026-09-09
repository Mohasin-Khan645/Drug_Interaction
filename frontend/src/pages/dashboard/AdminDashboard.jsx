import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Activity, BookOpen, Pill, ShieldCheck, Users } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { Card, CardBody, CardHeader, PageHeader, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { SeverityChart } from '../../components/charts/SeverityChart';
import { CategoryChart } from '../../components/charts/CategoryChart';
import { errorMessage } from '../../lib/format';
import { ROLE_LABELS } from '../../lib/constants';

export default function AdminDashboard() {
  const analytics = useQuery({ queryKey: ['analytics', 30], queryFn: () => adminApi.analytics(30) });

  if (analytics.isLoading) return <LoadingSkeleton rows={5} />;
  if (analytics.isError) {
    return <ErrorState description={errorMessage(analytics.error)} onRetry={analytics.refetch} />;
  }

  const data = analytics.data;

  return (
    <>
      <PageHeader
        title="Platform overview"
        description={`Aggregate activity over the last ${data.windowDays} days. No patient-identifying data is shown.`}
        actions={
          <Button as={Link} to="/admin/analytics" variant="secondary">
            Full analytics
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={data.users.total} icon={Users} />
        <StatCard label="Patients" value={data.patients} icon={Users} tone="neutral" />
        <StatCard label="Active drugs" value={data.catalog.drugs} icon={Pill} tone="success" />
        <StatCard label="Safety checks" value={data.safety.checks} icon={ShieldCheck} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Findings by severity" />
          <CardBody>
            <SeverityChart data={data.safety.findingsBySeverity} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Findings by category" />
          <CardBody>
            <CategoryChart data={data.safety.findingsByCategory} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Users by role" />
          <CardBody>
            <dl className="grid grid-cols-2 gap-3">
              {Object.entries(data.users.byRole).map(([role, count]) => (
                <div key={role} className="rounded-lg border border-line px-3 py-2">
                  <dt className="text-xs uppercase tracking-wide text-ink-muted">{ROLE_LABELS[role] || role}</dt>
                  <dd className="text-lg font-semibold text-ink">{count}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Knowledge and assistance" />
          <CardBody>
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-line px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-ink-muted">Interaction rules</dt>
                <dd className="text-lg font-semibold text-ink">{data.catalog.activeInteractionRules}</dd>
              </div>
              <div className="rounded-lg border border-line px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-ink-muted">Notifications sent</dt>
                <dd className="text-lg font-semibold text-ink">{data.notifications}</dd>
              </div>
              {Object.entries(data.ai || {}).map(([outcome, count]) => (
                <div key={outcome} className="rounded-lg border border-line px-3 py-2">
                  <dt className="text-xs uppercase tracking-wide text-ink-muted">AI {outcome.toLowerCase()}</dt>
                  <dd className="text-lg font-semibold text-ink">{count}</dd>
                </div>
              ))}
            </dl>
            <Button as={Link} to="/admin/evidence" variant="ghost" size="sm" icon={BookOpen} className="mt-3">
              Manage evidence sources
            </Button>
            <Button as={Link} to="/admin/audit" variant="ghost" size="sm" icon={Activity} className="mt-3">
              View audit log
            </Button>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
