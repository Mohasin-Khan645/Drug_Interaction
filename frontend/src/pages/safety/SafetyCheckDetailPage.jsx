import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText } from 'lucide-react';
import { medicationApi } from '../../api/medicationApi';
import { reportApi } from '../../api/reportApi';
import { safetyApi } from '../../api/safetyApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDateTime } from '../../lib/format';
import { groupBySeverity, overallStatus, severityMeta } from '../../lib/severity';
import { ROLES } from '../../lib/constants';
import { PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { FindingCard } from '../../components/safety/FindingCard';
import { AiExplanationPanel } from '../../components/safety/AiExplanationPanel';
import { ReviewDialog } from '../../components/safety/ReviewDialog';

export default function SafetyCheckDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [explaining, setExplaining] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const check = useQuery({ queryKey: ['safety-check', id], queryFn: () => safetyApi.getCheck(id) });
  const patientId = check.data && check.data.patientId;

  const medications = useQuery({
    queryKey: ['medications', patientId, { all: true }],
    queryFn: () => medicationApi.list(patientId, { limit: 100 }),
    enabled: Boolean(patientId),
  });

  const createReport = useMutation({
    mutationFn: () => reportApi.create(id),
    onSuccess: (report) => {
      toast.success('Report created', report.reportNumber);
      navigate(`/reports/${report.id}`);
    },
    onError: (error) => toast.error('Could not create report', errorMessage(error)),
  });

  if (check.isLoading) return <LoadingSkeleton rows={4} />;
  if (check.isError) return <ErrorState description={errorMessage(check.error)} onRetry={check.refetch} />;

  const record = check.data;
  const findings = record.findings || [];
  const status = overallStatus(findings);
  const canReview = currentUser.role === ROLES.DOCTOR || currentUser.role === ROLES.PHARMACIST;

  const drugNames = {};
  ((medications.data && medications.data.items) || []).forEach((medication) => {
    if (medication.drugId) drugNames[medication.drugId] = medication.drug ? medication.drug.genericName : medication.rawName;
  });

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link to="/safety" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Safety checks
          </Link>
        }
        title="Safety check"
        description={`Run ${formatDateTime(record.createdAt)}${record.patient ? ` for ${record.patient.user.name}` : ''}`}
        actions={
          <Button icon={FileText} variant="secondary" loading={createReport.isPending} onClick={() => createReport.mutate()}>
            Generate report
          </Button>
        }
      />

      <div className={`mb-6 rounded-xl border px-5 py-4 ${status.className}`} role="status">
        <p className="text-sm font-semibold">{status.label}</p>
        <p className="text-sm opacity-90">{status.detail}</p>
      </div>

      {findings.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No findings"
            description="No curated rule matched this medication list, conditions, allergies or lab values."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {groupBySeverity(findings).map((group) => (
            <section key={group.severity}>
              <h2 className="section-title mb-2">
                {severityMeta(group.severity).label} · {group.items.length}
              </h2>
              <div className="space-y-3">
                {group.items.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    drugNames={drugNames}
                    defaultOpen={group.items.length === 1}
                    onExplain={setExplaining}
                    onReview={canReview ? setReviewing : undefined}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <AiExplanationPanel
        open={Boolean(explaining)}
        onClose={() => setExplaining(null)}
        finding={explaining}
        safetyCheckId={id}
      />
      <ReviewDialog open={Boolean(reviewing)} onClose={() => setReviewing(null)} finding={reviewing} />
    </>
  );
}
