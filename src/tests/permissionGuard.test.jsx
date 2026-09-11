import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PermissionGuard from '../components/common/PermissionGuard';
import * as AuthModule from '../context/AuthContext';
import { Permissions, hasPermission, getPermissionsForRole } from '../constants/permissions';

describe('PermissionGuard & PBAC Granular Security', () => {
  it('renders children when user possesses the requested permission', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      role: 'DOCTOR',
      isAuthenticated: true,
      currentUser: {
        name: 'Dr. Marcus Chen',
        role: 'DOCTOR',
        permissions: getPermissionsForRole('DOCTOR'),
      },
    });

    render(
      <PermissionGuard permission={Permissions.SAFETY_EMERGENCY_OVERRIDE}>
        <div>Emergency Clinical Override Button</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Emergency Clinical Override Button')).toBeInTheDocument();
  });

  it('renders fallback when user lacks the requested permission', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      role: 'PATIENT',
      isAuthenticated: true,
      currentUser: {
        name: 'Sarah Jenkins',
        role: 'PATIENT',
        permissions: getPermissionsForRole('PATIENT'),
      },
    });

    render(
      <PermissionGuard
        permission={Permissions.SAFETY_EMERGENCY_OVERRIDE}
        fallback={<div>Access Denied: Clinicians Only</div>}
      >
        <div>Emergency Clinical Override Button</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Access Denied: Clinicians Only')).toBeInTheDocument();
    expect(screen.queryByText('Emergency Clinical Override Button')).not.toBeInTheDocument();
  });

  it('authorizes administrator with wildcard (*) for any permission check', () => {
    const adminUser = {
      name: 'David Vance',
      role: 'ADMIN',
      permissions: ['*'],
    };

    expect(hasPermission(adminUser, Permissions.ADMIN_SETTINGS_MANAGE)).toBe(true);
    expect(hasPermission(adminUser, Permissions.SAFETY_EMERGENCY_OVERRIDE)).toBe(true);
    expect(hasPermission(adminUser, 'non_existent_future_permission')).toBe(true);
  });
});

