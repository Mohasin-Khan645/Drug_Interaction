import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardCheck,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Pill,
  ScrollText,
  Settings,
  ShieldCheck,
  Stethoscope,
  Upload,
  Users,
} from 'lucide-react';
import { ROLES } from './constants';

const common = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/drugs', label: 'Drug catalog', icon: Pill },
  { to: '/interactions', label: 'Interaction checker', icon: Activity },
  { to: '/medications', label: 'Medications', icon: ClipboardCheck },
  { to: '/prescriptions', label: 'Prescriptions', icon: Upload },
  { to: '/safety', label: 'Safety checks', icon: ShieldCheck },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/reports', label: 'Reports', icon: FileText },
];

const byRole = {
  [ROLES.PATIENT]: [],
  [ROLES.DOCTOR]: [
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/reviews', label: 'Clinical reviews', icon: Stethoscope },
  ],
  [ROLES.PHARMACIST]: [
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/medication-review', label: 'Medication review', icon: FlaskConical },
    { to: '/reviews', label: 'Clinical reviews', icon: Stethoscope },
  ],
  [ROLES.ADMIN]: [
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/admin', label: 'Admin overview', icon: Settings },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/drugs', label: 'Drug management', icon: Pill },
    { to: '/admin/rules', label: 'Safety rules', icon: ScrollText },
    { to: '/admin/evidence', label: 'Evidence sources', icon: BookOpen },
    { to: '/admin/audit', label: 'Audit log', icon: ScrollText },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ],
};

/** Navigation only controls what is shown; the API remains the authority. */
export const navigationForRole = (role) => [...common, ...(byRole[role] || [])];

export const mobileNavigationForRole = (role) =>
  navigationForRole(role)
    .filter((item) => ['/dashboard', '/drugs', '/interactions', '/medications', '/alerts'].includes(item.to))
    .slice(0, 5);
