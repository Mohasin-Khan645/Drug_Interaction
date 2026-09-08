'use strict';

const reportRepository = require('../repositories/reportRepository');
const safetyRepository = require('../repositories/safetyRepository');
const patientRepository = require('../repositories/patientRepository');
const reviewRepository = require('../repositories/reviewRepository');
const notificationService = require('./notificationService');
const auditService = require('./auditService');
const ApiError = require('../utils/apiError');
const { AUDIT_ACTIONS } = require('../constants');
const { paginatedResult } = require('../utils/pagination');
const { ACCESS_LEVEL, assertPatientAccess } = require('./patientAccessService');

const buildReportNumber = async () => {
  const year = new Date().getUTCFullYear();
  const count = await reportRepository.countForYear(year);
  return `DS-${year}-${String(count + 1).padStart(6, '0')}`;
};

const buildSnapshot = async (patient, check) => {
  const findings = [];
  for (const finding of check.findings) {
    const reviews = await reviewRepository.listByFinding(finding.id);
    findings.push({
      id: finding.id,
      category: finding.category,
      severity: finding.severity,
      title: finding.title,
      description: finding.description,
      clinicalEffect: finding.clinicalEffect,
      mechanism: finding.mechanism,
      management: finding.management,
      status: finding.status,
      evidence: finding.evidence.map((item) => ({
        sourceName: item.sourceName,
        reference: item.reference,
        version: item.version,
        evidenceLevel: item.evidenceLevel,
        reviewedAt: item.reviewedAt,
      })),
      reviews: reviews.map((review) => ({
        decision: review.decision,
        clinicalNote: review.clinicalNote,
        reviewer: review.reviewer.name,
        reviewerRole: review.reviewer.role,
        createdAt: review.createdAt,
      })),
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    patient: {
      id: patient.id,
      name: patient.user.name,
      dateOfBirth: patient.dateOfBirth,
      sex: patient.sex,
      heightCm: patient.heightCm,
      weightKg: patient.weightKg,
    },
    medications: patient.medications
      .filter((med) => med.status === 'ACTIVE')
      .map((med) => ({
        name: med.drug ? med.drug.genericName : med.rawName,
        brandName: med.drug ? med.drug.brandName : null,
        strength: med.strength,
        doseForm: med.doseForm,
        route: med.route,
        frequency: med.frequency,
        source: med.source,
      })),
    conditions: patient.conditions.map((condition) => ({
      name: condition.condition.name,
      status: condition.status,
    })),
    allergies: patient.allergies.map((allergy) => ({
      allergen: allergy.allergen,
      reaction: allergy.reaction,
      severity: allergy.severity,
    })),
    summary: check.summary,
    findings,
  };
};

const createReport = async (user, { safetyCheckId, status = 'DRAFT' }, req) => {
  const check = await safetyRepository.findCheckById(safetyCheckId);
  if (!check) throw ApiError.notFound('Safety check not found');
  await assertPatientAccess(user, check.patientId, ACCESS_LEVEL.READ, req);

  const patient = await patientRepository.findWithClinicalData(check.patientId);
  const snapshot = await buildSnapshot(patient, check);
  const reportNumber = await buildReportNumber();

  const report = await reportRepository.create({
    patientId: check.patientId,
    safetyCheckId,
    reportNumber,
    status,
    createdBy: user.id,
    snapshot,
  });

  await notificationService.notifyReportReady({ patient, report });
  await auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.REPORT_CREATED,
    resourceType: 'SafetyReport',
    resourceId: report.id,
    metadata: { reportNumber },
  });

  return report;
};

const getReport = async (user, id, req) => {
  const report = await reportRepository.findById(id);
  if (!report) throw ApiError.notFound('Report not found');
  await assertPatientAccess(user, report.patientId, ACCESS_LEVEL.READ, req);
  return report;
};

const listReports = async (user, patientId, filters, req) => {
  await assertPatientAccess(user, patientId, ACCESS_LEVEL.READ, req);
  const { items, total, pagination } = await reportRepository.listByPatient(patientId, filters);
  return paginatedResult(items, total, pagination);
};

module.exports = { createReport, getReport, listReports, buildSnapshot };
