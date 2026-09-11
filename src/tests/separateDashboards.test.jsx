import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as AuthModule from '../context/AuthContext';
import PatientDashboard from '../pages/dashboard/PatientDashboard';
import DoctorDashboard from '../pages/dashboard/DoctorDashboard';
import PharmacistDashboard from '../pages/dashboard/PharmacistDashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import { UserRole } from '../constants/roles';

describe('Phase 8: Separate Role-Specialized Dashboards', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    });
  });

  const renderWithProviders = (ui) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe('Patient Experience (PatientDashboard)', () => {
    it('renders personal health schedule, food safety warnings, and care team connect', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PATIENT,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT },
      });

      renderWithProviders(<PatientDashboard />);

      expect(screen.getByText(/Personal Health Record · Continuous Medication Monitoring/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Welcome back, Sarah/i })).toBeInTheDocument();
      expect(screen.getByText(/Today's Medication Schedule/i)).toBeInTheDocument();
      expect(screen.getByText(/Food & Safety Precautions/i)).toBeInTheDocument();
      expect(screen.getByText(/Vitamin K Consistency \(Warfarin\)/i)).toBeInTheDocument();
      expect(screen.getByText(/My Care Team/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Scan Prescription/i })).toHaveAttribute('href', '/portal/patient/prescriptions');
    });
  });

  describe('Clinician Workspace (DoctorDashboard)', () => {
    it('renders patient panel triage, interaction review queue, and clinical decision shortcuts', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.DOCTOR,
        currentUser: { name: 'Dr. Marcus Chen', role: UserRole.DOCTOR },
      });

      renderWithProviders(<DoctorDashboard />);

      expect(screen.getByText(/Clinician Decision Support Workspace · Active Prescribing Panel/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Dr\. Marcus Chen, MD/i })).toBeInTheDocument();
      expect(screen.getByText(/Patient Triage & Clinical Panel/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Sarah Jenkins/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Pending Overrides/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Multi-Drug Checker/i })).toHaveAttribute('href', '/portal/doctor/interactions');
    });
  });

  describe('Pharmacy Workspace (PharmacistDashboard)', () => {
    it('renders inbound dispensing queue and OCR document verification pipeline', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PHARMACIST,
        currentUser: { name: 'Elena Rostova', role: UserRole.PHARMACIST },
      });

      renderWithProviders(<PharmacistDashboard />);

      expect(screen.getByText(/Pharmacy Dispensing & Verification Hub/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Elena Rostova, PharmD/i })).toBeInTheDocument();
      expect(screen.getByText(/Inbound Prescription Dispensing Queue/i)).toBeInTheDocument();
      expect(screen.getByText(/OCR Intake Pipeline/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Dispense Queue/i })).toHaveAttribute('href', '/portal/pharmacist/dispensing');
    });
  });

  describe('Admin Governance Center (AdminDashboard)', () => {
    it('renders platform command center, telemetry graphs, and live security audit stream', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.ADMIN,
        currentUser: { name: 'David Vance', role: UserRole.ADMIN },
      });

      renderWithProviders(<AdminDashboard />);

      expect(screen.getByText(/Clinical Safety Governance & Platform Operations/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Platform Command Center/i })).toBeInTheDocument();
      expect(screen.getByText(/Clinical Safety Screening Volume/i)).toBeInTheDocument();
      expect(screen.getByText(/Security & Audit Trail/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Safety Rules Engine/i })).toHaveAttribute('href', '/portal/admin/rules');
    });
  });
});

