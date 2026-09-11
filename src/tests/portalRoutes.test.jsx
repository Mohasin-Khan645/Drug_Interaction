import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as AuthModule from '../context/AuthContext';
import RoleGuard from '../components/layout/RoleGuard';
import DashboardRouter from '../pages/dashboard/DashboardRouter';
import {
  UserRole,
  ROLE_PORTALS,
  ROLE_PORTAL_DASHBOARDS,
  getPortalDashboardPath,
  isValidRole,
} from '../constants/roles';

describe('Phase 5: Separate Portal Routes & Route-Level Isolation', () => {
  describe('Portal Constants & Routing Matrix', () => {
    it('defines canonical portal prefixes for all 4 healthcare roles', () => {
      expect(ROLE_PORTALS[UserRole.PATIENT]).toBe('/portal/patient');
      expect(ROLE_PORTALS[UserRole.DOCTOR]).toBe('/portal/doctor');
      expect(ROLE_PORTALS[UserRole.PHARMACIST]).toBe('/portal/pharmacist');
      expect(ROLE_PORTALS[UserRole.ADMIN]).toBe('/portal/admin');
    });

    it('resolves authoritative portal dashboard URLs correctly', () => {
      expect(getPortalDashboardPath(UserRole.PATIENT)).toBe('/portal/patient/dashboard');
      expect(getPortalDashboardPath(UserRole.DOCTOR)).toBe('/portal/doctor/dashboard');
      expect(getPortalDashboardPath(UserRole.PHARMACIST)).toBe('/portal/pharmacist/dashboard');
      expect(getPortalDashboardPath(UserRole.ADMIN)).toBe('/portal/admin/dashboard');
      expect(getPortalDashboardPath('UNKNOWN')).toBe('/portal/patient/dashboard');
    });

    it('validates canonical roles strictly', () => {
      expect(isValidRole('PATIENT')).toBe(true);
      expect(isValidRole('DOCTOR')).toBe(true);
      expect(isValidRole('PHARMACIST')).toBe(true);
      expect(isValidRole('ADMIN')).toBe(true);
      expect(isValidRole('SUPERUSER')).toBe(false);
      expect(isValidRole(null)).toBe(false);
    });
  });

  describe('Patient Portal (/portal/patient/*) Route Isolation', () => {
    it('allows PATIENT to access /portal/patient/dashboard', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PATIENT,
        isAuthenticated: true,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT },
      });

      render(
        <MemoryRouter initialEntries={['/portal/patient/dashboard']}>
          <Routes>
            <Route
              path="/portal/patient/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.PATIENT, UserRole.ADMIN]}>
                  <div>Patient Health Workspace</div>
                </RoleGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Patient Health Workspace')).toBeInTheDocument();
      expect(screen.queryByText('Clinical Access Restricted')).not.toBeInTheDocument();
    });

    it('strictly denies DOCTOR from navigating into Patient Portal /portal/patient/dashboard', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.DOCTOR,
        isAuthenticated: true,
        currentUser: { name: 'Dr. Marcus Chen', role: UserRole.DOCTOR },
      });

      render(
        <MemoryRouter initialEntries={['/portal/patient/dashboard']}>
          <Routes>
            <Route
              path="/portal/patient/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.PATIENT, UserRole.ADMIN]}>
                  <div>Patient Health Workspace</div>
                </RoleGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Clinical Access Restricted')).toBeInTheDocument();
      expect(screen.queryByText('Patient Health Workspace')).not.toBeInTheDocument();
    });
  });

  describe('Doctor Portal (/portal/doctor/*) Route Isolation', () => {
    it('allows DOCTOR to access /portal/doctor/dashboard', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.DOCTOR,
        isAuthenticated: true,
        currentUser: { name: 'Dr. Marcus Chen', role: UserRole.DOCTOR },
      });

      render(
        <MemoryRouter initialEntries={['/portal/doctor/dashboard']}>
          <Routes>
            <Route
              path="/portal/doctor/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.DOCTOR, UserRole.ADMIN]}>
                  <div>Clinician Decision Workspace</div>
                </RoleGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Clinician Decision Workspace')).toBeInTheDocument();
      expect(screen.queryByText('Clinical Access Restricted')).not.toBeInTheDocument();
    });

    it('strictly denies PATIENT from navigating into Doctor Portal /portal/doctor/dashboard', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PATIENT,
        isAuthenticated: true,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT },
      });

      render(
        <MemoryRouter initialEntries={['/portal/doctor/dashboard']}>
          <Routes>
            <Route
              path="/portal/doctor/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.DOCTOR, UserRole.ADMIN]}>
                  <div>Clinician Decision Workspace</div>
                </RoleGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Clinical Access Restricted')).toBeInTheDocument();
      expect(screen.queryByText('Clinician Decision Workspace')).not.toBeInTheDocument();
    });

    it('strictly denies PHARMACIST from navigating into Doctor Portal routes', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PHARMACIST,
        isAuthenticated: true,
        currentUser: { name: 'Elena Rostova', role: UserRole.PHARMACIST },
      });

      render(
        <MemoryRouter initialEntries={['/portal/doctor/dashboard']}>
          <Routes>
            <Route
              path="/portal/doctor/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.DOCTOR, UserRole.ADMIN]}>
                  <div>Clinician Decision Workspace</div>
                </RoleGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Clinical Access Restricted')).toBeInTheDocument();
      expect(screen.queryByText('Clinician Decision Workspace')).not.toBeInTheDocument();
    });
  });

  describe('Pharmacist Portal (/portal/pharmacist/*) Route Isolation', () => {
    it('allows PHARMACIST to access /portal/pharmacist/dashboard', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PHARMACIST,
        isAuthenticated: true,
        currentUser: { name: 'Elena Rostova', role: UserRole.PHARMACIST },
      });

      render(
        <MemoryRouter initialEntries={['/portal/pharmacist/dashboard']}>
          <Routes>
            <Route
              path="/portal/pharmacist/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.PHARMACIST, UserRole.ADMIN]}>
                  <div>Pharmacy Dispensing Hub</div>
                </RoleGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Pharmacy Dispensing Hub')).toBeInTheDocument();
      expect(screen.queryByText('Clinical Access Restricted')).not.toBeInTheDocument();
    });

    it('strictly denies DOCTOR from navigating into Pharmacy Dispensing Portal', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.DOCTOR,
        isAuthenticated: true,
        currentUser: { name: 'Dr. Marcus Chen', role: UserRole.DOCTOR },
      });

      render(
        <MemoryRouter initialEntries={['/portal/pharmacist/dashboard']}>
          <Routes>
            <Route
              path="/portal/pharmacist/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.PHARMACIST, UserRole.ADMIN]}>
                  <div>Pharmacy Dispensing Hub</div>
                </RoleGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Clinical Access Restricted')).toBeInTheDocument();
      expect(screen.queryByText('Pharmacy Dispensing Hub')).not.toBeInTheDocument();
    });
  });

  describe('Admin Portal (/portal/admin/*) Route Isolation', () => {
    it('allows ADMIN to access /portal/admin/dashboard', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.ADMIN,
        isAuthenticated: true,
        currentUser: { name: 'David Vance', role: UserRole.ADMIN },
      });

      render(
        <MemoryRouter initialEntries={['/portal/admin/dashboard']}>
          <Routes>
            <Route
              path="/portal/admin/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <div>System Administration Control Center</div>
                </RoleGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('System Administration Control Center')).toBeInTheDocument();
      expect(screen.queryByText('Clinical Access Restricted')).not.toBeInTheDocument();
    });

    it('strictly denies DOCTOR from navigating into Admin Portal', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.DOCTOR,
        isAuthenticated: true,
        currentUser: { name: 'Dr. Marcus Chen', role: UserRole.DOCTOR },
      });

      render(
        <MemoryRouter initialEntries={['/portal/admin/dashboard']}>
          <Routes>
            <Route
              path="/portal/admin/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <div>System Administration Control Center</div>
                </RoleGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Clinical Access Restricted')).toBeInTheDocument();
      expect(screen.queryByText('System Administration Control Center')).not.toBeInTheDocument();
    });
  });

  describe('DashboardRouter Authoritative Redirects', () => {
    it('redirects DOCTOR to /portal/doctor/dashboard', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.DOCTOR,
        isAuthenticated: true,
        currentUser: { name: 'Dr. Marcus Chen', role: UserRole.DOCTOR },
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/portal/doctor/dashboard" element={<div>Target Doctor Portal</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Target Doctor Portal')).toBeInTheDocument();
    });

    it('redirects PHARMACIST to /portal/pharmacist/dashboard', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PHARMACIST,
        isAuthenticated: true,
        currentUser: { name: 'Elena Rostova', role: UserRole.PHARMACIST },
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/portal/pharmacist/dashboard" element={<div>Target Pharmacy Portal</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Target Pharmacy Portal')).toBeInTheDocument();
    });

    it('redirects PATIENT to /portal/patient/dashboard', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PATIENT,
        isAuthenticated: true,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT },
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/portal/patient/dashboard" element={<div>Target Patient Portal</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Target Patient Portal')).toBeInTheDocument();
    });
  });
});

