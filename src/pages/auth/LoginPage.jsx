import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Pill,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  ArrowLeft,
  Smartphone,
  Stethoscope,
  HeartHandshake,
  ChevronRight,
} from 'lucide-react';
import { loginSchema } from '../../schemas/authSchemas';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { getPortalDashboardPath } from '../../constants/roles';

export default function LoginPage() {
  const { login, verifyMfa } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;
  const sessionExpired = new URLSearchParams(location.search).get('session_expired');

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2-Step MFA State
  const [step, setStep] = useState('credentials'); // 'credentials' | 'mfa'
  const [mfaTicket, setMfaTicket] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaUser, setMfaUser] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'sarah.jenkins@example.com',
      password: 'Password123!',
      rememberMe: true,
    },
  });

  const handlePostAuthRedirect = (user) => {
    if (from && from !== '/login') {
      navigate(from, { replace: true });
    } else {
      const target = getPortalDashboardPath(user?.role);
      navigate(target, { replace: true });
    }
  };

  const onSubmit = async (data) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await login(data);
      if (res?.mfaRequired) {
        setMfaTicket(res.mfaTicket);
        setMfaUser(res.user);
        setStep('mfa');
        addToast({
          title: '2-Factor Verification Required',
          message: 'Please enter your 6-digit one-time authentication code.',
          type: 'info',
        });
        return;
      }

      const user = res?.user || res?.data?.user;
      addToast({
        title: 'Authentication Verified',
        message: 'Welcome to DrugSafe Medication Intelligence.',
        type: 'success',
      });
      handlePostAuthRedirect(user);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Invalid clinical credentials or unauthorized account.';
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onMfaSubmit = async (e) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length < 6) {
      setAuthError('Please enter a valid 6-digit authentication code.');
      return;
    }
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await verifyMfa({ mfaTicket, code: mfaCode.trim() });
      const user = res?.user || res?.data?.user;
      addToast({
        title: 'Two-Factor Authentication Confirmed',
        message: 'Clinical identity verified with multi-factor assurance.',
        type: 'success',
      });
      handlePostAuthRedirect(user);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Invalid or expired 2FA verification code.';
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Brand Logo & Name */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-lg shadow-teal-900/20">
            <Pill className="w-7 h-7 -rotate-45" />
          </div>
        </div>

        <h1 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-900">
          DRUG<span className="text-teal-700">SAFE</span>
        </h1>
        <p className="mt-1 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
          Enterprise 4-Role Healthcare Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        {/* 4 Dedicated Portal Entry Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            to="/login/patient"
            className="group flex flex-col items-center p-3.5 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-md transition-all text-center"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900">Patient</span>
            <span className="text-3xs text-slate-500">Sign In</span>
          </Link>

          <Link
            to="/login/doctor"
            className="group flex flex-col items-center p-3.5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-center"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900">Clinician</span>
            <span className="text-3xs text-slate-500">Sign In</span>
          </Link>

          <Link
            to="/login/pharmacist"
            className="group flex flex-col items-center p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all text-center"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Pill className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900">Pharmacist</span>
            <span className="text-3xs text-slate-500">Sign In</span>
          </Link>

          <Link
            to="/login/admin"
            className="group flex flex-col items-center p-3.5 bg-white border border-slate-200 rounded-xl hover:border-purple-400 hover:shadow-md transition-all text-center"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900">Admin</span>
            <span className="text-3xs text-slate-500">Sign In</span>
          </Link>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-2xl sm:px-10">
          {sessionExpired && (
            <Alert variant="warning" className="mb-4">
              Your clinical security session has expired. Please sign in again.
            </Alert>
          )}

          {authError && (
            <Alert variant="danger" className="mb-4">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            </Alert>
          )}

          {step === 'credentials' ? (
            <>
              <div className="mb-4 text-center">
                <h2 className="text-sm font-bold text-slate-800">Unified Portal Sign In</h2>
                <p className="text-3xs text-slate-500">
                  Enter your credentials to be automatically routed to your authorized role workspace
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. physician@hospital.org"
                  prefixIcon={Mail}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  prefixIcon={Lock}
                  suffixIcon={showPassword ? EyeOff : Eye}
                  onSuffixClick={() => setShowPassword(!showPassword)}
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                      {...register('rememberMe')}
                    />
                    <span>Remember session</span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="font-semibold text-teal-700 hover:text-teal-900"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full mt-2"
                >
                  Sign In to DrugSafe
                </Button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500">
                Don&apos;t have a verified clinical account?{' '}
                <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-900">
                  Register here
                </Link>
              </div>
            </>
          ) : (
            /* Multi-Factor Authentication Verification */
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 mb-3 border border-teal-200">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Two-Factor Authentication (2FA)</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter the 6-digit security code for{' '}
                  <strong className="text-slate-800">{mfaUser?.email}</strong>.
                </p>
              </div>

              <form onSubmit={onMfaSubmit} className="space-y-4">
                <div>
                  <label htmlFor="mfa-code" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Authentication Code
                  </label>
                  <div className="relative">
                    <input
                      id="mfa-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      placeholder="123456"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-slate-900"
                    />
                  </div>
                </div>

                <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-teal-700 shrink-0" />
                    <span className="text-xs text-teal-900">
                      Demo MFA Code: <strong className="font-mono">123456</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMfaCode('123456')}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 underline"
                  >
                    Auto-Fill
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  disabled={mfaCode.length < 6}
                  className="w-full"
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Verify & Enter DrugSafe
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials');
                    setMfaTicket('');
                    setMfaCode('');
                    setAuthError(null);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 pt-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
