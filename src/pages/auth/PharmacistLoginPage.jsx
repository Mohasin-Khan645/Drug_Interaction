import React from 'react';
import RoleLoginPage from './RoleLoginPage';
import { Pill } from 'lucide-react';
import { UserRole } from '../../constants/roles';

export default function PharmacistLoginPage() {
  return (
    <RoleLoginPage
      role={UserRole.PHARMACIST}
      title="Pharmacy Dispensing Portal"
      subtitle="Dedicated pharmacy verification suite for prescription dispensing verification, medication reconciliation, and interaction screening."
      badge="Registered Pharmacist Access"
      badgeIcon={Pill}
      themeColor="emerald"
      complianceNotice="Restricted to licensed pharmacists (RPh, PharmD) and pharmacy technicians operating under pharmacist supervision."
      defaultEmail="elena.rostova@healthrx.org"
      registerLink={{
        label: 'Register new pharmacy staff credentials?',
        to: '/register?role=PHARMACIST',
      }}
    />
  );
}

