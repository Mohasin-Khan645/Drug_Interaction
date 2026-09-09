import { useState } from 'react';
import { PageHeader } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { RulesManager } from './RulesManager';

const KINDS = [
  { value: 'disease', label: 'Drug–disease', description: 'Contraindications and precautions against patient conditions.' },
  { value: 'allergy', label: 'Allergy', description: 'Exact drug, ingredient, class and cross-sensitivity rules.' },
  { value: 'duplication', label: 'Duplication', description: 'Same drug, same ingredient and therapeutic duplication.' },
  { value: 'factor', label: 'Patient factor', description: 'Age, weight, organ function and lab-value thresholds.' },
];

export default function AdminRulesPage() {
  const [kind, setKind] = useState('disease');
  const active = KINDS.find((entry) => entry.value === kind);

  return (
    <>
      <PageHeader
        title="Safety rules"
        description="Deterministic rules are the only source of findings. AI never creates or overrides them."
      />
      <Tabs
        className="mb-4"
        value={kind}
        onChange={setKind}
        tabs={KINDS.map((entry) => ({ value: entry.value, label: entry.label }))}
      />
      <RulesManager kind={kind} title={`${active.label} rules`} description={active.description} />
    </>
  );
}
