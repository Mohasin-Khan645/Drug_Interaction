import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RoleGuard from '../components/layout/RoleGuard';
import * as AuthModule from '../context/AuthContext';

describe('RoleGuard Security & Navigation Protection', () => {
  it('renders restricted access notice when user role is unauthorized', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      role: 'PATIENT',
      isAuthenticated: true,
      currentUser: { name: 'Sarah Jenkins', role: 'PATIENT' },
    });

    render(
      <BrowserRouter>
        <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
          <div>Protected Clinical Review Queue</div>
        </RoleGuard>
      </BrowserRouter>
    );

    expect(screen.getByText('Clinical Access Restricted')).toBeInTheDocument();
    expect(screen.getByText(/requires authorization designated for/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Clinical Review Queue')).not.toBeInTheDocument();
  });

  it('renders children when user role matches authorized roles', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      role: 'DOCTOR',
      isAuthenticated: true,
      currentUser: { name: 'Dr. Marcus Chen', role: 'DOCTOR' },
    });

    render(
      <BrowserRouter>
        <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
          <div>Protected Clinical Review Queue</div>
        </RoleGuard>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Clinical Review Queue')).toBeInTheDocument();
    expect(screen.queryByText('Clinical Access Restricted')).not.toBeInTheDocument();
  });
});
