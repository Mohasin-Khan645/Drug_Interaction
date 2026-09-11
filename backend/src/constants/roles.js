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
 * Canonical 4-role portal routing boundaries
 */
export const ROLE_PORTALS = {
  [UserRole.PATIENT]: '/portal/patient',
  [UserRole.DOCTOR]: '/portal/doctor',
  [UserRole.PHARMACIST]: '/portal/pharmacist',
  [UserRole.ADMIN]: '/portal/admin',
};

/**
 * 1-to-1 Profile Model relations on User in Prisma schema
 */
export const ROLE_PROFILE_MODELS = {
  [UserRole.PATIENT]: 'patient',
  [UserRole.DOCTOR]: 'doctorProfile',
  [UserRole.PHARMACIST]: 'pharmacistProfile',
  [UserRole.ADMIN]: 'adminProfile',
};

/**
 * Healthcare role descriptors and clinical authorizations
 */
export const ROLE_METADATA = {
  [UserRole.PATIENT]: {
    label: 'Patient',
    portalName: 'Patient Medication Safety Portal',
    portalPath: '/portal/patient',
    primaryModel: 'patient',
    requiresLicense: false,
  },
  [UserRole.DOCTOR]: {
    label: 'Physician / Prescriber',
    portalName: 'Clinician Safety Decision Portal',
    portalPath: '/portal/doctor',
    primaryModel: 'doctorProfile',
    requiresLicense: true,
  },
  [UserRole.PHARMACIST]: {
    label: 'Clinical Pharmacist',
    portalName: 'Pharmacy Dispensing & Verification Portal',
    portalPath: '/portal/pharmacist',
    primaryModel: 'pharmacistProfile',
    requiresLicense: true,
  },
  [UserRole.ADMIN]: {
    label: 'Clinical Systems Administrator',
    portalName: 'Enterprise Governance & Audit Portal',
    portalPath: '/portal/admin',
    primaryModel: 'adminProfile',
    requiresLicense: false,
  },
};

