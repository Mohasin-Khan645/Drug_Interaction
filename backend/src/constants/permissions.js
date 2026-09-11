import { UserRole } from './roles.js';

export const Permissions = {
  // Patients
  PATIENTS_READ_OWN: 'patients:read:own',
  PATIENTS_READ_ALL: 'patients:read:all',
  PATIENTS_CREATE: 'patients:create',
  PATIENTS_UPDATE_OWN: 'patients:update:own',
  PATIENTS_UPDATE_ANY: 'patients:update:any',
  PATIENTS_DELETE: 'patients:delete',

  // Medications
  MEDICATIONS_READ_OWN: 'medications:read:own',
  MEDICATIONS_READ_ALL: 'medications:read:all',
  MEDICATIONS_CREATE_OWN: 'medications:create:own',
  MEDICATIONS_CREATE_ANY: 'medications:create:any',
  MEDICATIONS_UPDATE: 'medications:update',
  MEDICATIONS_DELETE: 'medications:delete',

  // Prescriptions & OCR
  PRESCRIPTIONS_UPLOAD: 'prescriptions:upload',
  PRESCRIPTIONS_READ_OWN: 'prescriptions:read:own',
  PRESCRIPTIONS_READ_ALL: 'prescriptions:read:all',
  PRESCRIPTIONS_VERIFY: 'prescriptions:verify',

  // Safety & Clinical Intelligence
  SAFETY_RUN_CHECK: 'safety:run_check',
  SAFETY_VIEW_FINDINGS: 'safety:view_findings',
  SAFETY_VIEW_EVIDENCE: 'safety:view_evidence',
  SAFETY_REQUEST_AI: 'safety:request_ai',
  SAFETY_EMERGENCY_OVERRIDE: 'safety:emergency_override',

  // Clinical Decisions & Overrides
  CLINICAL_REVIEW_READ: 'clinical_review:read',
  CLINICAL_REVIEW_SIGNOFF: 'clinical_review:signoff',
  CLINICAL_REVIEW_OVERRIDE: 'clinical_review:override',

  // Reconciliation
  RECONCILIATION_RUN: 'reconciliation:run',
  RECONCILIATION_RESOLVE: 'reconciliation:resolve',

  // Reports
  REPORTS_GENERATE: 'reports:generate',
  REPORTS_READ_OWN: 'reports:read:own',
  REPORTS_READ_ALL: 'reports:read:all',
  REPORTS_EXPORT_PDF: 'reports:export_pdf',
  REPORTS_SHARE: 'reports:share',

  // Rules
  RULES_READ: 'rules:read',
  RULES_CREATE: 'rules:create',
  RULES_UPDATE: 'rules:update',
  RULES_TOGGLE: 'rules:toggle',

  // Evidence
  EVIDENCE_READ: 'evidence:read',
  EVIDENCE_SYNC: 'evidence:sync',

  // Audit
  AUDIT_READ: 'audit:read',
  AUDIT_EXPORT: 'audit:export',

  // Admin
  ADMIN_ANALYTICS: 'admin:analytics',
  ADMIN_USERS_READ: 'admin:users:read',
  ADMIN_USERS_MANAGE: 'admin:users:manage',
  ADMIN_SETTINGS_MANAGE: 'admin:settings:manage',

  // Sessions
  SESSIONS_READ_OWN: 'sessions:read:own',
  SESSIONS_REVOKE_OWN: 'sessions:revoke:own',
  SESSIONS_REVOKE_ANY: 'sessions:revoke:any',
};

/**
 * Production Role-to-Permissions mapping
 */
export const ROLE_PERMISSIONS = {
  [UserRole.PATIENT]: [
    Permissions.PATIENTS_READ_OWN,
    Permissions.PATIENTS_UPDATE_OWN,
    Permissions.MEDICATIONS_READ_OWN,
    Permissions.MEDICATIONS_CREATE_OWN,
    Permissions.PRESCRIPTIONS_UPLOAD,
    Permissions.PRESCRIPTIONS_READ_OWN,
    Permissions.SAFETY_RUN_CHECK,
    Permissions.SAFETY_VIEW_FINDINGS,
    Permissions.SAFETY_VIEW_EVIDENCE,
    Permissions.SAFETY_REQUEST_AI,
    Permissions.REPORTS_GENERATE,
    Permissions.REPORTS_READ_OWN,
    Permissions.REPORTS_EXPORT_PDF,
    Permissions.SESSIONS_READ_OWN,
    Permissions.SESSIONS_REVOKE_OWN,
  ],

  [UserRole.DOCTOR]: [
    Permissions.PATIENTS_READ_OWN,
    Permissions.PATIENTS_READ_ALL,
    Permissions.PATIENTS_CREATE,
    Permissions.PATIENTS_UPDATE_ANY,
    Permissions.MEDICATIONS_READ_OWN,
    Permissions.MEDICATIONS_READ_ALL,
    Permissions.MEDICATIONS_CREATE_ANY,
    Permissions.MEDICATIONS_UPDATE,
    Permissions.MEDICATIONS_DELETE,
    Permissions.PRESCRIPTIONS_UPLOAD,
    Permissions.PRESCRIPTIONS_READ_ALL,
    Permissions.PRESCRIPTIONS_VERIFY,
    Permissions.SAFETY_RUN_CHECK,
    Permissions.SAFETY_VIEW_FINDINGS,
    Permissions.SAFETY_VIEW_EVIDENCE,
    Permissions.SAFETY_REQUEST_AI,
    Permissions.SAFETY_EMERGENCY_OVERRIDE,
    Permissions.CLINICAL_REVIEW_READ,
    Permissions.CLINICAL_REVIEW_SIGNOFF,
    Permissions.CLINICAL_REVIEW_OVERRIDE,
    Permissions.RECONCILIATION_RUN,
    Permissions.RECONCILIATION_RESOLVE,
    Permissions.REPORTS_GENERATE,
    Permissions.REPORTS_READ_ALL,
    Permissions.REPORTS_EXPORT_PDF,
    Permissions.REPORTS_SHARE,
    Permissions.RULES_READ,
    Permissions.EVIDENCE_READ,
    Permissions.SESSIONS_READ_OWN,
    Permissions.SESSIONS_REVOKE_OWN,
  ],

  [UserRole.PHARMACIST]: [
    Permissions.PATIENTS_READ_ALL,
    Permissions.MEDICATIONS_READ_ALL,
    Permissions.MEDICATIONS_CREATE_ANY,
    Permissions.MEDICATIONS_UPDATE,
    Permissions.PRESCRIPTIONS_UPLOAD,
    Permissions.PRESCRIPTIONS_READ_ALL,
    Permissions.PRESCRIPTIONS_VERIFY,
    Permissions.SAFETY_RUN_CHECK,
    Permissions.SAFETY_VIEW_FINDINGS,
    Permissions.SAFETY_VIEW_EVIDENCE,
    Permissions.SAFETY_REQUEST_AI,
    Permissions.CLINICAL_REVIEW_READ,
    Permissions.CLINICAL_REVIEW_SIGNOFF,
    Permissions.CLINICAL_REVIEW_OVERRIDE,
    Permissions.RECONCILIATION_RUN,
    Permissions.RECONCILIATION_RESOLVE,
    Permissions.REPORTS_GENERATE,
    Permissions.REPORTS_READ_ALL,
    Permissions.REPORTS_EXPORT_PDF,
    Permissions.RULES_READ,
    Permissions.EVIDENCE_READ,
    Permissions.SESSIONS_READ_OWN,
    Permissions.SESSIONS_REVOKE_OWN,
  ],

  [UserRole.ADMIN]: [
    '*', // Wildcard - unrestricted administrator access
  ],
};

/**
 * Resolves permissions array for a given role
 */
export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Checks if a user has a specific permission
 */
export function hasPermission(user, requiredPermission) {
  if (!user) return false;
  const userPerms = user.permissions || getPermissionsForRole(user.role);
  if (userPerms.includes('*')) return true;
  return userPerms.includes(requiredPermission);
}

