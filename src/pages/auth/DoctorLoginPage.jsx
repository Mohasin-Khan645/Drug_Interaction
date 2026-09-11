import React from 'react';
import RoleLoginPage from './RoleLoginPage';
import { Stethoscope } from 'lucide-react';
import { UserRole } from '../../constants/roles';

export default function DoctorLoginPage() {
  return (
    <RoleLoginPage
      role={UserRole.DOCTOR}
      title="Clinician Safety Portal"
      subtitle="Authorized electronic prescriber workspace for clinical decision support, multi-factor safety checks, and patient charts."
      badge="Licensed Clinician Access"
      badgeIcon={Stethoscope}
      themeColor="blue"
      complianceNotice="Authorized for verified medical practitioners (MD, DO, NP, PA) with valid NPI/DEA credentials. All queries are audited."
      defaultEmail="marcus.chen@drugsafe.hospital.org"
      registerLink={{
        label: 'Need institutional clinician onboarding?',
        to: '/register?role=DOCTOR',
      }}
    />
  );
}

