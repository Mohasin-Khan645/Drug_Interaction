import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ClipboardList, ShieldCheck } from 'lucide-react';
import { medicationApi } from '../../api/medicationApi';
import { patientApi } from '../../api/patientApi';
import { safetyApi } from '../../api/safetyApi';
import { usePatientScope } from '../../context/PatientScopeContext';
import { errorMessage, formatDate, formatDateTime } from '../../lib/format';
import { MEDICATION_STATUSES } from '../../lib/constants';
import { Card, CardBody, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, SeverityBadge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { SafetyFactorsPanel } from '../../components/patients/SafetyFactorsPanel';

export default function PatientDetailPage() {
  const { id } = useParams();
  const [tab, setTab] = useState('overview');
  const { selectPatient } = usePatientScope();

  const patient = useQuery({ queryKey: ['patient', id], queryFn: () => patientApi.get(id) });

  const medications = useQuery({
    queryKey: ['medications', id, { status: 'ACTIVE' }],
    queryFn: () => medicationApi.list(id, { status: 'ACTIVE', limit: 50 }),
  });

  const findings = useQuery({
    queryKey: ['findings', { patientId: id, limit: 10 }],
    queryFn: () => safetyApi.listFindings({ patientId: id, limit: 10 }),
  });

  const checks = useQuery({
    queryKey: ['safety-checks', id, { limit: 5 }],
    queryFn: () => patientApi.listSafetyChecks(id, { limit: 5 }),
  });

  useEffect(() => {
    if (patient.data) selectPatient({ id: patient.data.id, user: patient.data.user });
  }, [patient.data, selectPatient]);

  if (patient.isLoading) return <LoadingSkeleton rows={4} />;
  if (patient.isError) return <ErrorState description={errorMessage(patient.error)} onRetry={patient.refetch} />;

  const record = patient.data;

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link to="/patients" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Patients
          </Link>
        }
        title={record.user ? record.user.name : 'Patient'}
        description={`Born ${formatDate(record.dateOfBirth)}${record.sex ? ` · ${record.sex.toLowerCase()}` : ''}`}
        actions={
          <>
            <Button as={Link} to="/medication-review" variant="secondary" icon={ClipboardList}>
              Medication review
            </Button>
            <Button as={Link} to="/safety" icon={ShieldCheck}>
              Safety checks
            </Button>
          </>
        }
      />

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'overview', label: 'Overview' },
          { value: 'factors', label: 'Safety factors' },
        ]}
      />

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Active medications" />
            <CardBody className="space-y-2">
              {medications.isLoading && <LoadingSkeleton rows={3} />}
              {medications.isSuccess && medications.data.items.length === 0 && (
                <EmptyState title="No active medications" description="Nothing is currently recorded as active." />
              )}
              {((medications.data && medications.data.items) || []).map((medication) => (
                <div key={medication.id} className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {medication.drug ? medication.drug.genericName : medication.rawName}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {[medication.strength, medication.frequency].filter(Boolean).join(' · ') || 'No dose recorded'}
                    </p>
                  </div>
                  <Badge>{MEDICATION_STATUSES[medication.status] || medication.status}</Badge>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent findings" />
            <CardBody className="space-y-2">
              {findings.isLoading && <LoadingSkeleton rows={3} />}
              {findings.isSuccess && findings.data.items.length === 0 && (
                <EmptyState title="No findings" description="No curated rule matched this patient." />
              )}
              {((findings.data && findings.data.items) || []).map((finding) => (
                <Link
                  key={finding.id}
                  to={`/safety/${finding.safetyCheckId}`}
                  className="block rounded-lg border border-line px-3 py-2 hover:border-brand-400"
                >
                  <SeverityBadge severity={finding.severity} className="mb-1" />
                  <p className="text-sm font-medium text-ink">{finding.title}</p>
                </Link>
              ))}
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="Safety check history" />
            <CardBody className="space-y-2">
              {checks.isLoading && <LoadingSkeleton rows={2} />}
              {checks.isSuccess && checks.data.items.length === 0 && (
                <EmptyState title="No checks yet" description="Run a safety check from the safety page." />
              )}
              {((checks.data && checks.data.items) || []).map((check) => (
                <Link
                  key={check.id}
                  to={`/safety/${check.id}`}
                  className="flex items-center justify-between rounded-lg border border-line px-3 py-2 hover:border-brand-400"
                >
                  <span className="text-sm text-ink">{formatDateTime(check.createdAt)}</span>
                  <span className="text-xs text-ink-muted">
                    {check.summary && check.summary.totalFindings != null
                      ? `${check.summary.totalFindings} finding(s)`
                      : check.status}
                  </span>
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'factors' && <SafetyFactorsPanel patientId={id} />}
    </>
  );
}
