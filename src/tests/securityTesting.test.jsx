import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as AuthModule from '../context/AuthContext';
import * as NotificationModule from '../context/NotificationContext';
import RoleGuard from '../components/layout/RoleGuard';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import TopNavbar from '../components/layout/TopNavbar';
import Sidebar from '../components/layout/Sidebar';
import { UserRole } from '../constants/roles';

// Mock AIAssistant
vi.mock('../components/clinical/AIAssistant', () => ({
  default: () => <div data-testid="mock-ai">AI</div>,
}));

describe('Phase 11: Frontend Security Testing & Route Boundary Protection', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.spyOn(NotificationModule, 'useNotifications').mockReturnValue({
      unreadCount: 0,
      toggleNotificationPanel: vi.fn(),
    });
  });

  describe('1. Unauthenticated Route Intrusion Prevention', () => {
    it('redirects unauthenticated visitor attempting to access doctor portal to /login', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        isAuthenticated: false,
        role: null,
        currentUser: null,
      });

      render(
        <MemoryRouter initialEntries={['/portal/doctor/dashboard']}>
          <Routes>
            <Route
              path="/portal/doctor/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.DOCTOR, UserRole.ADMIN]}>
                  <div>Confidential Doctor Area</div>
                </RoleGuard>
              }
            />
            <Route path="/login" element={<div>Login Page Screen</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page Screen')).toBeInTheDocument();
      expect(screen.queryByText('Confidential Doctor Area')).not.toBeInTheDocument();
    });

    it('redirects unauthenticated visitor attempting to access admin portal to /login', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        isAuthenticated: false,
        role: null,
        currentUser: null,
      });

      render(
        <MemoryRouter initialEntries={['/portal/admin/dashboard']}>
          <Routes>
            <Route
              path="/portal/admin/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <div>Confidential Admin Area</div>
                </RoleGuard>
              }
            />
            <Route path="/login" element={<div>Login Page Screen</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page Screen')).toBeInTheDocument();
      expect(screen.queryByText('Confidential Admin Area')).not.toBeInTheDocument();
    });
  });

  describe('2. Cross-Portal Role Penetration & Privilege Boundaries', () => {
    it('blocks PATIENT role from loading ADMIN governance view and renders restriction alert', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        role: UserRole.PATIENT,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT },
      });

      render(
        <MemoryRouter initialEntries={['/portal/admin/users']}>
          <RoleGuard allowedRoles={[UserRole.ADMIN]}>
            <div data-testid="admin-sensitive-data">Sensitive User Roster & RBAC</div>
          </RoleGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('Clinical Access Restricted')).toBeInTheDocument();
      expect(screen.getByText(/This module requires authorization designated for/i)).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-sensitive-data')).not.toBeInTheDocument();
    });

    it('blocks PATIENT role from loading DOCTOR clinical charts and decision queues', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        role: UserRole.PATIENT,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT },
      });

      render(
        <MemoryRouter initialEntries={['/portal/doctor/patients']}>
          <RoleGuard allowedRoles={[UserRole.DOCTOR, UserRole.ADMIN]}>
            <div data-testid="doctor-sensitive-data">Patient Clinical Charts</div>
          </RoleGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('Clinical Access Restricted')).toBeInTheDocument();
      expect(screen.queryByTestId('doctor-sensitive-data')).not.toBeInTheDocument();
    });

    it('blocks DOCTOR role from loading ADMIN system settings view', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        role: UserRole.DOCTOR,
        currentUser: { name: 'Dr. Marcus Chen', role: UserRole.DOCTOR },
      });

      render(
        <MemoryRouter initialEntries={['/portal/admin/settings']}>
          <RoleGuard allowedRoles={[UserRole.ADMIN]}>
            <div data-testid="admin-settings-data">Platform Security Settings</div>
          </RoleGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('Clinical Access Restricted')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-settings-data')).not.toBeInTheDocument();
    });

    it('blocks PHARMACIST role from accessing ADMIN audit logs', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        role: UserRole.PHARMACIST,
        currentUser: { name: 'Elena Rostova', role: UserRole.PHARMACIST },
      });

      render(
        <MemoryRouter initialEntries={['/portal/admin/audit']}>
          <RoleGuard allowedRoles={[UserRole.ADMIN]}>
            <div data-testid="admin-audit-data">Immutable Audit Stream</div>
          </RoleGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('Clinical Access Restricted')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-audit-data')).not.toBeInTheDocument();
    });
  });

  describe('3. Strict Elimination of UI Role Switching', () => {
    it('confirms TopNavbar does not contain any role switching interactive controls', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        role: UserRole.PATIENT,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT },
        logout: vi.fn(),
      });

      render(
        <MemoryRouter>
          <TopNavbar onOpenMobileMenu={vi.fn()} />
        </MemoryRouter>
      );

      // Verify portal scope badge is read-only (not a button, not interactive dropdown)
      const badge = screen.getByText('Patient Portal');
      expect(badge.closest('button')).toBeNull();

      // Ensure no switch controls exist
      expect(screen.queryByText(/Switch Role/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Select Experience Perspective/i)).not.toBeInTheDocument();
      expect(screen.queryByTitle(/switch/i)).not.toBeInTheDocument();
    });

    it('confirms Sidebar navigation is strictly role-scoped with no cross-role leaking', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        role: UserRole.PATIENT,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT },
      });

      render(
        <MemoryRouter>
          <Sidebar isCollapsed={false} />
        </MemoryRouter>
      );

      // Patient must have patient links
      expect(screen.getByRole('link', { name: /My Health Dashboard/i })).toBeInTheDocument();

      // Ensure zero admin or clinician links leaked to patient sidebar
      expect(screen.queryByRole('link', { name: /User Directory & RBAC/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Safety Rules Engine/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Assigned Patients/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Dispensing Review Queue/i })).not.toBeInTheDocument();
    });
  });

  describe('4. Client-Side XSS and Dangerous Input Escaping', () => {
    it('safely escapes malicious script tags in patient name or input content', () => {
      const maliciousName = '<script>window.pwned=true;</script>Sarah';
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        role: UserRole.PATIENT,
        currentUser: { name: maliciousName, role: UserRole.PATIENT },
      });

      render(
        <MemoryRouter>
          <TopNavbar onOpenMobileMenu={vi.fn()} />
        </MemoryRouter>
      );

      // Verify malicious string is rendered safely as escaped text
      expect(screen.getByText(maliciousName)).toBeInTheDocument();
      // Ensure global window was not exploited
      expect(window.pwned).toBeUndefined();
    });
  });
});

