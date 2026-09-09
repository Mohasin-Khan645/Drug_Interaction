import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { errorMessage } from '../../lib/format';
import { Alert, Spinner } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const tokenFromUrl = params.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [state, setState] = useState(tokenFromUrl ? 'verifying' : 'idle');
  const [error, setError] = useState(null);
  const attempted = useRef(false);

  const verify = async (value) => {
    setState('verifying');
    setError(null);
    try {
      await authApi.verifyEmail(value);
      setState('verified');
    } catch (caught) {
      setError(errorMessage(caught, 'This verification link is invalid or has expired.'));
      setState('failed');
    }
  };

  useEffect(() => {
    if (tokenFromUrl && !attempted.current) {
      attempted.current = true;
      verify(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Verify your email</h1>
      <p className="mt-1 text-sm text-ink-muted">Confirm your address to activate safety alerts on your account.</p>

      {state === 'verifying' && <Spinner label="Verifying your email…" />}

      {state === 'verified' && (
        <Alert tone="success" className="mt-6" title="Email verified">
          Your account is ready.{' '}
          <Link to="/login" className="font-medium underline">
            Sign in
          </Link>
          .
        </Alert>
      )}

      {(state === 'idle' || state === 'failed') && (
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (token.trim().length >= 10) verify(token.trim());
          }}
        >
          {error && (
            <Alert tone="danger" title="Verification failed">
              {error}
            </Alert>
          )}
          <Input
            label="Verification token"
            required
            value={token}
            onChange={(event) => setToken(event.target.value)}
            hint="Paste the token from your verification email."
          />
          <Button type="submit" className="w-full justify-center" size="lg" disabled={token.trim().length < 10}>
            Verify email
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-ink-muted">
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
