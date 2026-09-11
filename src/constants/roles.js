export const UserRole = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  PHARMACIST: 'PHARMACIST',
  ADMIN: 'ADMIN',
};

export const ROLES = Object.values(UserRole);

export function isValidRole(role) {
  return typeof role === 'string' && ROLES.includes(role.toUpperCase());
}

/**
 * Authoritative 4-Role Portal Route Roots
 */
export const ROLE_PORTALS = {
  [UserRole.PATIENT]: '/portal/patient',
  [UserRole.DOCTOR]: '/portal/doctor',
  [UserRole.PHARMACIST]: '/portal/pharmacist',
  [UserRole.ADMIN]: '/portal/admin',
};

/**
 * Authoritative Portal Dashboard Landing URLs
 */
export const ROLE_PORTAL_DASHBOARDS = {
  [UserRole.PATIENT]: '/portal/patient/dashboard',
  [UserRole.DOCTOR]: '/portal/doctor/dashboard',
  [UserRole.PHARMACIST]: '/portal/pharmacist/dashboard',
  [UserRole.ADMIN]: '/portal/admin/dashboard',
};

/**
 * Metadata and Branding for Each Portal
 */
export const ROLE_METADATA = {
  [UserRole.PATIENT]: {
    label: 'Patient',
    shortRole: 'Patient',
    portalName: 'Patient Medication Safety Portal',
    portalPath: '/portal/patient',
    dashboardPath: '/portal/patient/dashboard',
    themeColor: 'teal',
  },
  [UserRole.DOCTOR]: {
    label: 'Physician / Prescriber',
    shortRole: 'Doctor',
    portalName: 'Clinician Safety Decision Portal',
    portalPath: '/portal/doctor',
    dashboardPath: '/portal/doctor/dashboard',
    themeColor: 'blue',
  },
  [UserRole.PHARMACIST]: {
    label: 'Clinical Pharmacist',
    shortRole: 'Pharmacist',
    portalName: 'Pharmacy Dispensing & Verification Portal',
    portalPath: '/portal/pharmacist',
    dashboardPath: '/portal/pharmacist/dashboard',
    themeColor: 'emerald',
  },
  [UserRole.ADMIN]: {
    label: 'System Administrator',
    shortRole: 'Admin',
    portalName: 'Clinical Governance & Administration Portal',
    portalPath: '/portal/admin',
    dashboardPath: '/portal/admin/dashboard',
    themeColor: 'purple',
  },
};

export function getPortalPath(role) {
  const norm = (role || 'PATIENT').toUpperCase();
  return ROLE_PORTALS[norm] || ROLE_PORTALS[UserRole.PATIENT];
}

export function getPortalDashboardPath(role) {
  const norm = (role || 'PATIENT').toUpperCase();
  return ROLE_PORTAL_DASHBOARDS[norm] || ROLE_PORTAL_DASHBOARDS[UserRole.PATIENT];
}

