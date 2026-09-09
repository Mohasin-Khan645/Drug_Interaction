import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pill, Plus, ShieldCheck } from 'lucide-react';
import { medicationApi } from '../../api/medicationApi';
import { usePatientScope } from '../../context/PatientScopeContext';
import { useToast } from '../../context/ToastContext';
import { errorMessage } from '../../lib/format';
import { MEDICATION_STATUSES } from '../../lib/constants';
import { PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MedicationCard, medicationName } from '../../components/medications/MedicationCard';
import { NoPatientSelected, PatientScopeBar } from '../../components/patients/PatientScopeBar';
import { AddMedicationDialog } from './AddMedicationDialog';

export default function MedicationsPage() {
  const { patientId } = usePatientScope();
  const [status, setStatus] = useState('ACTIVE');
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [stopping, setStopping] = useState(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['medications', patientId, { status, page }],
    queryFn: () => medicationApi.list(patientId, { status: status || undefined, page, limit: 10 }),
    enabled: Boolean(patientId),
    placeholderData: keepPreviousData,
  });

  const stop = useMutation({
    mutationFn: (medication) => medicationApi.stop(medication.id),
    onSuccess: () => {
      toast.success('Medication stopped', 'The record is kept with a stopped status.');
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setStopping(null);
    },
    onError: (error) => toast.error('Could not stop medication', errorMessage(error)),
  });

  const items = (query.data && query.data.items) || [];

  return (
    <>
      <PageHeader
        title="Medications"
        description="The active medication list used by every safety check."
        actions={
          <>
            <Button as={Link} to="/safety" variant="secondary" icon={ShieldCheck}>
              Run safety check
            </Button>
            <Button icon={Plus} onClick={() => setAdding(true)} disabled={!patientId}>
              Add medication
            </Button>
          </>
        }
      />

      <PatientScopeBar />

      {!patientId ? (
        <NoPatientSelected description="Select a patient to view and manage their medication list." />
      ) : (
        <>
          <div className="mb-4 max-w-xs">
            <Select
              label="Status"
              value={status}
              placeholder="All statuses"
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              options={Object.entries(MEDICATION_STATUSES).map(([value, label]) => ({ value, label }))}
            />
          </div>

          {query.isLoading && <LoadingSkeleton rows={4} />}
          {query.isError && <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />}

          {query.isSuccess && items.length === 0 && (
            <div className="card">
              <EmptyState
                icon={Pill}
                title="No medications recorded"
                description="Add a medication or upload a prescription to build the list."
                action={
                  <Button icon={Plus} onClick={() => setAdding(true)}>
                    Add medication
                  </Button>
                }
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {items.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                actions={
                  medication.status === 'ACTIVE' ? (
                    <Button variant="secondary" size="sm" onClick={() => setStopping(medication)}>
                      Stop medication
                    </Button>
                  ) : null
                }
              />
            ))}
          </div>

          {query.data && (
            <div className="card mt-5">
              <Pagination pagination={query.data.pagination} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <AddMedicationDialog open={adding} onClose={() => setAdding(false)} patientId={patientId} />

      <ConfirmDialog
        open={Boolean(stopping)}
        onClose={() => setStopping(null)}
        onConfirm={() => stop.mutate(stopping)}
        loading={stop.isPending}
        title="Stop this medication?"
        confirmLabel="Stop medication"
        variant="danger"
        description={stopping ? medicationName(stopping) : ''}
      >
        <p className="text-sm text-ink-muted">
          The record is retained for history and audit — it is marked stopped, never deleted. Re-run a safety check
          afterwards so the findings reflect the change.
        </p>
      </ConfirmDialog>
    </>
  );
}
