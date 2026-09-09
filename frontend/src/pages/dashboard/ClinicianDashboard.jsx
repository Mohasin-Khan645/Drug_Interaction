import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ShieldCheck, Stethoscope, Users } from 'lucide-react';
import { patientApi } from '../../api/patientApi';
import { safetyApi } from '../../api/safetyApi';
import { useAuth } from '../../context/AuthContext';
import { usePatientScope } from '../../context/PatientScopeContext';
import { greeting, formatDateTime } from '../../lib/format';
import { Card, CardBody, CardHeader, PageHeader, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SeverityBadge } from '../../components/ui/Badge';
import { EmptyState, LoadingSkeleton } from '../../components/ui/Feedback';
import { ROLES } from '../../lib/constants';

export default function ClinicianDashboard() {
  const { currentUser } = useAuth();
  const { selectPatient } = usePatientScope();
  const isPharmacist = currentUser.role === ROLES.PHARMACIST;

  const patients = useQuery({ queryKey: ['patients', { limit: 5 }], queryFn: () => patientApi.list({ limit: 5 }) });
  const reviewQueue = useQuery({
    queryKey: ['findings', { status: 'REVIEW_REQUIRED', limit: 8 }],
    queryFn: () => safetyApi.listFindings({ status: 'REVIEW_REQUIRED', limit: 8 }),
  });
  const criticalQueue = useQuery({
    queryKey: ['findings', { severity: 'CRITICAL', limit: 1 }],
    queryFn: () => safetyApi.listFindings({ severity: 'CRITICAL', limit: 1 }),
  });

  const queue = (reviewQueue.data && reviewQueue.data.items) || [];

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${currentUser.name.split(' ')[0]}`}
        description={
          isPharmacist
            ? 'Medication review queue and patients assigned to you.'
            : 'Your patients and the findings waiting on clinical review.'
        }
        actions={
          <Button as={Link} to="/patients" variant="secondary" icon={Users}>
            All patients
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned patients" value={(patients.data && patients.data.pagination.total) ?? '—'} icon={Users} />
        <StatCard
          label="Awaiting review"
          value={(reviewQueue.data && reviewQueue.data.pagination.total) ?? '—'}
          icon={Stethoscope}
          tone="warning"
        />
        <StatCard
          label="Critical findings"
          value={(criticalQueue.data && criticalQueue.data.pagination.total) ?? '—'}
          icon={AlertTriangle}
          tone="danger"
        />
        <StatCard label="Screening rules" value="Curated" hint="Deterministic, versioned" icon={ShieldCheck} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Review queue"
            description="Findings the safety engine flagged for a clinician decision."
            action={
              <Button as={Link} to="/reviews" variant="ghost" size="sm">
                Open queue
              </Button>
            }
          />
          <CardBody className="space-y-3">
            {reviewQueue.isLoading && <LoadingSkeleton rows={3} />}
            {reviewQueue.isSuccess && queue.length === 0 && (
              <EmptyState title="Nothing awaiting review" description="New findings requiring review will appear here." />
            )}
            {queue.map((finding) => (
              <Link
                key={finding.id}
                to={`/reviews/${finding.id}`}
                className="block rounded-lg border border-line px-3 py-2 hover:border-brand-400"
              >
                <SeverityBadge severity={finding.severity} />
                <p className="mt-1 text-sm font-medium text-ink">{finding.title}</p>
                <p className="text-xs text-ink-muted">{formatDateTime(finding.createdAt)}</p>
              </Link>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Recent patients"
            action={
              <Button as={Link} to="/patients" variant="ghost" size="sm">
                View all
              </Button>
            }
          />
          <CardBody className="space-y-2">
            {patients.isLoading && <LoadingSkeleton rows={3} />}
            {patients.isSuccess && patients.data.items.length === 0 && (
              <EmptyState
                icon={Users}
                title="No patients assigned"
                description="Ask an administrator to add you to a patient's care team."
              />
            )}
            {patients.data &&
              patients.data.items.map((patient) => (
                <Link
                  key={patient.id}
                  to={`/patients/${patient.id}`}
                  onClick={() => selectPatient(patient)}
                  className="flex items-center justify-between rounded-lg border border-line px-3 py-2 hover:border-brand-400"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink">{patient.user.name}</span>
                    <span className="block text-xs text-ink-muted">{patient.user.email}</span>
                  </span>
                  <span className="text-xs text-ink-muted">Added {new Date(patient.createdAt).toLocaleDateString()}</span>
                </Link>
              ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
