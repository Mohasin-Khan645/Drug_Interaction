import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alert from '../common/Alert';
import Button from '../common/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function RoleGuard({ allowedRoles = [], children }) {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentRoleNormalized = (role || '').toUpperCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(currentRoleNormalized)) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Clinical Access Restricted
          </h2>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            This module requires authorization designated for{' '}
            <strong className="text-slate-800">{allowedRoles.join(' or ')}</strong> personnel.
            Your current assigned clinical role is <strong className="text-slate-800">{role}</strong>.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => window.history.back()}
            >
              Return to Previous View
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                navigate('/dashboard');
              }}
            >
              Go to My Portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
