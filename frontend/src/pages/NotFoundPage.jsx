import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">404</p>
      <h1 className="text-2xl font-semibold text-ink">This page does not exist</h1>
      <p className="max-w-md text-sm text-ink-muted">
        The page may have moved, or you may not have access to it with your current role.
      </p>
      <Button as={Link} to="/dashboard">
        Back to dashboard
      </Button>
    </main>
  );
}
