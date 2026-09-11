import React from 'react';
import RoleLoginPage from './RoleLoginPage';
import { HeartHandshake } from 'lucide-react';
import { UserRole } from '../../constants/roles';

export default function PatientLoginPage() {
  return (
    <RoleLoginPage
      role={UserRole.PATIENT}
      title="Patient Health Portal"
      subtitle="Sign in to review your personal prescriptions, check potential medication interactions, and access safety reports."
      badge="Personal Health Record"
      badgeIcon={HeartHandshake}
      themeColor="teal"
      complianceNotice="Protected under HIPAA Security Standards. Your personal health information is strictly private and encrypted."
      defaultEmail="sarah.jenkins@example.com"
      registerLink={{
        label: "Don't have a personal health account?",
        to: '/register?role=PATIENT',
      }}
    />
  );
}

