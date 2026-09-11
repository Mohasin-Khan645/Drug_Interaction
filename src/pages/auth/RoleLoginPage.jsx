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
  CheckCircle2,
} from 'lucide-react';
import { loginSchema } from '../../schemas/authSchemas';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { getPortalDashboardPath } from '../../constants/roles';

export default function RoleLoginPage({
  role,
  title,
  subtitle,
  badge,
  badgeIcon: BadgeIcon = ShieldCheck,
  themeColor = 'teal',
  complianceNotice,
  registerLink,
  defaultEmail = '',
}) {
  const { login, verifyMfa } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [roleNotice, setRoleNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2-Step MFA State
  const [step, setStep] = useState('credentials'); // 'credentials' | 'mfa'
  const [mfaTicket, setMfaTicket] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaUser, setMfaUser] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: 'Password123!',
      rememberMe: true,
    },
  });

  const getThemeStyles = () => {
    switch (themeColor) {
      case 'blue':
        return {
          iconBg: 'bg-blue-600',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          accentText: 'text-blue-700',
          ringFocus: 'focus:ring-blue-600',
        };
      case 'emerald':
        return {
          iconBg: 'bg-emerald-600',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accentText: 'text-emerald-700',
          ringFocus: 'focus:ring-emerald-600',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-700',
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
          accentText: 'text-purple-700',
          ringFocus: 'focus:ring-purple-600',
        };
      case 'teal':
      default:
        return {
          iconBg: 'bg-teal-700',
          badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
          accentText: 'text-teal-700',
          ringFocus: 'focus:ring-teal-600',
        };
    }
  };

  const theme = getThemeStyles();

  const handlePostLoginNavigation = (authenticatedUser) => {
    const userRole = (authenticatedUser?.role || role).toUpperCase();
    const targetPortalPath = getPortalDashboardPath(userRole);

    if (userRole !== role.toUpperCase() && userRole !== 'ADMIN') {
      setRoleNotice(
        `Authorized as ${userRole}. Directing you to your dedicated ${userRole} Portal...`
      );
      setTimeout(() => {
        navigate(targetPortalPath, { replace: true });
      }, 1200);
    } else {
      navigate(targetPortalPath, { replace: true });
    }
  };

  const onSubmit = async (data) => {
    setAuthError(null);
    setRoleNotice(null);
    setIsLoading(true);
    try {
      const res = await login(data);
      if (res?.mfaRequired) {
        setMfaTicket(res.mfaTicket);
        setMfaUser(res.user);
        setStep('mfa');
        addToast({
          title: 'Two-Factor Challenge',
          message: 'Please enter your 6-digit security verification code.',
          type: 'info',
        });
        return;
      }

      const user = res?.user || res?.data?.user;
      addToast({
        title: 'Authentication Successful',
        message: `Welcome to the ${title}.`,
        type: 'success',
      });
      handlePostLoginNavigation(user);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify credentials.';
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onMfaSubmit = async (e) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length < 6) {
      setAuthError('Please enter a valid 6-digit verification code.');
      return;
    }
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await verifyMfa({ mfaTicket, code: mfaCode.trim() });
      const user = res?.user || res?.data?.user;
      addToast({
        title: 'Two-Factor Confirmed',
        message: 'Security credentials verified.',
        type: 'success',
      });
      handlePostLoginNavigation(user);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Invalid or expired two-factor verification code.';
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand & Portal Header */}
        <div className="flex justify-center mb-3">
          <div
            className={`w-12 h-12 rounded-2xl ${theme.iconBg} text-white flex items-center justify-center shadow-lg shadow-slate-900/10`}
          >
            <Pill className="w-6 h-6 -rotate-45" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="text-xl font-black tracking-tight text-slate-900">
            DRUG<span className={theme.accentText}>SAFE</span>
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md border text-slate-600 bg-white border-slate-200">
            PORTAL
          </span>
        </div>

        <h1 className="text-center text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-center text-xs text-slate-500 max-w-sm mx-auto">
          {subtitle}
        </p>

        {badge && (
          <div className="mt-3 flex justify-center">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-3xs font-bold uppercase tracking-wider border ${theme.badgeBg}`}
            >
              <BadgeIcon className="w-3 h-3" />
              {badge}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-2xl sm:px-10">
          {authError && (
            <Alert variant="danger" className="mb-4">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            </Alert>
          )}

          {roleNotice && (
            <Alert variant="info" className="mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{roleNotice}</span>
              </div>
            </Alert>
          )}

          {step === 'credentials' ? (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Email Address"
                type="email"
                placeholder={defaultEmail || 'user@example.com'}
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
                  className="font-semibold text-slate-600 hover:text-slate-900"
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
                Sign In to {title}
              </Button>

              {complianceNotice && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-3xs text-slate-500 flex items-start gap-2 mt-4">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{complianceNotice}</span>
                </div>
              )}

              {registerLink && (
                <div className="mt-4 text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                  {registerLink.label}{' '}
                  <Link
                    to={registerLink.to}
                    className="font-semibold text-teal-700 hover:text-teal-900"
                  >
                    Register here
                  </Link>
                </div>
              )}

              <div className="mt-4 text-center text-xs text-slate-400">
                Need a different role portal?{' '}
                <Link to="/login" className="font-semibold text-slate-600 hover:text-slate-900 underline">
                  All Portals Directory
                </Link>
              </div>
            </form>
          ) : (
            /* Multi-Factor Authentication Verification */
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 mb-3 border border-teal-200">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Two-Factor Authentication (2FA)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter the 6-digit security code for{' '}
                  <strong className="text-slate-800">{mfaUser?.email}</strong>.
                </p>
              </div>

              <form onSubmit={onMfaSubmit} className="space-y-4">
                <div>
                  <label htmlFor="role-mfa-code" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Authentication Code
                  </label>
                  <input
                    id="role-mfa-code"
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

                <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-teal-700 shrink-0" />
                    <span className="text-xs text-teal-900">
                      Demo 2FA Code: <strong className="font-mono">123456</strong>
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
                  Verify & Enter Portal
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

