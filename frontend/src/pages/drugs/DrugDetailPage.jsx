import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { drugApi } from '../../api/drugApi';
import { Card, CardBody, CardHeader, PageHeader } from '../../components/ui/Card';
import { Badge, SeverityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { errorMessage } from '../../lib/format';

export default function DrugDetailPage() {
  const { id } = useParams();
  const drugQuery = useQuery({ queryKey: ['drug', id], queryFn: () => drugApi.get(id) });
  const interactionsQuery = useQuery({ queryKey: ['drug-interactions', id], queryFn: () => drugApi.interactions(id) });

  if (drugQuery.isLoading) return <LoadingSkeleton rows={4} />;
  if (drugQuery.isError) return <ErrorState description={errorMessage(drugQuery.error)} onRetry={drugQuery.refetch} />;

  const drug = drugQuery.data;
  const interactions = interactionsQuery.data || [];

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link to="/drugs" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Drug catalog
          </Link>
        }
        title={drug.genericName}
        description={drug.brandName ? `Also marketed as ${drug.brandName}` : undefined}
        actions={
          <Button as={Link} to="/interactions" variant="secondary">
            Check interactions
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Overview" />
          <CardBody>
            <dl className="space-y-3 text-sm">
              <Row label="Class" value={drug.drugClass ? drug.drugClass.name : 'Not classified'} />
              <Row label="Dosage form" value={drug.dosageForm} />
              <Row label="Route" value={drug.route} />
              <Row label="Status" value={drug.status} />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Active ingredients</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {(drug.ingredients || []).length === 0 && <span className="text-ink-muted">Not recorded</span>}
                  {(drug.ingredients || []).map((entry) => (
                    <Badge key={entry.ingredientId || entry.ingredient.id} tone="brand">
                      {entry.ingredient.name}
                      {entry.strength ? ` · ${entry.strength}` : ''}
                    </Badge>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Identifiers</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {(drug.identifiers || []).length === 0 && <span className="text-ink-muted">None recorded</span>}
                  {(drug.identifiers || []).map((identifier) => (
                    <Badge key={identifier.id}>
                      {identifier.type}: {identifier.value}
                    </Badge>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Also known as</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {(drug.aliases || []).length === 0 && <span className="text-ink-muted">No aliases</span>}
                  {(drug.aliases || []).map((alias) => (
                    <Badge key={alias.id}>{alias.alias}</Badge>
                  ))}
                </dd>
              </div>
            </dl>
            {drug.description && <p className="mt-4 text-sm text-ink-muted">{drug.description}</p>}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Known interactions"
            description="Curated rules that reference this drug. Patient-specific screening runs from a safety check."
          />
          <CardBody className="space-y-3">
            {interactionsQuery.isLoading && <LoadingSkeleton rows={3} />}
            {interactionsQuery.isError && (
              <ErrorState description={errorMessage(interactionsQuery.error)} onRetry={interactionsQuery.refetch} />
            )}
            {interactionsQuery.isSuccess && interactions.length === 0 && (
              <EmptyState
                title="No curated interactions"
                description="No interaction rule in the catalog references this drug yet."
              />
            )}
            {interactions.map((interaction) => (
              <div key={interaction.id} className="rounded-lg border border-line px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <SeverityBadge severity={interaction.severity} />
                  {interaction.otherDrug && (
                    <Link to={`/drugs/${interaction.otherDrug.id}`} className="text-sm font-medium text-brand-700 hover:underline">
                      with {interaction.otherDrug.genericName}
                    </Link>
                  )}
                </div>
                <dl className="mt-2 space-y-1 text-sm">
                  <Row label="Effect" value={interaction.clinicalEffect} />
                  <Row label="Mechanism" value={interaction.mechanism} />
                  <Row label="Management" value={interaction.management} />
                </dl>
                <p className="mt-2 text-xs text-ink-muted">
                  {interaction.source ? `Source: ${interaction.source.name}` : 'Source not recorded'}
                  {interaction.evidenceLevel ? ` · Evidence ${interaction.evidenceLevel}` : ''}
                  {interaction.version ? ` · Rule v${interaction.version}` : ''}
                  {interaction.source && interaction.source.url && (
                    <a
                      className="ml-1 inline-flex items-center gap-1 text-brand-700 underline"
                      href={interaction.source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      open
                      <ExternalLink aria-hidden="true" className="h-3 w-3" />
                    </a>
                  )}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
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
