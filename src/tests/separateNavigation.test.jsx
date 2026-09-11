import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as AuthModule from '../context/AuthContext';
import * as NotificationModule from '../context/NotificationContext';
import Sidebar from '../components/layout/Sidebar';
import TopNavbar from '../components/layout/TopNavbar';
import { UserRole } from '../constants/roles';

describe('Phase 7: Separate Navigation & Authoritative UI Portals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(NotificationModule, 'useNotifications').mockReturnValue({
      unreadCount: 2,
      toggleNotificationPanel: vi.fn(),
    });
  });

  describe('Sidebar Role Navigation Isolation', () => {
    it('renders dedicated Patient navigation suite with no clinician routes', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PATIENT,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT },
      });

      render(
        <MemoryRouter>
          <Sidebar isCollapsed={false} />
        </MemoryRouter>
      );

      expect(screen.getByText('Patient Medication Safety Portal')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /My Health Dashboard/i })).toHaveAttribute('href', '/portal/patient/dashboard');
      expect(screen.getByRole('link', { name: /My Medications/i })).toHaveAttribute('href', '/portal/patient/medications');
      expect(screen.getByRole('link', { name: /Safety & Interactions/i })).toHaveAttribute('href', '/portal/patient/safety');
      expect(screen.getByRole('link', { name: /Upload Prescription/i })).toHaveAttribute('href', '/portal/patient/prescriptions');

      // Ensure no clinician or admin links exist in Patient sidebar
      expect(screen.queryByText(/Assigned Patients/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/User Directory & RBAC/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Dispensing Review Queue/i)).not.toBeInTheDocument();
    });

    it('renders dedicated Clinician navigation suite with patient charts and review queues', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.DOCTOR,
        currentUser: { name: 'Dr. Marcus Chen', role: UserRole.DOCTOR },
      });

      render(
        <MemoryRouter>
          <Sidebar isCollapsed={false} />
        </MemoryRouter>
      );

      expect(screen.getByText('Clinician Safety Decision Portal')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Clinical Dashboard/i })).toHaveAttribute('href', '/portal/doctor/dashboard');
      expect(screen.getByRole('link', { name: /Assigned Patients/i })).toHaveAttribute('href', '/portal/doctor/patients');
      expect(screen.getByRole('link', { name: /Clinical Review Queue/i })).toHaveAttribute('href', '/portal/doctor/reviews');
      expect(screen.getByRole('link', { name: /Multi-Drug Checker/i })).toHaveAttribute('href', '/portal/doctor/interactions');

      // Ensure no patient personal links exist
      expect(screen.queryByText(/My Health Dashboard/i)).not.toBeInTheDocument();
    });

    it('renders dedicated Pharmacy navigation suite with dispensing verification queue', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PHARMACIST,
        currentUser: { name: 'Elena Rostova', role: UserRole.PHARMACIST },
      });

      render(
        <MemoryRouter>
          <Sidebar isCollapsed={false} />
        </MemoryRouter>
      );

      expect(screen.getByText('Pharmacy Dispensing & Verification Portal')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Pharmacy Dashboard/i })).toHaveAttribute('href', '/portal/pharmacist/dashboard');
      expect(screen.getByRole('link', { name: /Dispensing Review Queue/i })).toHaveAttribute('href', '/portal/pharmacist/dispensing');
      expect(screen.getByRole('link', { name: /Prescription OCR Intake/i })).toHaveAttribute('href', '/portal/pharmacist/prescriptions');
    });

    it('renders dedicated Admin navigation suite with audit trail and rule engine', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.ADMIN,
        currentUser: { name: 'David Vance', role: UserRole.ADMIN },
      });

      render(
        <MemoryRouter>
          <Sidebar isCollapsed={false} />
        </MemoryRouter>
      );

      expect(screen.getByText('Clinical Governance & Administration Portal')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /System Overview/i })).toHaveAttribute('href', '/portal/admin/dashboard');
      expect(screen.getByRole('link', { name: /User Directory & RBAC/i })).toHaveAttribute('href', '/portal/admin/users');
      expect(screen.getByRole('link', { name: /Safety Rules Engine/i })).toHaveAttribute('href', '/portal/admin/rules');
      expect(screen.getByRole('link', { name: /Audit Trail/i })).toHaveAttribute('href', '/portal/admin/audit');
    });
  });

  describe('TopNavbar Portal Scope & Elimination of Role Switcher', () => {
    it('displays authoritative Clinician Workspace badge and removes UI role switcher for DOCTOR', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.DOCTOR,
        currentUser: { name: 'Dr. Marcus Chen', email: 'marcus.chen@hospital.org', role: UserRole.DOCTOR },
        logout: vi.fn(),
      });

      render(
        <MemoryRouter>
          <TopNavbar onOpenMobileMenu={vi.fn()} />
        </MemoryRouter>
      );

      expect(screen.getByText('Clinician Workspace')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search patient charts, drug interactions/i)).toBeInTheDocument();

      // Verify no switch role button exists
      expect(screen.queryByText(/Switch Role Context/i)).not.toBeInTheDocument();
      expect(screen.queryByTitle(/Switch demo role/i)).not.toBeInTheDocument();
    });

    it('displays authoritative Patient Portal badge and tailored search placeholder for PATIENT', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PATIENT,
        currentUser: { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', role: UserRole.PATIENT },
        logout: vi.fn(),
      });

      render(
        <MemoryRouter>
          <TopNavbar onOpenMobileMenu={vi.fn()} />
        </MemoryRouter>
      );

      expect(screen.getByText('Patient Portal')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search medications, interactions, or safety guides/i)).toBeInTheDocument();
      expect(screen.queryByText(/Switch Role Context/i)).not.toBeInTheDocument();
    });
  });
});

