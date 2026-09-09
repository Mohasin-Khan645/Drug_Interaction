import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { medicationApi } from '../../api/medicationApi';
import { safetyApi } from '../../api/safetyApi';
import { usePatientScope } from '../../context/PatientScopeContext';
import { errorMessage } from '../../lib/format';
import { MEDICATION_SOURCES, MEDICATION_STATUSES } from '../../lib/constants';
import { Card, CardBody, CardHeader, PageHeader } from '../../components/ui/Card';
import { Badge, SeverityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { NoPatientSelected, PatientScopeBar } from '../../components/patients/PatientScopeBar';

/**
 * Pharmacist-facing view: the full medication list beside open findings.
 */
export default function MedicationReviewPage() {
  const { patientId } = usePatientScope();

  const medications = useQuery({
    queryKey: ['medications', patientId, { review: true }],
    queryFn: () => medicationApi.list(patientId, { limit: 100 }),
    enabled: Boolean(patientId),
  });

  const findings = useQuery({
    queryKey: ['findings', { patientId, review: true }],
    queryFn: () => safetyApi.listFindings({ patientId, limit: 20 }),
    enabled: Boolean(patientId),
  });

  const items = (medications.data && medications.data.items) || [];

  return (
    <>
      <PageHeader
        title="Medication review"
        description="Review the full list against open findings before advising the prescriber."
      />

      <PatientScopeBar />

      {!patientId ? (
        <NoPatientSelected description="Select a patient to start a medication review." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Medication list" description="Stopped records are retained for history." />
              <CardBody className="space-y-2">
                {medications.isLoading && <LoadingSkeleton rows={4} />}
                {medications.isError && (
                  <ErrorState description={errorMessage(medications.error)} onRetry={medications.refetch} />
                )}
                {medications.isSuccess && items.length === 0 && (
                  <EmptyState title="No medications" description="Nothing recorded for this patient yet." />
                )}
                {items.map((medication) => (
                  <div key={medication.id} className="rounded-lg border border-line px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink">
                        {medication.drug ? medication.drug.genericName : medication.rawName}
                      </span>
                      <div className="flex gap-1.5">
                        <Badge>{MEDICATION_STATUSES[medication.status] || medication.status}</Badge>
                        <Badge tone="neutral">{MEDICATION_SOURCES[medication.source] || medication.source}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-ink-muted">
                      {[medication.strength, medication.doseForm, medication.route, medication.frequency]
                        .filter(Boolean)
                        .join(' · ') || 'No dose recorded'}
                    </p>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Open findings"
                action={
                  <Button as={Link} to="/safety" variant="ghost" size="sm">
                    Safety checks
                  </Button>
                }
              />
              <CardBody className="space-y-2">
                {findings.isLoading && <LoadingSkeleton rows={4} />}
                {findings.isSuccess && findings.data.items.length === 0 && (
                  <EmptyState title="No findings" description="Run a safety check to screen the current list." />
                )}
                {((findings.data && findings.data.items) || []).map((finding) => (
                  <Link
                    key={finding.id}
                    to={`/reviews/${finding.id}`}
                    className="block rounded-lg border border-line px-3 py-2 hover:border-brand-400"
                  >
                    <SeverityBadge severity={finding.severity} className="mb-1" />
                    <p className="text-sm font-medium text-ink">{finding.title}</p>
                    <p className="text-sm text-ink-muted">{finding.description}</p>
                  </Link>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
