import React from 'react';
import RoleLoginPage from './RoleLoginPage';
import { ShieldAlert } from 'lucide-react';
import { UserRole } from '../../constants/roles';

export default function AdminLoginPage() {
  return (
    <RoleLoginPage
      role={UserRole.ADMIN}
      title="Clinical Governance Portal"
      subtitle="Administrative control center for platform security, clinical rule management, audit trails, and user provisioning."
      badge="Administrative Security Clearance"
      badgeIcon={ShieldAlert}
      themeColor="purple"
      complianceNotice="High-security administrative domain. Multi-Factor Authentication is strictly enforced. Every session event is immutably logged."
      defaultEmail="admin@drugsafe.io"
      registerLink={null}
    />
  );
}

