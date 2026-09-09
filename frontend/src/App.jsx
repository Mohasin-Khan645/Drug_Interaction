import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AuthLayout } from './components/layout/AuthLayout';
import { ProtectedRoute, PublicOnlyRoute, RoleRoute } from './app/guards';
import { ROLES } from './lib/constants';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

const DrugCatalogPage = lazy(() => import('./pages/drugs/DrugCatalogPage'));
const DrugDetailPage = lazy(() => import('./pages/drugs/DrugDetailPage'));
const InteractionCheckerPage = lazy(() => import('./pages/drugs/InteractionCheckerPage'));
const MedicationsPage = lazy(() => import('./pages/medications/MedicationsPage'));
const MedicationReviewPage = lazy(() => import('./pages/medications/MedicationReviewPage'));
const PrescriptionsPage = lazy(() => import('./pages/prescriptions/PrescriptionsPage'));
const PrescriptionDetailPage = lazy(() => import('./pages/prescriptions/PrescriptionDetailPage'));
const SafetyPage = lazy(() => import('./pages/safety/SafetyPage'));
const SafetyCheckDetailPage = lazy(() => import('./pages/safety/SafetyCheckDetailPage'));
const AlertsPage = lazy(() => import('./pages/alerts/AlertsPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const ReportDetailPage = lazy(() => import('./pages/reports/ReportDetailPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const PatientsPage = lazy(() => import('./pages/patients/PatientsPage'));
const PatientDetailPage = lazy(() => import('./pages/patients/PatientDetailPage'));
const ReviewsPage = lazy(() => import('./pages/reviews/ReviewsPage'));
const ReviewDetailPage = lazy(() => import('./pages/reviews/ReviewDetailPage'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminDrugsPage = lazy(() => import('./pages/admin/AdminDrugsPage'));
const AdminInteractionsPage = lazy(() => import('./pages/admin/AdminInteractionsPage'));
const AdminRulesPage = lazy(() => import('./pages/admin/AdminRulesPage'));
const AdminEvidencePage = lazy(() => import('./pages/admin/AdminEvidencePage'));
const AdminAuditPage = lazy(() => import('./pages/admin/AdminAuditPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

const CLINICIANS = [ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.ADMIN];

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/drugs" element={<DrugCatalogPage />} />
          <Route path="/drugs/:id" element={<DrugDetailPage />} />
          <Route path="/interactions" element={<InteractionCheckerPage />} />
          <Route path="/medications" element={<MedicationsPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/prescriptions/:id" element={<PrescriptionDetailPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/safety/:id" element={<SafetyCheckDetailPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />

          <Route element={<RoleRoute allow={CLINICIANS} />}>
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/reviews/:id" element={<ReviewDetailPage />} />
            <Route path="/medication-review" element={<MedicationReviewPage />} />
          </Route>

          <Route element={<RoleRoute allow={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/drugs" element={<AdminDrugsPage />} />
            <Route path="/admin/interactions" element={<AdminInteractionsPage />} />
            <Route path="/admin/rules" element={<AdminRulesPage />} />
            <Route path="/admin/evidence" element={<AdminEvidencePage />} />
            <Route path="/admin/alerts" element={<AlertsPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
