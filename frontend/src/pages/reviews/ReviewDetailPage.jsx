import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { reviewApi, safetyApi } from '../../api/safetyApi';
import { errorMessage } from '../../lib/format';
import { PageHeader } from '../../components/ui/Card';
import { ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { FindingCard } from '../../components/safety/FindingCard';
import { AiExplanationPanel } from '../../components/safety/AiExplanationPanel';
import { ReviewDialog } from '../../components/safety/ReviewDialog';

export default function ReviewDetailPage() {
  const { id } = useParams();
  const [explaining, setExplaining] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const finding = useQuery({ queryKey: ['finding', id], queryFn: () => safetyApi.getFinding(id) });
  const reviews = useQuery({ queryKey: ['reviews', id], queryFn: () => reviewApi.list(id) });

  if (finding.isLoading) return <LoadingSkeleton rows={3} />;
  if (finding.isError) return <ErrorState description={errorMessage(finding.error)} onRetry={finding.refetch} />;

  const record = { ...finding.data, reviews: reviews.data || finding.data.reviews || [] };

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link to="/reviews" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Review queue
          </Link>
        }
        title="Finding review"
        description="Deterministic finding with its stored evidence and review history."
      />

      <FindingCard
        finding={record}
        defaultOpen
        onExplain={() => setExplaining(true)}
        onReview={() => setReviewing(true)}
      />

      <AiExplanationPanel
        open={explaining}
        onClose={() => setExplaining(false)}
        finding={record}
        safetyCheckId={record.safetyCheckId}
      />
      <ReviewDialog open={reviewing} onClose={() => setReviewing(false)} finding={record} />
    </>
  );
}
