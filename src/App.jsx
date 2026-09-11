import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleGuard from './components/layout/RoleGuard';
import AppShell from './components/layout/AppShell';
import LoadingSkeleton from './components/common/LoadingSkeleton';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import PatientLoginPage from './pages/auth/PatientLoginPage';
import DoctorLoginPage from './pages/auth/DoctorLoginPage';
import PharmacistLoginPage from './pages/auth/PharmacistLoginPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboards
import DashboardRouter from './pages/dashboard/DashboardRouter';
import PatientDashboard from './pages/dashboard/PatientDashboard';
import DoctorDashboard from './pages/dashboard/DoctorDashboard';
import PharmacistDashboard from './pages/dashboard/PharmacistDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Patient Dedicated Suite
import PatientMedicationsPage from './pages/patient/PatientMedicationsPage';

// Pharmacist Dedicated Suite
import DispensingReviewPage from './pages/pharmacist/DispensingReviewPage';

// Drugs & Interactions
import DrugSearchPage from './pages/drugs/DrugSearchPage';
import DrugDetailPage from './pages/drugs/DrugDetailPage';
import InteractionCheckerPage from './pages/interactions/InteractionCheckerPage';

// Medications & Prescriptions
import MedicationListPage from './pages/medications/MedicationListPage';
import MedicationReconciliationPage from './pages/medications/MedicationReconciliationPage';
import PrescriptionUploadPage from './pages/prescriptions/PrescriptionUploadPage';
import OcrReviewPage from './pages/prescriptions/OcrReviewPage';

// Safety & Reports
import SafetyCheckPage from './pages/safety/SafetyCheckPage';
import SafetyReportDetailPage from './pages/safety/SafetyReportDetailPage';
import ReportListPage from './pages/reports/ReportListPage';
import ReportDetailPage from './pages/reports/ReportDetailPage';
import AlertCenterPage from './pages/alerts/AlertCenterPage';

// Clinical Profiles & Queues
import PatientProfilePage from './pages/profile/PatientProfilePage';
import UserProfilePage from './pages/profile/UserProfilePage';
import PatientListPage from './pages/clinical/PatientListPage';
import PatientClinicalDetailPage from './pages/clinical/PatientClinicalDetailPage';
import ReviewListPage from './pages/clinical/ReviewListPage';
import PharmacistReviewPage from './pages/clinical/PharmacistReviewPage';

// Admin Suite
import AdminUserManagementPage from './pages/admin/AdminUserManagementPage';
import AdminDrugManagementPage from './pages/admin/AdminDrugManagementPage';
import AdminRuleManagementPage from './pages/admin/AdminRuleManagementPage';
import AdminEvidencePage from './pages/admin/AdminEvidencePage';
import AdminAuditLogPage from './pages/admin/AdminAuditLogPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Not Found
import NotFoundPage from './pages/notfound/NotFoundPage';

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function RouteLoadingFallback() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-4">
      <LoadingSkeleton variant="card" count={3} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login/patient" element={<PatientLoginPage />} />
              <Route path="/login/doctor" element={<DoctorLoginPage />} />
              <Route path="/login/pharmacist" element={<PharmacistLoginPage />} />
              <Route path="/login/admin" element={<AdminLoginPage />} />
              <Route path="/portal/patient/login" element={<PatientLoginPage />} />
              <Route path="/portal/doctor/login" element={<DoctorLoginPage />} />
              <Route path="/portal/pharmacist/login" element={<PharmacistLoginPage />} />
              <Route path="/portal/admin/login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Authenticated Global AppShell Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                {/* Default root router */}
                <Route path="/" element={<DashboardRouter />} />
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/portal" element={<DashboardRouter />} />

                {/* ==================================================== */}
                {/* CANONICAL PORTAL 1: PATIENT PORTAL (/portal/patient) */}
                {/* ==================================================== */}
                <Route
                  path="/portal/patient"
                  element={<Navigate to="/portal/patient/dashboard" replace />}
                />
                <Route
                  path="/portal/patient/dashboard"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <PatientDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/patient/medications"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <PatientMedicationsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/patient/safety"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <InteractionCheckerPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/patient/prescriptions"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <PrescriptionUploadPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/patient/search"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <DrugSearchPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/patient/reports"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <ReportListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/patient/alerts"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <AlertCenterPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/patient/profile"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <PatientProfilePage />
                    </RoleGuard>
                  }
                />

                {/* ==================================================== */}
                {/* CANONICAL PORTAL 2: CLINICIAN PORTAL (/portal/doctor)*/}
                {/* ==================================================== */}
                <Route
                  path="/portal/doctor"
                  element={<Navigate to="/portal/doctor/dashboard" replace />}
                />
                <Route
                  path="/portal/doctor/dashboard"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <DoctorDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/patients"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <PatientListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/patients/:id"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <PatientClinicalDetailPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/search"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <DrugSearchPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/interactions"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <InteractionCheckerPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/reconciliation"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <MedicationReconciliationPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/prescriptions"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <PrescriptionUploadPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/reviews"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <ReviewListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/reviews/:id"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <ReviewListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/reports"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <ReportListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/reports/:id"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <ReportDetailPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/alerts"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <AlertCenterPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/analytics"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <AdminAnalyticsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/doctor/profile"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <UserProfilePage />
                    </RoleGuard>
                  }
                />

                {/* ==================================================== */}
                {/* CANONICAL PORTAL 3: PHARMACY PORTAL (/portal/pharmacist) */}
                {/* ==================================================== */}
                <Route
                  path="/portal/pharmacist"
                  element={<Navigate to="/portal/pharmacist/dashboard" replace />}
                />
                <Route
                  path="/portal/pharmacist/dashboard"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <PharmacistDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/pharmacist/prescriptions"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <ReviewListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/pharmacist/dispensing"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <DispensingReviewPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/pharmacist/medications"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <MedicationListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/pharmacist/reconciliation"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <MedicationReconciliationPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/pharmacist/search"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <DrugSearchPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/pharmacist/interactions"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <InteractionCheckerPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/pharmacist/alerts"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <AlertCenterPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/pharmacist/reports"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <ReportListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/pharmacist/reports/:id"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <ReportDetailPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/pharmacist/profile"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <UserProfilePage />
                    </RoleGuard>
                  }
                />

                {/* ==================================================== */}
                {/* CANONICAL PORTAL 4: ADMIN PORTAL (/portal/admin)     */}
                {/* ==================================================== */}
                <Route
                  path="/portal/admin"
                  element={<Navigate to="/portal/admin/dashboard" replace />}
                />
                <Route
                  path="/portal/admin/dashboard"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/admin/users"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminUserManagementPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/admin/patients"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <PatientListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/admin/drugs"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminDrugManagementPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/admin/rules"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminRuleManagementPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/admin/evidence"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminEvidencePage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/admin/audit"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminAuditLogPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/admin/alerts"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AlertCenterPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/admin/analytics"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminAnalyticsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/portal/admin/settings"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminSettingsPage />
                    </RoleGuard>
                  }
                />

                {/* ---------------------------------------------------- */}
                {/* LEGACY / COMPATIBILITY ALIASES                       */}
                {/* ---------------------------------------------------- */}
                <Route
                  path="/patient/dashboard"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <PatientDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/patient/medications"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <PatientMedicationsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/patient/safety"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <InteractionCheckerPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/patient/prescriptions"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <PrescriptionUploadPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/patient/search"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <DrugSearchPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/patient/reports"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <ReportListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/patient/alerts"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <AlertCenterPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/patient/profile"
                  element={
                    <RoleGuard allowedRoles={['PATIENT', 'ADMIN']}>
                      <PatientProfilePage />
                    </RoleGuard>
                  }
                />

                <Route
                  path="/doctor/dashboard"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <DoctorDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/doctor/patients"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <PatientListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/doctor/patients/:id"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <PatientClinicalDetailPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/doctor/search"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <DrugSearchPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/doctor/interactions"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <InteractionCheckerPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/doctor/reconciliation"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <MedicationReconciliationPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/doctor/prescriptions"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <PrescriptionUploadPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/doctor/reports"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <ReportListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/doctor/alerts"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <AlertCenterPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/doctor/analytics"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <AdminAnalyticsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/doctor/profile"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <UserProfilePage />
                    </RoleGuard>
                  }
                />

                <Route
                  path="/pharmacist/dashboard"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <PharmacistDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/pharmacist/prescriptions"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <ReviewListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/pharmacist/dispensing"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <DispensingReviewPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/pharmacist/medications"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <MedicationListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/pharmacist/search"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <DrugSearchPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/pharmacist/interactions"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <InteractionCheckerPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/pharmacist/alerts"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <AlertCenterPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/pharmacist/reports"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <ReportListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/pharmacist/profile"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <UserProfilePage />
                    </RoleGuard>
                  }
                />

                <Route
                  path="/admin/dashboard"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminUserManagementPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/patients"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <PatientListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/drugs"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminDrugManagementPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/rules"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminRuleManagementPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/evidence"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminEvidencePage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/audit"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminAuditLogPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/alerts"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AlertCenterPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminAnalyticsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminSettingsPage />
                    </RoleGuard>
                  }
                />

                {/* ---------------------------------------------------- */}
                {/* SHARED / LEGACY BACKWARD COMPATIBLE PATHS            */}
                {/* ---------------------------------------------------- */}
                <Route path="/profile" element={<PatientProfilePage />} />
                <Route path="/account-settings" element={<UserProfilePage />} />
                <Route path="/drugs" element={<DrugSearchPage />} />
                <Route path="/drugs/:id" element={<DrugDetailPage />} />
                <Route path="/interactions" element={<InteractionCheckerPage />} />
                <Route path="/medications" element={<MedicationListPage />} />
                <Route path="/medications/reconciliation" element={<MedicationReconciliationPage />} />
                <Route path="/prescriptions" element={<PrescriptionUploadPage />} />
                <Route path="/prescriptions/ocr-review" element={<OcrReviewPage />} />
                <Route path="/safety" element={<SafetyCheckPage />} />
                <Route path="/safety/:id" element={<SafetyReportDetailPage />} />
                <Route path="/alerts" element={<AlertCenterPage />} />
                <Route path="/reports" element={<ReportListPage />} />
                <Route path="/reports/:id" element={<ReportDetailPage />} />
                <Route
                  path="/patients"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <PatientListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/patients/:id"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
                      <PatientClinicalDetailPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/reviews"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'PHARMACIST', 'ADMIN']}>
                      <ReviewListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/reviews/:id"
                  element={
                    <RoleGuard allowedRoles={['DOCTOR', 'PHARMACIST', 'ADMIN']}>
                      <ReviewListPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/medication-review"
                  element={
                    <RoleGuard allowedRoles={['PHARMACIST', 'ADMIN']}>
                      <DispensingReviewPage />
                    </RoleGuard>
                  }
                />
              </Route>

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
