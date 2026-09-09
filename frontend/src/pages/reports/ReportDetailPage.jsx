import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download } from 'lucide-react';
import { reportApi } from '../../api/reportApi';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDate, formatDateTime } from '../../lib/format';
import { Card, CardBody, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, SeverityBadge } from '../../components/ui/Badge';
import { ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { DISCLAIMER } from '../../lib/constants';

export default function ReportDetailPage() {
  const { id } = useParams();
  const [downloading, setDownloading] = useState(false);
  const toast = useToast();

  const query = useQuery({ queryKey: ['report', id], queryFn: () => reportApi.get(id) });

  const download = async () => {
    setDownloading(true);
    try {
      const blob = await reportApi.downloadPdf(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${query.data.reportNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Download failed', errorMessage(error));
    } finally {
      setDownloading(false);
    }
  };

  if (query.isLoading) return <LoadingSkeleton rows={4} />;
  if (query.isError) return <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />;

  const report = query.data;
  const snapshot = report.snapshot || {};

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link to="/reports" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Reports
          </Link>
        }
        title={report.reportNumber}
        description={`Generated ${formatDateTime(report.createdAt)} · status ${report.status}`}
        actions={
          <Button icon={Download} loading={downloading} onClick={download}>
            Download PDF
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Patient" />
          <CardBody>
            <dl className="space-y-2 text-sm">
              <Row label="Name" value={snapshot.patient && snapshot.patient.name} />
              <Row label="Date of birth" value={snapshot.patient && formatDate(snapshot.patient.dateOfBirth)} />
              <Row label="Sex" value={snapshot.patient && snapshot.patient.sex} />
            </dl>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Medications at time of report" />
          <CardBody>
            <ul className="space-y-2 text-sm">
              {(snapshot.medications || []).length === 0 && <li className="text-ink-muted">No active medications recorded.</li>}
              {(snapshot.medications || []).map((medication, index) => (
                <li key={index} className="rounded-lg border border-line px-3 py-2">
                  <span className="font-medium text-ink">{medication.name}</span>
                  <span className="text-ink-muted">
                    {[medication.strength, medication.doseForm, medication.frequency].filter(Boolean).length
                      ? ` · ${[medication.strength, medication.doseForm, medication.frequency].filter(Boolean).join(' · ')}`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Findings" description="Exactly as recorded when the report was generated." />
          <CardBody className="space-y-3">
            {(snapshot.findings || []).length === 0 && <p className="text-sm text-ink-muted">No findings in this report.</p>}
            {(snapshot.findings || []).map((finding) => (
              <article key={finding.id} className="rounded-lg border border-line px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={finding.severity} />
                  <Badge>{finding.status}</Badge>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold text-ink">{finding.title}</h3>
                <p className="text-sm text-ink-muted">{finding.description}</p>
                {finding.management && (
                  <p className="mt-1 text-sm text-ink">
                    <span className="font-medium">Management: </span>
                    {finding.management}
                  </p>
                )}
                {(finding.evidence || []).length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-ink-muted">
                    {finding.evidence.map((item, index) => (
                      <li key={index}>
                        {item.sourceName}
                        {item.version ? ` v${item.version}` : ''}
                        {item.evidenceLevel ? ` · evidence ${item.evidenceLevel}` : ''}
                        {item.reference ? ` · ${item.reference}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
                {(finding.reviews || []).length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-ink">
                    {finding.reviews.map((review, index) => (
                      <li key={index}>
                        <span className="font-medium">{review.decision.replace(/_/g, ' ').toLowerCase()}</span> ·{' '}
                        {review.reviewer} ({review.reviewerRole}) · {formatDateTime(review.createdAt)}
                        {review.clinicalNote ? ` — ${review.clinicalNote}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </CardBody>
        </Card>
      </div>

      <p className="mt-6 text-xs text-ink-muted">{DISCLAIMER}</p>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="text-ink">{value || 'Not recorded'}</dd>
    </div>
  );
}
