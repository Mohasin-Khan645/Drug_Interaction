import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Sliders } from 'lucide-react';
import { DISCLAIMER } from '../../lib/constants';
import { Card, CardBody, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Feedback';

const POLICIES = [
  {
    title: 'Deterministic rules decide findings',
    body: 'Safety findings come only from curated rules. The AI layer explains findings and cites stored evidence; it never creates, ranks or overrides them.',
  },
  {
    title: 'Nothing is auto-confirmed',
    body: 'Extracted prescription lines and normalization candidates stay unconfirmed until a person confirms them against the catalog.',
  },
  {
    title: 'Records are retained',
    body: 'Stopping a medication, deactivating a drug or retiring a rule changes status only. History stays reproducible for past reports.',
  },
  {
    title: 'Access is enforced server side',
    body: 'The interface hides what a role cannot use, but every request is authorized again by the API against the patient record.',
  },
];

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Platform policies and the operational controls behind them." />

      <Alert tone="info" title="Clinical disclaimer" className="mb-6">
        {DISCLAIMER}
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Safety policies" description="These boundaries are enforced by the API, not by the UI." />
          <CardBody className="space-y-3">
            {POLICIES.map((policy) => (
              <div key={policy.title} className="rounded-lg border border-line px-3 py-2">
                <p className="text-sm font-medium text-ink">{policy.title}</p>
                <p className="text-sm text-ink-muted">{policy.body}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Operational controls" />
          <CardBody className="flex flex-col items-start gap-2">
            <Button as={Link} to="/admin/rules" variant="secondary" icon={ShieldCheck}>
              Manage safety rules
            </Button>
            <Button as={Link} to="/admin/evidence" variant="secondary" icon={BookOpen}>
              Manage evidence library
            </Button>
            <Button as={Link} to="/admin/users" variant="secondary" icon={Sliders}>
              Manage users and roles
            </Button>
            <p className="hint">
              Provider keys (OCR, AI, email) are configured as server-side environment variables and are never exposed to
              the browser.
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
