import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as AuthModule from '../context/AuthContext';
import * as NotificationModule from '../context/NotificationContext';
import TopNavbar from '../components/layout/TopNavbar';
import Sidebar from '../components/layout/Sidebar';
import RoleGuard from '../components/layout/RoleGuard';
import AppShell from '../components/layout/AppShell';
import { UserRole } from '../constants/roles';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AIAssistant to avoid deep AI provider timeouts in headless testing
vi.mock('../components/clinical/AIAssistant', () => ({
  default: () => <div data-testid="mock-ai-assistant">MediSafe AI</div>,
}));

// Mock NotificationPanel
vi.mock('../components/layout/NotificationPanel', () => ({
  default: () => <div data-testid="mock-notification-panel">Safety Notifications Drawer</div>,
}));

describe('Phase 10: Final UI Polish & Consistency', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  describe('TopNavbar Canonical Navigation & Role Polish', () => {
    it('submits search directly to role-specific canonical route for DOCTOR', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.DOCTOR,
        currentUser: { name: 'Dr. Marcus Chen', role: UserRole.DOCTOR, email: 'chen@hospital.org' },
        logout: vi.fn(),
      });

      vi.spyOn(NotificationModule, 'useNotifications').mockReturnValue({
        unreadCount: 3,
        toggleNotificationPanel: vi.fn(),
      });

      render(
        <MemoryRouter>
          <TopNavbar onOpenMobileMenu={vi.fn()} />
        </MemoryRouter>
      );

      const searchInput = screen.getByPlaceholderText(/Search patient charts/i);
      fireEvent.change(searchInput, { target: { value: 'Warfarin' } });
      fireEvent.submit(searchInput.closest('form'));

      expect(mockNavigate).toHaveBeenCalledWith('/portal/doctor/search?search=Warfarin');
    });

    it('submits search directly to role-specific canonical route for PATIENT', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PATIENT,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT, email: 'sarah@example.com' },
        logout: vi.fn(),
      });

      vi.spyOn(NotificationModule, 'useNotifications').mockReturnValue({
        unreadCount: 1,
        toggleNotificationPanel: vi.fn(),
      });

      render(
        <MemoryRouter>
          <TopNavbar onOpenMobileMenu={vi.fn()} />
        </MemoryRouter>
      );

      const searchInput = screen.getByPlaceholderText(/Search medications/i);
      fireEvent.change(searchInput, { target: { value: 'Lisinopril' } });
      fireEvent.submit(searchInput.closest('form'));

      expect(mockNavigate).toHaveBeenCalledWith('/portal/patient/search?search=Lisinopril');
    });

    it('points profile link to canonical portal profile and applies role avatar colors', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PHARMACIST,
        currentUser: { name: 'Elena Rostova', role: UserRole.PHARMACIST, email: 'elena@pharmacy.org' },
        logout: vi.fn(),
      });

      vi.spyOn(NotificationModule, 'useNotifications').mockReturnValue({
        unreadCount: 0,
        toggleNotificationPanel: vi.fn(),
      });

      render(
        <MemoryRouter>
          <TopNavbar onOpenMobileMenu={vi.fn()} />
        </MemoryRouter>
      );

      // Verify Pharmacist avatar background
      const avatarEl = screen.getByText('ER');
      expect(avatarEl.className).toContain('bg-emerald-800');

      // Open user dropdown
      fireEvent.click(avatarEl.closest('button'));

      // Check profile link
      const profileLink = screen.getByRole('link', { name: /My Profile/i });
      expect(profileLink).toHaveAttribute('href', '/portal/pharmacist/profile');

      // Check role badge
      const roleBadges = screen.getAllByText('PHARMACIST');
      const dropdownBadge = roleBadges.find((el) => el.className.includes('border-emerald-200'));
      expect(dropdownBadge).toBeDefined();
      expect(dropdownBadge.className).toContain('bg-emerald-50');
      expect(dropdownBadge.className).toContain('text-emerald-800');
    });
  });

  describe('Sidebar Dynamic Role Themes', () => {
    it('applies blue theme for DOCTOR active route styling', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.DOCTOR,
        currentUser: { name: 'Dr. Marcus Chen', role: UserRole.DOCTOR },
      });

      render(
        <MemoryRouter initialEntries={['/portal/doctor/dashboard']}>
          <Sidebar isCollapsed={false} />
        </MemoryRouter>
      );

      const activeLink = screen.getByRole('link', { name: /Clinical Dashboard/i });
      expect(activeLink.className).toContain('bg-blue-700');
    });

    it('applies purple theme for ADMIN active route styling', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.ADMIN,
        currentUser: { name: 'David Vance', role: UserRole.ADMIN },
      });

      render(
        <MemoryRouter initialEntries={['/portal/admin/dashboard']}>
          <Sidebar isCollapsed={false} />
        </MemoryRouter>
      );

      const activeLink = screen.getByRole('link', { name: /System Overview/i });
      expect(activeLink.className).toContain('bg-purple-700');
    });
  });

  describe('RoleGuard Smooth Navigation', () => {
    it('navigates smoothly to /dashboard without hard reload on restricted view', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PATIENT,
        isAuthenticated: true,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT },
      });

      render(
        <MemoryRouter>
          <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
            <div>Doctor Restricted Area</div>
          </RoleGuard>
        </MemoryRouter>
      );

      expect(screen.getByText(/Clinical Access Restricted/i)).toBeInTheDocument();
      const returnBtn = screen.getByRole('button', { name: /Go to My Portal/i });
      fireEvent.click(returnBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('AppShell Component Mounting', () => {
    it('mounts NotificationPanel and MediSafe AI within AppShell', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PATIENT,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT },
        logout: vi.fn(),
      });

      vi.spyOn(NotificationModule, 'useNotifications').mockReturnValue({
        unreadCount: 0,
        toggleNotificationPanel: vi.fn(),
      });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AppShell />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('mock-ai-assistant')).toBeInTheDocument();
      expect(screen.getByTestId('mock-notification-panel')).toBeInTheDocument();
    });
  });
});
