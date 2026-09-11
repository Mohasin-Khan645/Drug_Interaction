/**
 * DRUGSAFE - Clinical Medication Safety & Interaction Platform
 * Core Clinical TypeScript Definitions
 */

export type Role = 'PATIENT' | 'DOCTOR' | 'PHARMACIST' | 'ADMIN';

export type SeverityLevel = 'CRITICAL' | 'MAJOR' | 'MONITOR' | 'INFO' | 'NO_FINDING_IDENTIFIED';

export type ClinicalStatus = 'ACTIVE' | 'DISCONTINUED' | 'PENDING_REVIEW' | 'FLAGGED';

export type ReviewStatus = 
  | 'PENDING'
  | 'ACKNOWLEDGED'
  | 'OVERRIDDEN'
  | 'APPROVED_FOR_DISPENSING'
  | 'SAFETY_CONCERN'
  | 'NEEDS_CLARIFICATION';

export interface EvidenceSource {
  id: string;
  title: string;
  source: string;
  evidenceLevel: string;
  snippet?: string;
  pmid?: string;
  url?: string;
}

export interface SafetyFinding {
  id: string;
  severity: SeverityLevel;
  title: string;
  medications: string[];
  summary: string;
  clinicalEffect: string;
  mechanism: string;
  management: string;
  evidenceSources: EvidenceSource[];
  source: string;
  lastVerified: string;
  status?: ReviewStatus;
}

export interface Medication {
  id: string;
  patientId?: string;
  name: string;
  genericName: string;
  brandName?: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  prescriber: string;
  status: ClinicalStatus;
  drugClass?: string;
  rxNormCode?: string;
  atcCode?: string;
  instructions?: string;
  foodInteractions?: string[];
  diseaseConsiderations?: string[];
  allergyConsiderations?: string[];
  duplicateTherapy?: string[];
  findingStatus?: 'NO_FINDING' | 'MONITOR' | 'CRITICAL' | 'MAJOR';
}

export interface PatientAllergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  diagnosedDate?: string;
}

export interface PatientCondition {
  id: string;
  conditionName: string;
  icd10Code: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  diagnosedDate?: string;
}

export interface RenalFunction {
  egfr: number;
  serumCr: number;
  crcl: number;
  stage: string;
}

export interface HepaticFunction {
  status: string;
  ast: number;
  alt: number;
  totalBilirubin: number;
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  weightKg: number;
  heightCm: number;
  phone: string;
  emergencyContact?: string;
  primaryDoctor: string;
  renalFunction: RenalFunction;
  hepaticFunction: HepaticFunction;
  conditions: PatientCondition[];
  allergies: PatientAllergy[];
  activeMedicationsCount?: number;
  riskFindingsCount?: number;
  lastCheckedDate?: string;
  status?: 'Needs Review' | 'Monitored' | 'Stable';
}

export interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  confidence: 'High' | 'Medium' | 'Low';
  flagWarning?: string;
  normalizedName: string;
  rxNormCode?: string;
  verifiedByUser?: boolean;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  prescriber: string;
  submittedAt: string;
  status: ReviewStatus;
  riskLevel: SeverityLevel;
  medications: PrescriptionItem[];
  imageUrl?: string;
  notes?: string;
  reconciliationStatus?: 'ADDED' | 'REMOVED' | 'CHANGED' | 'CONTINUED' | 'POTENTIAL_ISSUE';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  resource: string;
  resourceId?: string;
  patientRecord?: string;
  result: 'Completed' | 'Failed' | 'Flagged Concern' | 'Updated';
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

export interface InteractionRule {
  id: string;
  drugA: string;
  drugB: string;
  severity: SeverityLevel;
  mechanism: string;
  clinicalEffect: string;
  management: string;
  evidence: string;
  source: string;
  lastVerified: string;
  status: 'Verified' | 'Needs Review' | 'Deprecated';
}

export interface DataSource {
  id: string;
  name: string;
  version: string;
  lastSync: string;
  recordCount: number;
  status: 'Connected' | 'Syncing' | 'Degraded';
  url?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  department?: string;
  licenseNumber?: string;
  createdAt: string;
  lastLogin: string;
  avatar?: string | null;
}

