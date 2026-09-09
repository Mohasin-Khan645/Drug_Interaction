import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '../../api/authApi';
import { forgotPasswordSchema } from '../../lib/validation';
import { errorMessage } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Feedback';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });

  const onSubmit = async (values) => {
    setError(null);
    try {
      await authApi.forgotPassword(values.email);
      setSubmitted(true);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Reset your password</h1>
      <p className="mt-1 text-sm text-ink-muted">We will email a reset link if an account exists for that address.</p>

      {submitted ? (
        <Alert tone="success" className="mt-6" title="Check your inbox">
          If the address is registered, a reset link is on its way.{' '}
          <Link to="/reset-password" className="font-medium underline">
            Enter your reset token
          </Link>
          .
        </Alert>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {error && (
            <Alert tone="danger" title="Request failed">
              {error}
            </Alert>
          )}
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            error={errors.email && errors.email.message}
            {...register('email')}
          />
          <Button type="submit" className="w-full justify-center" size="lg" loading={isSubmitting}>
            Send reset link
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
