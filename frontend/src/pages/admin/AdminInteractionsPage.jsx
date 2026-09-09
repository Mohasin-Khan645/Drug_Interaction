import { PageHeader } from '../../components/ui/Card';
import { RulesManager } from './RulesManager';

export default function AdminInteractionsPage() {
  return (
    <>
      <PageHeader
        title="Drug interactions"
        description="Curated drug–drug interaction pairs used by the deterministic safety engine."
      />
      <RulesManager
        kind="interaction"
        title="Interaction rules"
        description="Pairs are stored in canonical order, so A+B and B+A resolve to one rule."
      />
    </>
  );
}
