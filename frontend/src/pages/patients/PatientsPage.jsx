import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { patientApi } from '../../api/patientApi';
import { usePatientScope } from '../../context/PatientScopeContext';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { errorMessage, formatDate } from '../../lib/format';
import { Card, CardBody, PageHeader } from '../../components/ui/Card';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';

export default function PatientsPage() {
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebouncedValue(term, 300);
  const { selectPatient } = usePatientScope();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ['patients', { search: debounced, page }],
    queryFn: () => patientApi.list({ search: debounced || undefined, page, limit: 10 }),
    placeholderData: keepPreviousData,
  });

  const rows = (query.data && query.data.items) || [];

  const open = (patient) => {
    selectPatient(patient);
    navigate(`/patients/${patient.id}`);
  };

  return (
    <>
      <PageHeader title="Patients" description="Patients you are permitted to see, enforced by the backend." />

      <Card>
        <CardBody className="space-y-4">
          <SearchInput
            label="Search patients"
            placeholder="Name or email"
            value={term}
            onChange={(value) => {
              setTerm(value);
              setPage(1);
            }}
          />

          {query.isLoading && <LoadingSkeleton rows={4} />}
          {query.isError && <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />}

          <Table
            caption="Patients"
            onRowClick={open}
            columns={[
              { key: 'name', header: 'Patient', render: (row) => (row.user ? row.user.name : 'Unknown') },
              { key: 'email', header: 'Email', render: (row) => (row.user ? row.user.email : '—') },
              { key: 'dob', header: 'Date of birth', render: (row) => formatDate(row.dateOfBirth) },
              { key: 'sex', header: 'Sex', render: (row) => (row.sex ? row.sex.toLowerCase() : '—') },
            ]}
            rows={rows}
            getRowKey={(row) => row.id}
            empty={
              query.isSuccess ? (
                <EmptyState icon={Users} title="No patients" description="No patient matched this search." />
              ) : null
            }
          />

          {query.data && <Pagination pagination={query.data.pagination} onPageChange={setPage} />}
        </CardBody>
      </Card>
    </>
  );
}
