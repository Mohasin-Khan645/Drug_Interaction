import { Link } from 'react-router-dom';
import { Activity, Plus } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function DrugCard({ drug, onAddToList, onCheckInteraction }) {
  const ingredients = (drug.ingredients || []).map((entry) => entry.ingredient && entry.ingredient.name).filter(Boolean);

  return (
    <article className="card flex h-full flex-col justify-between px-5 py-4">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">{drug.genericName}</h3>
          {drug.drugClass && <Badge tone="brand">{drug.drugClass.name}</Badge>}
        </div>
        {drug.brandName && <p className="mt-0.5 text-sm text-ink-muted">Brand: {drug.brandName}</p>}
        <dl className="mt-3 space-y-1 text-xs text-ink-muted">
          <div>
            <dt className="inline font-medium text-ink">Ingredients: </dt>
            <dd className="inline">{ingredients.length ? ingredients.join(', ') : 'Not recorded'}</dd>
          </div>
          {drug.dosageForm && (
            <div>
              <dt className="inline font-medium text-ink">Form: </dt>
              <dd className="inline">{drug.dosageForm}</dd>
            </div>
          )}
          {drug.route && (
            <div>
              <dt className="inline font-medium text-ink">Route: </dt>
              <dd className="inline">{drug.route}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button as={Link} to={`/drugs/${drug.id}`} variant="secondary" size="sm">
          View details
        </Button>
        {onAddToList && (
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => onAddToList(drug)}>
            Add to medications
          </Button>
        )}
        {onCheckInteraction && (
          <Button variant="ghost" size="sm" icon={Activity} onClick={() => onCheckInteraction(drug)}>
            Check interaction
          </Button>
        )}
      </div>
    </article>
  );
}
