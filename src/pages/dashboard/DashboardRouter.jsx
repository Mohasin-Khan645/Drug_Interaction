import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPortalDashboardPath } from '../../constants/roles.js';

export default function DashboardRouter() {
  const { role } = useAuth();
  const targetPath = getPortalDashboardPath(role);

  return <Navigate to={targetPath} replace />;
}

