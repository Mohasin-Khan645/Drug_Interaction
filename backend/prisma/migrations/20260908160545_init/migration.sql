-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATIENT', 'DOCTOR', 'PHARMACIST', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('CONTRAINDICATED', 'CRITICAL', 'MAJOR', 'MODERATE', 'MINOR', 'INFORMATIONAL');

-- CreateEnum
CREATE TYPE "FindingCategory" AS ENUM ('DRUG_DRUG', 'DRUG_DISEASE', 'DRUG_ALLERGY', 'DUPLICATION', 'PATIENT_FACTOR');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'REVIEW_REQUIRED', 'ACCEPTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('ACCEPTED', 'ACKNOWLEDGED', 'REQUIRES_INVESTIGATION');

-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('ACTIVE', 'STOPPED', 'ON_HOLD', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "MedicationSource" AS ENUM ('SELF_REPORTED', 'PRESCRIPTION', 'OTC', 'SUPPLEMENT', 'CLINICIAN_ENTERED', 'RECONCILIATION');

-- CreateEnum
CREATE TYPE "ConditionStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'SUSPECTED');

-- CreateEnum
CREATE TYPE "AllergySeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DiseaseRuleType" AS ENUM ('CONTRAINDICATION', 'PRECAUTION', 'WARNING');

-- CreateEnum
CREATE TYPE "AllergyRuleRelation" AS ENUM ('EXACT_DRUG', 'INGREDIENT', 'CLASS', 'CROSS_SENSITIVITY');

-- CreateEnum
CREATE TYPE "DuplicationRuleType" AS ENUM ('SAME_DRUG', 'SAME_INGREDIENT', 'THERAPEUTIC');

-- CreateEnum
CREATE TYPE "PatientFactorType" AS ENUM ('AGE_MIN', 'AGE_MAX', 'WEIGHT_MIN', 'WEIGHT_MAX', 'RENAL_FUNCTION', 'HEPATIC_FUNCTION', 'LAB_VALUE');

-- CreateEnum
CREATE TYPE "ComparisonOperator" AS ENUM ('LT', 'LTE', 'GT', 'GTE', 'EQ');

-- CreateEnum
CREATE TYPE "SafetyCheckStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "PrescriptionItemStatus" AS ENUM ('PENDING_REVIEW', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'FINAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SAFETY_FINDING', 'REVIEW_REQUIRED', 'REPORT_READY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CareRelationStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "VerificationTokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "AliasType" AS ENUM ('BRAND', 'SYNONYM', 'ABBREVIATION', 'MISSPELLING');

-- CreateEnum
CREATE TYPE "IdentifierType" AS ENUM ('RXNORM', 'NDC', 'ATC', 'SNOMED', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PATIENT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VerificationTokenType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "sex" TEXT,
    "heightCm" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "medicalHistory" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_team_members" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CareRelationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conditions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_conditions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,
    "status" "ConditionStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_allergies" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" "AllergySeverity" NOT NULL DEFAULT 'UNKNOWN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_medications" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "drugId" TEXT,
    "rawName" TEXT,
    "strength" TEXT,
    "doseForm" TEXT,
    "route" TEXT,
    "frequency" TEXT,
    "source" "MedicationSource" NOT NULL DEFAULT 'SELF_REPORTED',
    "status" "MedicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_results" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rxcui" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drugs" (
    "id" TEXT NOT NULL,
    "genericName" TEXT NOT NULL,
    "brandName" TEXT,
    "description" TEXT,
    "drugClassId" TEXT,
    "dosageForm" TEXT,
    "route" TEXT,
    "strength" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_ingredients" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "strength" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drug_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_aliases" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "type" "AliasType" NOT NULL DEFAULT 'SYNONYM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drug_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_identifiers" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "type" "IdentifierType" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drug_identifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "version" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_documents" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT,
    "content" TEXT NOT NULL,
    "version" TEXT,
    "evidenceLevel" TEXT,
    "retrievedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_interactions" (
    "id" TEXT NOT NULL,
    "drugAId" TEXT NOT NULL,
    "drugBId" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "interactionType" TEXT,
    "clinicalEffect" TEXT NOT NULL,
    "mechanism" TEXT,
    "management" TEXT,
    "sourceId" TEXT,
    "documentId" TEXT,
    "evidenceLevel" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_disease_rules" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,
    "ruleType" "DiseaseRuleType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "description" TEXT NOT NULL,
    "management" TEXT,
    "sourceId" TEXT,
    "documentId" TEXT,
    "evidenceLevel" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_disease_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_allergy_rules" (
    "id" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "relation" "AllergyRuleRelation" NOT NULL,
    "drugId" TEXT,
    "ingredientId" TEXT,
    "drugClassId" TEXT,
    "severity" "Severity" NOT NULL,
    "description" TEXT NOT NULL,
    "management" TEXT,
    "certain" BOOLEAN NOT NULL DEFAULT true,
    "sourceId" TEXT,
    "documentId" TEXT,
    "evidenceLevel" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_allergy_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duplication_rules" (
    "id" TEXT NOT NULL,
    "ruleType" "DuplicationRuleType" NOT NULL,
    "ingredientId" TEXT,
    "drugClassId" TEXT,
    "severity" "Severity" NOT NULL,
    "description" TEXT NOT NULL,
    "management" TEXT,
    "sourceId" TEXT,
    "documentId" TEXT,
    "evidenceLevel" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "duplication_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_factor_rules" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "factorType" "PatientFactorType" NOT NULL,
    "labCode" TEXT,
    "operator" "ComparisonOperator" NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "severity" "Severity" NOT NULL,
    "description" TEXT NOT NULL,
    "management" TEXT,
    "sourceId" TEXT,
    "documentId" TEXT,
    "evidenceLevel" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_factor_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_checks" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "requestedById" TEXT,
    "status" "SafetyCheckStatus" NOT NULL DEFAULT 'PENDING',
    "inputHash" TEXT NOT NULL,
    "summary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_findings" (
    "id" TEXT NOT NULL,
    "safetyCheckId" TEXT NOT NULL,
    "category" "FindingCategory" NOT NULL,
    "severity" "Severity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "clinicalEffect" TEXT,
    "mechanism" TEXT,
    "management" TEXT,
    "status" "FindingStatus" NOT NULL DEFAULT 'OPEN',
    "ruleId" TEXT,
    "ruleVersion" INTEGER,
    "dedupeKey" TEXT NOT NULL,
    "subjectDrugIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finding_evidence" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "documentId" TEXT,
    "sourceName" TEXT NOT NULL,
    "reference" TEXT,
    "version" TEXT,
    "evidenceLevel" TEXT,
    "retrievedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finding_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinician_reviews" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "clinicalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinician_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'UPLOADED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_images" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescription_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocr_results" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "imageId" TEXT,
    "provider" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "candidates" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ocr_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "candidateDrugId" TEXT,
    "displayName" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "matchType" TEXT,
    "strength" TEXT,
    "doseForm" TEXT,
    "route" TEXT,
    "frequency" TEXT,
    "status" "PrescriptionItemStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_reports" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "safetyCheckId" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "severity" "Severity",
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "dedupeKey" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "grounded" BOOLEAN NOT NULL,
    "outcome" TEXT NOT NULL,
    "responseText" TEXT,
    "contextRefs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_tokenHash_key" ON "verification_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "verification_tokens_userId_type_idx" ON "verification_tokens"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "patients_userId_key" ON "patients"("userId");

-- CreateIndex
CREATE INDEX "care_team_members_userId_idx" ON "care_team_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "care_team_members_patientId_userId_key" ON "care_team_members"("patientId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "conditions_name_key" ON "conditions"("name");

-- CreateIndex
CREATE INDEX "conditions_name_idx" ON "conditions"("name");

-- CreateIndex
CREATE INDEX "patient_conditions_patientId_idx" ON "patient_conditions"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "patient_conditions_patientId_conditionId_key" ON "patient_conditions"("patientId", "conditionId");

-- CreateIndex
CREATE INDEX "patient_allergies_patientId_idx" ON "patient_allergies"("patientId");

-- CreateIndex
CREATE INDEX "patient_medications_patientId_idx" ON "patient_medications"("patientId");

-- CreateIndex
CREATE INDEX "patient_medications_drugId_idx" ON "patient_medications"("drugId");

-- CreateIndex
CREATE INDEX "lab_results_patientId_code_idx" ON "lab_results"("patientId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "drug_classes_name_key" ON "drug_classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_key" ON "ingredients"("name");

-- CreateIndex
CREATE INDEX "ingredients_name_idx" ON "ingredients"("name");

-- CreateIndex
CREATE INDEX "drugs_genericName_idx" ON "drugs"("genericName");

-- CreateIndex
CREATE INDEX "drugs_brandName_idx" ON "drugs"("brandName");

-- CreateIndex
CREATE INDEX "drugs_drugClassId_idx" ON "drugs"("drugClassId");

-- CreateIndex
CREATE INDEX "drug_ingredients_ingredientId_idx" ON "drug_ingredients"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "drug_ingredients_drugId_ingredientId_key" ON "drug_ingredients"("drugId", "ingredientId");

-- CreateIndex
CREATE INDEX "drug_aliases_alias_idx" ON "drug_aliases"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "drug_aliases_drugId_alias_key" ON "drug_aliases"("drugId", "alias");

-- CreateIndex
CREATE INDEX "drug_identifiers_value_idx" ON "drug_identifiers"("value");

-- CreateIndex
CREATE UNIQUE INDEX "drug_identifiers_type_value_key" ON "drug_identifiers"("type", "value");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_sources_name_key" ON "knowledge_sources"("name");

-- CreateIndex
CREATE INDEX "knowledge_documents_sourceId_idx" ON "knowledge_documents"("sourceId");

-- CreateIndex
CREATE INDEX "drug_interactions_drugAId_idx" ON "drug_interactions"("drugAId");

-- CreateIndex
CREATE INDEX "drug_interactions_drugBId_idx" ON "drug_interactions"("drugBId");

-- CreateIndex
CREATE UNIQUE INDEX "drug_interactions_drugAId_drugBId_version_key" ON "drug_interactions"("drugAId", "drugBId", "version");

-- CreateIndex
CREATE INDEX "drug_disease_rules_drugId_idx" ON "drug_disease_rules"("drugId");

-- CreateIndex
CREATE INDEX "drug_disease_rules_conditionId_idx" ON "drug_disease_rules"("conditionId");

-- CreateIndex
CREATE UNIQUE INDEX "drug_disease_rules_drugId_conditionId_version_key" ON "drug_disease_rules"("drugId", "conditionId", "version");

-- CreateIndex
CREATE INDEX "drug_allergy_rules_allergen_idx" ON "drug_allergy_rules"("allergen");

-- CreateIndex
CREATE INDEX "drug_allergy_rules_drugId_idx" ON "drug_allergy_rules"("drugId");

-- CreateIndex
CREATE INDEX "duplication_rules_ruleType_idx" ON "duplication_rules"("ruleType");

-- CreateIndex
CREATE INDEX "patient_factor_rules_drugId_idx" ON "patient_factor_rules"("drugId");

-- CreateIndex
CREATE INDEX "safety_checks_patientId_idx" ON "safety_checks"("patientId");

-- CreateIndex
CREATE INDEX "safety_checks_inputHash_idx" ON "safety_checks"("inputHash");

-- CreateIndex
CREATE INDEX "safety_findings_safetyCheckId_idx" ON "safety_findings"("safetyCheckId");

-- CreateIndex
CREATE INDEX "safety_findings_severity_idx" ON "safety_findings"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "safety_findings_safetyCheckId_dedupeKey_key" ON "safety_findings"("safetyCheckId", "dedupeKey");

-- CreateIndex
CREATE INDEX "finding_evidence_findingId_idx" ON "finding_evidence"("findingId");

-- CreateIndex
CREATE INDEX "clinician_reviews_findingId_idx" ON "clinician_reviews"("findingId");

-- CreateIndex
CREATE INDEX "clinician_reviews_reviewerId_idx" ON "clinician_reviews"("reviewerId");

-- CreateIndex
CREATE INDEX "prescriptions_patientId_idx" ON "prescriptions"("patientId");

-- CreateIndex
CREATE INDEX "prescription_images_prescriptionId_idx" ON "prescription_images"("prescriptionId");

-- CreateIndex
CREATE INDEX "ocr_results_prescriptionId_idx" ON "ocr_results"("prescriptionId");

-- CreateIndex
CREATE INDEX "prescription_items_prescriptionId_idx" ON "prescription_items"("prescriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "safety_reports_reportNumber_key" ON "safety_reports"("reportNumber");

-- CreateIndex
CREATE INDEX "safety_reports_patientId_idx" ON "safety_reports"("patientId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_userId_dedupeKey_key" ON "notifications"("userId", "dedupeKey");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "ai_requests_userId_idx" ON "ai_requests"("userId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_team_members" ADD CONSTRAINT "care_team_members_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_team_members" ADD CONSTRAINT "care_team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_conditions" ADD CONSTRAINT "patient_conditions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_conditions" ADD CONSTRAINT "patient_conditions_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "conditions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medications" ADD CONSTRAINT "patient_medications_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medications" ADD CONSTRAINT "patient_medications_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "drugs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_drugClassId_fkey" FOREIGN KEY ("drugClassId") REFERENCES "drug_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_ingredients" ADD CONSTRAINT "drug_ingredients_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_ingredients" ADD CONSTRAINT "drug_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_aliases" ADD CONSTRAINT "drug_aliases_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_identifiers" ADD CONSTRAINT "drug_identifiers_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "knowledge_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_interactions" ADD CONSTRAINT "drug_interactions_drugAId_fkey" FOREIGN KEY ("drugAId") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_interactions" ADD CONSTRAINT "drug_interactions_drugBId_fkey" FOREIGN KEY ("drugBId") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_interactions" ADD CONSTRAINT "drug_interactions_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "knowledge_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_disease_rules" ADD CONSTRAINT "drug_disease_rules_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_disease_rules" ADD CONSTRAINT "drug_disease_rules_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "conditions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_disease_rules" ADD CONSTRAINT "drug_disease_rules_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "knowledge_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_allergy_rules" ADD CONSTRAINT "drug_allergy_rules_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_allergy_rules" ADD CONSTRAINT "drug_allergy_rules_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_allergy_rules" ADD CONSTRAINT "drug_allergy_rules_drugClassId_fkey" FOREIGN KEY ("drugClassId") REFERENCES "drug_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_allergy_rules" ADD CONSTRAINT "drug_allergy_rules_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "knowledge_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duplication_rules" ADD CONSTRAINT "duplication_rules_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "knowledge_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_factor_rules" ADD CONSTRAINT "patient_factor_rules_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_factor_rules" ADD CONSTRAINT "patient_factor_rules_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "knowledge_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_checks" ADD CONSTRAINT "safety_checks_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_findings" ADD CONSTRAINT "safety_findings_safetyCheckId_fkey" FOREIGN KEY ("safetyCheckId") REFERENCES "safety_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding_evidence" ADD CONSTRAINT "finding_evidence_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "safety_findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding_evidence" ADD CONSTRAINT "finding_evidence_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "knowledge_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinician_reviews" ADD CONSTRAINT "clinician_reviews_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "safety_findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinician_reviews" ADD CONSTRAINT "clinician_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_images" ADD CONSTRAINT "prescription_images_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocr_results" ADD CONSTRAINT "ocr_results_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocr_results" ADD CONSTRAINT "ocr_results_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "prescription_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_candidateDrugId_fkey" FOREIGN KEY ("candidateDrugId") REFERENCES "drugs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_reports" ADD CONSTRAINT "safety_reports_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_reports" ADD CONSTRAINT "safety_reports_safetyCheckId_fkey" FOREIGN KEY ("safetyCheckId") REFERENCES "safety_checks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_reports" ADD CONSTRAINT "safety_reports_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_requests" ADD CONSTRAINT "ai_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
