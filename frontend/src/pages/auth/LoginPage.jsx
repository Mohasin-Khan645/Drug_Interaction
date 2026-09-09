import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loginSchema } from '../../lib/validation';
import { errorMessage } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Feedback';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await login(values);
      const from = (location.state && location.state.from) || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(errorMessage(error, 'Invalid email or password.'));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Sign in</h1>
      <p className="mt-1 text-sm text-ink-muted">Access medication safety intelligence for your patients.</p>

      {formError && (
        <Alert tone="danger" className="mt-5" title="Sign-in failed">
          {formError}
        </Alert>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
          autoComplete="current-password"
          required
          error={errors.password && errors.password.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full justify-center" size="lg" loading={isSubmitting} icon={LogIn}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        New to DrugSafe?{' '}
        <Link to="/register" className="font-medium text-brand-700 hover:underline">
          Create a patient account
        </Link>
      </p>
    </div>
  );
}
