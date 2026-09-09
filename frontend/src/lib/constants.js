export const ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  PHARMACIST: 'PHARMACIST',
  ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
  PATIENT: 'Patient',
  DOCTOR: 'Doctor',
  PHARMACIST: 'Pharmacist',
  ADMIN: 'Administrator',
};

export const SEVERITIES = [
  'CONTRAINDICATED',
  'CRITICAL',
  'MAJOR',
  'MODERATE',
  'MINOR',
  'INFORMATIONAL',
];

export const FINDING_CATEGORIES = {
  DRUG_DRUG: 'Drug–drug',
  DRUG_DISEASE: 'Drug–disease',
  DRUG_ALLERGY: 'Drug–allergy',
  DUPLICATION: 'Duplication',
  PATIENT_FACTOR: 'Patient factor',
};

export const FINDING_STATUSES = {
  OPEN: 'Open',
  ACKNOWLEDGED: 'Acknowledged',
  REVIEW_REQUIRED: 'Review required',
  ACCEPTED: 'Accepted',
  RESOLVED: 'Resolved',
};

export const MEDICATION_STATUSES = {
  ACTIVE: 'Active',
  STOPPED: 'Stopped',
  ON_HOLD: 'On hold',
  PENDING_REVIEW: 'Pending review',
};

export const MEDICATION_SOURCES = {
  SELF_REPORTED: 'Self reported',
  PRESCRIPTION: 'Prescription',
  OTC: 'OTC',
  SUPPLEMENT: 'Supplement',
  CLINICIAN_ENTERED: 'Clinician entered',
  RECONCILIATION: 'Reconciliation',
};

export const REVIEW_DECISIONS = {
  ACCEPTED: 'Accept finding',
  ACKNOWLEDGED: 'Acknowledge',
  REQUIRES_INVESTIGATION: 'Requires investigation',
};

export const RULE_KINDS = [
  { key: 'interaction', label: 'Drug–drug' },
  { key: 'disease', label: 'Drug–disease' },
  { key: 'allergy', label: 'Drug–allergy' },
  { key: 'duplication', label: 'Duplication' },
  { key: 'factor', label: 'Patient factor' },
];

export const DISCLAIMER =
  'DrugSafe is clinical decision support. It does not diagnose, prescribe, or replace the judgement of a licensed clinician.';
