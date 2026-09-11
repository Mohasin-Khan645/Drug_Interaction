import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Eye, EyeOff, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { registerSchema } from '../../schemas/authSchemas';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';

export default function RegisterPage() {
  const { login } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'PATIENT',
      termsAccepted: false,
    },
  });

  const onSubmit = async (data) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      // Simulate/call registration API
      await new Promise((res) => setTimeout(res, 600));
      addToast({
        title: 'Account Registered',
        message: 'Your clinical identity verification request has been initialized.',
        type: 'success',
      });
      navigate('/verify-email?email=' + encodeURIComponent(data.email));
    } catch (err) {
      setErrorMsg(err.message || 'Unable to complete clinical registration. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-lg shadow-teal-900/20">
            <Pill className="w-7 h-7 -rotate-45" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-900">
          Create Clinical Account
        </h1>
        <p className="mt-1 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
          Join the DrugSafe Intelligence Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-2xl sm:px-10">
          {errorMsg && (
            <Alert variant="danger" className="mb-4">
              {errorMsg}
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full Legal Name"
              placeholder="e.g. Dr. Jane Foster or John Doe"
              prefixIcon={User}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="clinical.email@example.com"
              prefixIcon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Role selection strictly excludes ADMIN as required */}
            <Select
              label="Account / Clinical Role"
              options={[
                { value: 'PATIENT', label: 'Patient / Health Consumer' },
                { value: 'DOCTOR', label: 'Physician / Medical Doctor (MD/DO)' },
                { value: 'PHARMACIST', label: 'Clinical Pharmacist (PharmD/RPh)' },
              ]}
              helperText="Administrator roles require internal IT authorization and cannot be self-registered."
              error={errors.role?.message}
              {...register('role')}
            />

            <Input
              label="Password (min 8 chars, 1 uppercase, 1 number)"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              prefixIcon={Lock}
              suffixIcon={showPassword ? EyeOff : Eye}
              onSuffixClick={() => setShowPassword(!showPassword)}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              prefixIcon={Lock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-teal-700 focus:ring-teal-600 mt-0.5"
                  {...register('termsAccepted')}
                />
                <span>
                  I agree to the <strong>Healthcare Data Privacy Agreement</strong> and acknowledge that DrugSafe decision support supplements, but does not replace, licensed medical care.
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="mt-1 text-xs text-red-600">{errors.termsAccepted.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-900">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
