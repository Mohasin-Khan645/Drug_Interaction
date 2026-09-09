import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, X } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { passwordChecks, resetPasswordSchema } from '../../lib/validation';
import { errorMessage } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Feedback';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: params.get('token') || '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (values) => {
    setError(null);
    try {
      await authApi.resetPassword({ token: values.token, password: values.password });
      toast.success('Password updated', 'Sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (caught) {
      setError(errorMessage(caught, 'This reset token is invalid or has expired.'));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Choose a new password</h1>
      <p className="mt-1 text-sm text-ink-muted">Resetting your password signs out all other sessions.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && (
          <Alert tone="danger" title="Reset failed">
            {error}
          </Alert>
        )}
        <Input label="Reset token" required error={errors.token && errors.token.message} {...register('token')} />
        <PasswordInput
          label="New password"
          autoComplete="new-password"
          required
          error={errors.password && errors.password.message}
          {...register('password')}
        />
        <ul className="grid grid-cols-2 gap-1 text-xs">
          {passwordChecks(password).map((check) => (
            <li key={check.label} className={check.valid ? 'flex items-center gap-1 text-emerald-700' : 'flex items-center gap-1 text-ink-muted'}>
              {check.valid ? <Check aria-hidden="true" className="h-3 w-3" /> : <X aria-hidden="true" className="h-3 w-3" />}
              {check.label}
            </li>
          ))}
        </ul>
        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword && errors.confirmPassword.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" className="w-full justify-center" size="lg" loading={isSubmitting}>
          Update password
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
