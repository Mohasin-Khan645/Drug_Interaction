import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Activity, Bell, ClipboardCheck, Pill, ShieldCheck, Upload } from 'lucide-react';
import { alertApi } from '../../api/alertApi';
import { medicationApi } from '../../api/medicationApi';
import { patientApi } from '../../api/patientApi';
import { safetyApi } from '../../api/safetyApi';
import { useAuth } from '../../context/AuthContext';
import { greeting } from '../../lib/format';
import { overallStatus, sortBySeverity } from '../../lib/severity';
import { Card, CardBody, CardHeader, PageHeader, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SeverityBadge } from '../../components/ui/Badge';
import { Alert, EmptyState, LoadingSkeleton } from '../../components/ui/Feedback';
import { MedicationCard } from '../../components/medications/MedicationCard';

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  const patientId = currentUser && currentUser.patientId;

  const medications = useQuery({
    queryKey: ['medications', patientId, { status: 'ACTIVE' }],
    queryFn: () => medicationApi.list(patientId, { status: 'ACTIVE', limit: 5 }),
    enabled: Boolean(patientId),
  });

  const checks = useQuery({
    queryKey: ['safety-checks', patientId, { limit: 1 }],
    queryFn: () => patientApi.listSafetyChecks(patientId, { limit: 1 }),
    enabled: Boolean(patientId),
  });

  const findingsQuery = useQuery({
    queryKey: ['findings', { patientId, limit: 5 }],
    queryFn: () => safetyApi.listFindings({ patientId, limit: 5 }),
    enabled: Boolean(patientId),
  });

  const alerts = useQuery({
    queryKey: ['notifications', { unreadOnly: true, limit: 5 }],
    queryFn: () => alertApi.list({ unreadOnly: true, limit: 5 }),
  });

  if (!patientId) {
    return (
      <Alert tone="warning" title="No patient record linked">
        Your account is not linked to a patient record yet. Contact your care team to have one created.
      </Alert>
    );
  }

  const latestCheck = checks.data && checks.data.items && checks.data.items[0];
  const findings = (findingsQuery.data && findingsQuery.data.items) || [];
  const status = overallStatus(findings);
  const unread = (alerts.data && alerts.data.pagination && alerts.data.pagination.total) || 0;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${currentUser.name.split(' ')[0]}`}
        description="Your current medications, safety status and alerts."
        actions={
          <>
            <Button as={Link} to="/prescriptions" variant="secondary" icon={Upload}>
              Upload prescription
            </Button>
            <Button as={Link} to="/safety" icon={ShieldCheck}>
              Run safety check
            </Button>
          </>
        }
      />

      <div className={`mb-6 rounded-xl border px-5 py-4 ${status.className}`} role="status">
        <p className="text-sm font-semibold">{status.label}</p>
        <p className="text-sm opacity-90">{status.detail}</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active medications" value={(medications.data && medications.data.pagination.total) ?? '—'} icon={Pill} />
        <StatCard label="Open findings" value={findings.length} icon={Activity} tone={findings.length ? 'warning' : 'success'} />
        <StatCard label="Unread alerts" value={unread} icon={Bell} tone={unread ? 'danger' : 'neutral'} />
        <StatCard
          label="Last safety check"
          value={latestCheck ? new Date(latestCheck.createdAt).toLocaleDateString() : 'Never'}
          icon={ClipboardCheck}
          tone="neutral"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Current medications"
            action={
              <Button as={Link} to="/medications" variant="ghost" size="sm">
                View all
              </Button>
            }
          />
          <CardBody className="space-y-3">
            {medications.isLoading && <LoadingSkeleton rows={3} />}
            {medications.isSuccess && medications.data.items.length === 0 && (
              <EmptyState
                icon={Pill}
                title="No active medications"
                description="Add your medications so DrugSafe can screen them."
                action={
                  <Button as={Link} to="/medications" size="sm">
                    Add medication
                  </Button>
                }
              />
            )}
            {medications.data &&
              medications.data.items.map((medication) => <MedicationCard key={medication.id} medication={medication} />)}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Latest safety findings"
            action={
              latestCheck && (
                <Button as={Link} to={`/safety/${latestCheck.id}`} variant="ghost" size="sm">
                  Open report
                </Button>
              )
            }
          />
          <CardBody className="space-y-3">
            {(checks.isLoading || findingsQuery.isLoading) && <LoadingSkeleton rows={3} />}
            {checks.isSuccess && !latestCheck && (
              <EmptyState
                title="No safety check yet"
                description="Run a check to screen your medication list against curated clinical rules."
                action={
                  <Button as={Link} to="/safety" size="sm">
                    Run safety check
                  </Button>
                }
              />
            )}
            {sortBySeverity(findings)
              .slice(0, 5)
              .map((finding) => (
                <div key={finding.id} className="rounded-lg border border-line px-3 py-2">
                  <SeverityBadge severity={finding.severity} />
                  <p className="mt-1 text-sm font-medium text-ink">{finding.title}</p>
                  <p className="text-sm text-ink-muted">{finding.description}</p>
                </div>
              ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
