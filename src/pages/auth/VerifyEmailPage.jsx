import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { verifyEmailSchema } from '../../schemas/authSchemas';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'your clinical email';
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: '123456' },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      addToast({
        title: 'Identity Confirmed',
        message: 'Your email address has been verified. You may now log in.',
        type: 'success',
      });
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid 6-digit verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
            <MailCheck className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-slate-900">
          Verify Clinical Email
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          We sent a 6-digit verification security code to <strong className="text-slate-700">{email}</strong>
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
              label="6-Digit Verification Code"
              placeholder="e.g. 123456"
              maxLength={6}
              className="text-center font-mono text-lg tracking-widest"
              error={errors.code?.message}
              {...register('code')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full"
            >
              Verify & Complete Registration
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Didn&apos;t receive a code?{' '}
            <button
              type="button"
              onClick={() =>
                addToast({
                  title: 'Code Resent',
                  message: 'A new 6-digit code has been dispatched.',
                  type: 'info',
                })
              }
              className="font-semibold text-teal-700 hover:text-teal-900 underline"
            >
              Resend code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
