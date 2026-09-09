import { lazy } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../lib/constants';

const AdminDashboard = lazy(() => import('./AdminDashboard'));
const ClinicianDashboard = lazy(() => import('./ClinicianDashboard'));
const PatientDashboard = lazy(() => import('./PatientDashboard'));

export default function DashboardPage() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  if (currentUser.role === ROLES.ADMIN) return <AdminDashboard />;
  if (currentUser.role === ROLES.DOCTOR || currentUser.role === ROLES.PHARMACIST) return <ClinicianDashboard />;
  return <PatientDashboard />;
}
