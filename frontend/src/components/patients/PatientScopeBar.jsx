import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserRound, Users } from 'lucide-react';
import { patientApi } from '../../api/patientApi';
import { usePatientScope } from '../../context/PatientScopeContext';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SearchInput } from '../ui/SearchInput';
import { EmptyState, LoadingSkeleton } from '../ui/Feedback';

/**
 * Clinicians and admins must pick whose record they are working on before any
 * patient-scoped page loads data.
 */
export function PatientScopeBar() {
  const { patientId, patientName, isOwnRecord, selectPatient } = usePatientScope();
  const [open, setOpen] = useState(false);

  if (isOwnRecord) return null;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3">
        <p className="flex items-center gap-2 text-sm text-ink">
          <UserRound aria-hidden="true" className="h-4 w-4 text-brand-600" />
          {patientId ? (
            <>
              Working on <strong className="font-semibold">{patientName || 'selected patient'}</strong>
            </>
          ) : (
            'No patient selected.'
          )}
        </p>
        <Button variant="secondary" size="sm" icon={Users} onClick={() => setOpen(true)}>
          {patientId ? 'Change patient' : 'Select patient'}
        </Button>
      </div>

      <PatientPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(patient) => {
          selectPatient(patient);
          setOpen(false);
        }}
      />
    </>
  );
}

export function PatientPickerModal({ open, onClose, onSelect }) {
  const [term, setTerm] = useState('');
  const debounced = useDebouncedValue(term, 300);

  const query = useQuery({
    queryKey: ['patients', { search: debounced, limit: 10 }],
    queryFn: () => patientApi.list({ search: debounced || undefined, limit: 10 }),
    enabled: open,
  });

  const items = (query.data && query.data.items) || [];

  return (
    <Modal open={open} onClose={onClose} title="Select a patient" description="Only patients you are authorised to view are listed.">
      <div className="space-y-3">
        <SearchInput value={term} onChange={setTerm} label="Search patients" placeholder="Search by name or email…" />
        {query.isLoading && <LoadingSkeleton rows={3} />}
        {query.isSuccess && items.length === 0 && (
          <EmptyState icon={Users} title="No patients found" description="Try a different search term." />
        )}
        <ul className="divide-y divide-line">
          {items.map((patient) => (
            <li key={patient.id}>
              <button
                type="button"
                onClick={() => onSelect(patient)}
                className="w-full px-1 py-2 text-left hover:bg-slate-50"
              >
                <span className="block text-sm font-medium text-ink">{patient.user.name}</span>
                <span className="block text-xs text-ink-muted">{patient.user.email}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export function NoPatientSelected({ description = 'Select a patient to continue.' }) {
  return (
    <div className="card">
      <EmptyState icon={Users} title="No patient selected" description={description} />
    </div>
  );
}
