import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { prescriptionApi } from '../../api/prescriptionApi';
import { usePatientScope } from '../../context/PatientScopeContext';
import { useToast } from '../../context/ToastContext';
import { errorMessage } from '../../lib/format';
import { Card, CardBody, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { FileUploader } from '../../components/ui/FileUploader';
import { Alert, ProgressBar } from '../../components/ui/Feedback';
import { NoPatientSelected, PatientScopeBar } from '../../components/patients/PatientScopeBar';

export default function PrescriptionsPage() {
  const { patientId } = usePatientScope();
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();

  const upload = useMutation({
    mutationFn: () =>
      prescriptionApi.upload({
        patientId,
        file,
        notes: notes || undefined,
        onUploadProgress: (event) => {
          if (event.total) setProgress((event.loaded / event.total) * 100);
        },
      }),
    onSuccess: (prescription) => {
      toast.success('Prescription uploaded', 'Run text extraction to read the medications.');
      navigate(`/prescriptions/${prescription.id}`);
    },
    onError: (error) => {
      setProgress(0);
      toast.error('Upload failed', errorMessage(error));
    },
  });

  return (
    <>
      <PageHeader
        title="Upload a prescription"
        description="Images are read by OCR. Nothing is added to the medication list until a person confirms it."
      />

      <PatientScopeBar />

      {!patientId ? (
        <NoPatientSelected description="Select a patient before uploading a prescription." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card>
            <CardHeader title="Prescription image" />
            <CardBody className="space-y-4">
              <FileUploader file={file} onSelect={setFile} />
              <Textarea
                label="Notes"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                hint="Optional context for the reviewing clinician."
              />
              {upload.isPending && <ProgressBar value={progress} label={`Uploading… ${Math.round(progress)}%`} />}
              <Button icon={Upload} disabled={!file} loading={upload.isPending} onClick={() => upload.mutate()}>
                Upload prescription
              </Button>
            </CardBody>
          </Card>

          <Alert tone="warning" title="OCR output is never auto-applied.">
            Extracted lines are proposals only. Each one must be confirmed, corrected or rejected, and reconciliation
            against the current medication list is a separate, explicit step.
          </Alert>
        </div>
      )}
    </>
  );
}
