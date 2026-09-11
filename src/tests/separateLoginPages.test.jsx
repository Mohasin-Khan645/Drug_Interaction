import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as AuthModule from '../context/AuthContext';
import * as NotificationModule from '../context/NotificationContext';
import PatientLoginPage from '../pages/auth/PatientLoginPage';
import DoctorLoginPage from '../pages/auth/DoctorLoginPage';
import PharmacistLoginPage from '../pages/auth/PharmacistLoginPage';
import AdminLoginPage from '../pages/auth/AdminLoginPage';
import LoginPage from '../pages/auth/LoginPage';
import { UserRole } from '../constants/roles';

describe('Phase 6: Dedicated 4-Role Portal Login Pages', () => {
  const mockLogin = vi.fn();
  const mockVerifyMfa = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      login: mockLogin,
      verifyMfa: mockVerifyMfa,
      isAuthenticated: false,
      currentUser: null,
      role: 'PATIENT',
    });
    vi.spyOn(NotificationModule, 'useNotifications').mockReturnValue({
      addToast: mockAddToast,
    });
  });

  describe('PatientLoginPage (/login/patient)', () => {
    it('renders dedicated Patient Health Portal branding, HIPAA privacy notice, and registration link', () => {
      render(
        <MemoryRouter>
          <PatientLoginPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: /Patient Health Portal/i })).toBeInTheDocument();
      expect(screen.getByText(/Personal Health Record/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In to Patient Health Portal/i })).toBeInTheDocument();
      expect(screen.getByText(/Protected under HIPAA Security Standards/i)).toBeInTheDocument();
      expect(screen.getByText(/Don't have a personal health account/i)).toBeInTheDocument();
    });
  });

  describe('DoctorLoginPage (/login/doctor)', () => {
    it('renders Clinician Safety Portal branding and NPI/DEA credential notice', () => {
      render(
        <MemoryRouter>
          <DoctorLoginPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: /Clinician Safety Portal/i })).toBeInTheDocument();
      expect(screen.getByText(/Licensed Clinician Access/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In to Clinician Safety Portal/i })).toBeInTheDocument();
      expect(screen.getByText(/Authorized for verified medical practitioners \(MD, DO, NP, PA\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Need institutional clinician onboarding/i)).toBeInTheDocument();
    });
  });

  describe('PharmacistLoginPage (/login/pharmacist)', () => {
    it('renders Pharmacy Dispensing Portal branding and pharmacy board notice', () => {
      render(
        <MemoryRouter>
          <PharmacistLoginPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: /Pharmacy Dispensing Portal/i })).toBeInTheDocument();
      expect(screen.getByText(/Registered Pharmacist Access/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In to Pharmacy Dispensing Portal/i })).toBeInTheDocument();
      expect(screen.getByText(/Restricted to licensed pharmacists \(RPh, PharmD\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Register new pharmacy staff credentials/i)).toBeInTheDocument();
    });
  });

  describe('AdminLoginPage (/login/admin)', () => {
    it('renders Clinical Governance Portal branding and high-security warning with no public registration', () => {
      render(
        <MemoryRouter>
          <AdminLoginPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: /Clinical Governance Portal/i })).toBeInTheDocument();
      expect(screen.getByText(/Administrative Security Clearance/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In to Clinical Governance Portal/i })).toBeInTheDocument();
      expect(screen.getByText(/High-security administrative domain\. Multi-Factor Authentication is strictly enforced/i)).toBeInTheDocument();
      expect(screen.queryByText(/Register here/i)).not.toBeInTheDocument();
    });
  });

  describe('LoginPage Portal Gateway (/login)', () => {
    it('displays portal directory cards for all 4 roles and unified entrypoint', () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      expect(screen.getByText('Enterprise 4-Role Healthcare Portal')).toBeInTheDocument();
      expect(screen.getByText('Patient')).toBeInTheDocument();
      expect(screen.getByText('Clinician')).toBeInTheDocument();
      expect(screen.getByText('Pharmacist')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In to DrugSafe/i })).toBeInTheDocument();
    });

    it('prohibits role switching buttons on login form and strictly requires credentials entry', () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      // Verify test accounts preset buttons are removed from login page
      expect(screen.queryByText(/Role Assigned by Database/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Clinician Account/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Patient Account/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In to DrugSafe/i })).toBeInTheDocument();
    });
  });
});

