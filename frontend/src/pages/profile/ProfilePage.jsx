import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { patientApi } from '../../api/patientApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { errorMessage } from '../../lib/format';
import { ROLE_LABELS, ROLES } from '../../lib/constants';
import { Card, CardBody, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { LoadingSkeleton } from '../../components/ui/Feedback';
import { SafetyFactorsPanel } from '../../components/patients/SafetyFactorsPanel';

const SEXES = ['MALE', 'FEMALE', 'OTHER', 'UNKNOWN'];

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const patientId = currentUser.role === ROLES.PATIENT ? currentUser.patientId : null;

  const patient = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientApi.get(patientId),
    enabled: Boolean(patientId),
  });

  const { register, handleSubmit, reset, formState } = useForm();

  useEffect(() => {
    if (!patient.data) return;
    reset({
      dateOfBirth: patient.data.dateOfBirth ? patient.data.dateOfBirth.slice(0, 10) : '',
      sex: patient.data.sex || 'UNKNOWN',
      heightCm: patient.data.heightCm || '',
      weightKg: patient.data.weightKg || '',
      medicalHistory: patient.data.medicalHistory || '',
    });
  }, [patient.data, reset]);

  const save = useMutation({
    mutationFn: (values) =>
      patientApi.update(patientId, {
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : undefined,
        sex: values.sex || undefined,
        heightCm: values.heightCm ? Number(values.heightCm) : undefined,
        weightKg: values.weightKg ? Number(values.weightKg) : undefined,
        medicalHistory: values.medicalHistory || undefined,
      }),
    onSuccess: () => {
      toast.success('Profile updated', 'Age, weight and renal factors affect screening.');
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
    },
    onError: (error) => toast.error('Could not save profile', errorMessage(error)),
  });

  return (
    <>
      <PageHeader title="Profile" description="Account details and the clinical factors used by safety screening." />

      <Card className="mb-6">
        <CardHeader title="Account" />
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="label">Name</dt>
              <dd className="text-sm text-ink">{currentUser.name}</dd>
            </div>
            <div>
              <dt className="label">Email</dt>
              <dd className="text-sm text-ink">{currentUser.email}</dd>
            </div>
            <div>
              <dt className="label">Role</dt>
              <dd className="text-sm text-ink">{ROLE_LABELS[currentUser.role]}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      {patientId && (
        <>
          <Card className="mb-6">
            <CardHeader title="Clinical profile" description="These values feed patient-factor and dosing rules." />
            <CardBody>
              {patient.isLoading ? (
                <LoadingSkeleton rows={2} />
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit((values) => save.mutate(values))}>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Input label="Date of birth" type="date" {...register('dateOfBirth')} />
                    <Select
                      label="Sex"
                      options={SEXES.map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }))}
                      {...register('sex')}
                    />
                    <Input label="Height (cm)" type="number" step="any" {...register('heightCm')} />
                    <Input label="Weight (kg)" type="number" step="any" {...register('weightKg')} />
                  </div>
                  <Textarea label="Medical history" rows={3} {...register('medicalHistory')} />
                  <Button type="submit" loading={save.isPending} disabled={!formState.isDirty}>
                    Save profile
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>

          <h2 className="section-title mb-3">Safety factors</h2>
          <SafetyFactorsPanel patientId={patientId} />
        </>
      )}
    </>
  );
}
