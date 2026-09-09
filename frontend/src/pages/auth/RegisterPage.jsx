import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, UserPlus, X } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { passwordChecks, registerSchema } from '../../lib/validation';
import { errorMessage } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Feedback';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', consent: false },
  });

  const password = watch('password');

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await authApi.register({ name: values.name, email: values.email, password: values.password });
      // Registration returns no session, so sign in with the same credentials.
      await login({ email: values.email, password: values.password });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFormError(errorMessage(error, 'Registration failed. Please try again.'));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Self-service registration creates a patient account. Clinician access is provisioned by an administrator.
      </p>

      {formError && (
        <Alert tone="danger" className="mt-5" title="Registration failed">
          {formError}
        </Alert>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="Full name" autoComplete="name" required error={errors.name && errors.name.message} {...register('name')} />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={errors.email && errors.email.message}
          {...register('email')}
        />
        <PasswordInput
          label="Password"
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
          label="Confirm password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword && errors.confirmPassword.message}
          {...register('confirmPassword')}
        />

        <div>
          <label className="flex items-start gap-2 text-sm text-ink">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-line" {...register('consent')} />
            <span>
              I understand DrugSafe provides clinical decision support and does not replace advice from a licensed
              clinician.
            </span>
          </label>
          {errors.consent && (
            <p className="mt-1 text-xs font-medium text-red-600" role="alert">
              {errors.consent.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full justify-center" size="lg" loading={isSubmitting} icon={UserPlus}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
