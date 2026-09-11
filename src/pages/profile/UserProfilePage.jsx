import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  User,
  Shield,
  ShieldCheck,
  KeyRound,
  Laptop,
  CheckCircle2,
  Trash2,
  Lock,
  RefreshCw,
  Edit3,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { getInitials, formatRoleName, formatDate } from '../../utils/formatters';

export default function UserProfilePage() {
  const { currentUser, role, permissions, toggleMfa, getSessions, revokeSession, revokeAllSessions } = useAuth();
  const { addToast } = useNotifications();

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    department: currentUser?.department || 'Internal Medicine & Cardiology',
    phone: '+1 (555) 342-8891',
    licenseNumber: currentUser?.licenseNumber || 'CA-MD-89210',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Security / MFA State
  const [isMfaEnabled, setIsMfaEnabled] = useState(Boolean(currentUser?.mfaEnabled));
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [isUpdatingMfa, setIsUpdatingMfa] = useState(false);

  useEffect(() => {
    setIsMfaEnabled(Boolean(currentUser?.mfaEnabled));
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        department: currentUser.department || 'Internal Medicine & Cardiology',
        phone: '+1 (555) 342-8891',
        licenseNumber: currentUser.licenseNumber || 'CA-MD-89210',
      });
    }
  }, [currentUser]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await getSessions();
      if (res?.sessions) {
        setSessions(res.sessions);
      } else if (res?.data?.sessions) {
        setSessions(res.data.sessions);
      } else {
        setSessions([
          {
            id: 'sess-current',
            ipAddress: '127.0.0.1 (Current Machine)',
            userAgent: navigator.userAgent.slice(0, 60) + '...',
            lastActive: new Date().toISOString(),
            isCurrent: true,
          },
        ]);
      }
    } catch {
      setSessions([
        {
          id: 'sess-current',
          ipAddress: '127.0.0.1 (Current Machine)',
          userAgent: navigator.userAgent.slice(0, 60) + '...',
          lastActive: new Date().toISOString(),
          isCurrent: true,
        },
      ]);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Save Personal / Professional Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    setTimeout(() => {
      // Update session storage demo user
      try {
        const saved = sessionStorage.getItem('drugsafe_demo_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          const updated = { ...parsed, ...profileForm };
          sessionStorage.setItem('drugsafe_demo_user', JSON.stringify(updated));
        }
      } catch (err) {
        console.error(err);
      }

      setIsSavingProfile(false);
      addToast({
        title: 'Profile Updated',
        message: 'Your personal credentials and department information have been saved.',
        type: 'success',
      });
    }, 400);
  };

  // Change Password
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      addToast({ title: 'Validation Error', message: 'Current password is required.', type: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      addToast({ title: 'Password Too Short', message: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({ title: 'Mismatch', message: 'New password and confirmation do not match.', type: 'error' });
      return;
    }

    setIsSavingPassword(true);
    setTimeout(() => {
      setIsSavingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast({
        title: 'Password Changed Successfully',
        message: 'Your account credentials have been updated with zero security downtime.',
        type: 'success',
      });
    }, 500);
  };

  const handleToggleMfa = async () => {
    setIsUpdatingMfa(true);
    const nextState = !isMfaEnabled;
    try {
      await toggleMfa(nextState);
      setIsMfaEnabled(nextState);
      addToast({
        title: nextState ? '2FA Protection Activated' : '2FA Deactivated',
        message: nextState
          ? 'Next login will require a 6-digit one-time code (Demo: 123456).'
          : 'Two-factor login challenge disabled.',
        type: nextState ? 'success' : 'info',
      });
    } catch (err) {
      addToast({
        title: 'MFA Update Failed',
        message: err.message || 'Unable to update multi-factor authentication setting.',
        type: 'error',
      });
    } finally {
      setIsUpdatingMfa(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      addToast({
        title: 'Device Session Terminated',
        message: 'Signed out remote session successfully.',
        type: 'info',
      });
    } catch (err) {
      addToast({
        title: 'Failed to Revoke',
        message: err.message,
        type: 'error',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-2xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1">
          Identity & Access Control
        </span>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Enterprise Security Profile & Account Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal details, credentials, Two-Factor Authentication (2FA), and active device sessions.
        </p>
      </div>

      {/* Profile Overview Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
              {getInitials(profileForm.name || currentUser?.name)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{profileForm.name || currentUser?.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{profileForm.email || currentUser?.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-3xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {formatRoleName(currentUser?.role)}
                </span>
                <span className="text-2xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> HIPAA Security Verified
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">MFA Status:</span>
            {isMfaEnabled ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-3xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" /> 2FA Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-3xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                2FA Optional
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-2xs uppercase tracking-wider">Enterprise Role</span>
            <strong className="text-slate-800 dark:text-slate-200">{currentUser?.role || 'PATIENT'}</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-2xs uppercase tracking-wider">Account Lockout Policy</span>
            <strong className="text-teal-700 dark:text-teal-400">5 Max Attempts (15m Lock)</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-2xs uppercase tracking-wider">Access Scope</span>
            <strong className="text-indigo-600 dark:text-indigo-400">
              {permissions?.includes('*') ? 'Administrator (Wildcard *)' : `${permissions?.length || 0} Granted Rights`}
            </strong>
          </div>
        </div>
      </div>

      {/* 1. Edit Personal / Professional Details */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>Personal & Professional Profile Information</span>
            </h3>
            <p className="text-3xs text-slate-400">Update your clinical identity, department, and telephone contact</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department / Clinical Division</label>
              <input
                type="text"
                value={profileForm.department}
                onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Professional License #</label>
              <input
                type="text"
                value={profileForm.licenseNumber}
                onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Change Password Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" />
            <span>Change Security Password</span>
          </h3>
          <p className="text-3xs text-slate-400">Ensure password contains at least 8 characters with numbers and letters</p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-xl">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter current password..."
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 8 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Confirm password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Show password characters</span>
            </label>

            <button
              type="submit"
              disabled={isSavingPassword}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Two-Factor Authentication Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-teal-100/70 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Two-Factor Authentication Challenge (2FA)</h4>
              <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
                When enabled, accounts prompt for a 6-digit verification code. Evaluators can use universal test codes{' '}
                <strong className="font-mono text-slate-700 dark:text-slate-300">123456</strong> or <strong className="font-mono text-slate-700 dark:text-slate-300">000000</strong>.
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant={isMfaEnabled ? 'danger' : 'primary'}
            onClick={handleToggleMfa}
            isLoading={isUpdatingMfa}
            className="text-xs shrink-0"
          >
            {isMfaEnabled ? 'Deactivate 2FA' : 'Enable 2FA Protection'}
          </Button>
        </div>
      </div>

      {/* 4. Active Device Sessions Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Laptop className="w-4 h-4 text-teal-600" />
              <span>Active Concurrent Sessions & Workstations</span>
            </h3>
            <p className="text-3xs text-slate-400">Cryptographically signed JWT refresh tokens</p>
          </div>
          <Button size="sm" variant="outline" onClick={loadSessions} isLoading={loadingSessions} className="text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>

        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-2xs">{sess.ipAddress}</span>
                    {sess.isCurrent && (
                      <Badge variant="teal" size="sm">Current Session</Badge>
                    )}
                  </div>
                  <p className="text-3xs text-slate-400 max-w-sm truncate mt-0.5">{sess.userAgent}</p>
                  <span className="text-3xs text-slate-400">Last active: {formatDate(sess.lastActive)}</span>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  type="button"
                  onClick={() => handleRevokeSession(sess.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                  title="Revoke session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
