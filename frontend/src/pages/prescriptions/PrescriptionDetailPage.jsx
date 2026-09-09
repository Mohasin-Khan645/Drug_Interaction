import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ScanLine } from 'lucide-react';
import { ocrApi, prescriptionApi } from '../../api/prescriptionApi';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDateTime } from '../../lib/format';
import { Card, CardBody, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Alert, EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { OcrItemRow } from './OcrItemRow';
import { ReconciliationPanel } from './ReconciliationPanel';

export default function PrescriptionDetailPage() {
  const { id } = useParams();
  const [tab, setTab] = useState('items');
  const toast = useToast();
  const queryClient = useQueryClient();

  const prescription = useQuery({ queryKey: ['prescription', id], queryFn: () => prescriptionApi.get(id) });
  const items = useQuery({ queryKey: ['prescription-items', id], queryFn: () => prescriptionApi.listItems(id) });

  const process = useMutation({
    mutationFn: () => ocrApi.process(id),
    onSuccess: () => {
      toast.success('Text extracted', 'Review each line before anything is added.');
      queryClient.invalidateQueries({ queryKey: ['prescription', id] });
      queryClient.invalidateQueries({ queryKey: ['prescription-items', id] });
    },
    onError: (error) => toast.error('Extraction failed', errorMessage(error)),
  });

  if (prescription.isLoading) return <LoadingSkeleton rows={4} />;
  if (prescription.isError) {
    return <ErrorState description={errorMessage(prescription.error)} onRetry={prescription.refetch} />;
  }

  const record = prescription.data;
  const rows = items.data || [];
  const pending = rows.filter((item) => item.status === 'PENDING_REVIEW');
  const confirmed = rows.filter((item) => item.status === 'CONFIRMED');

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link to="/prescriptions" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Prescriptions
          </Link>
        }
        title="Prescription review"
        description={`Uploaded ${formatDateTime(record.createdAt)} · status ${record.status}`}
        actions={
          <Button
            icon={ScanLine}
            loading={process.isPending}
            onClick={() => process.mutate()}
            disabled={record.images.length === 0}
          >
            {rows.length > 0 ? 'Re-run extraction' : 'Extract medications'}
          </Button>
        }
      />

      {record.notes && (
        <Alert tone="info" title="Upload notes" className="mb-5">
          {record.notes}
        </Alert>
      )}

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'items', label: 'Extracted medications', count: rows.length },
          { value: 'reconcile', label: 'Reconciliation', count: confirmed.length },
        ]}
      />

      {tab === 'items' && (
        <Card>
          <CardHeader
            title="Extracted lines"
            description="Confidence reflects how well the text matched the drug catalog. Confirm, correct or reject each line."
          />
          <CardBody className="space-y-3">
            {items.isLoading && <LoadingSkeleton rows={3} />}
            {items.isSuccess && rows.length === 0 && (
              <EmptyState
                icon={ScanLine}
                title="Nothing extracted yet"
                description="Run text extraction to read medications from the uploaded image."
              />
            )}
            {rows.map((item) => (
              <OcrItemRow key={item.id} item={item} prescriptionId={id} />
            ))}
            {pending.length > 0 && (
              <Alert tone="warning" title={`${pending.length} line${pending.length === 1 ? '' : 's'} still need review.`}>
                Only confirmed lines are carried into reconciliation.
              </Alert>
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'reconcile' && <ReconciliationPanel prescriptionId={id} patientId={record.patientId} />}

      {record.ocr && record.ocr.length > 0 && tab === 'items' && (
        <Card className="mt-6">
          <CardHeader
            title="Raw OCR text"
            action={<Badge tone="neutral">{record.ocr[0].provider}</Badge>}
            description="Shown so a reviewer can check the extraction against the original image."
          />
          <CardBody>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-ink">
              {record.ocr[0].text}
            </pre>
          </CardBody>
        </Card>
      )}
    </>
  );
}
