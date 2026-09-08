'use strict';

const notificationRepository = require('../repositories/notificationRepository');
const patientRepository = require('../repositories/patientRepository');
const { ALERT_SEVERITIES } = require('../constants');
const { paginatedResult } = require('../utils/pagination');

const recipientsForPatient = async (patient) => {
  const careTeam = await patientRepository.listCareTeam(patient.id);
  const clinicianIds = careTeam
    .filter((member) => member.status === 'ACTIVE')
    .map((member) => member.userId);
  return [...new Set([patient.userId, ...clinicianIds])];
};

/**
 * Emits alerts for the severities that warrant attention. The dedupe key is
 * derived from the finding itself, so re-running a check on unchanged data does
 * not produce a second alert.
 */
const notifySafetyFindings = async ({ patient, findings, safetyCheckId }) => {
  const alertable = findings.filter((finding) => ALERT_SEVERITIES.includes(finding.severity));
  if (alertable.length === 0) return { created: 0 };

  const recipients = await recipientsForPatient(patient);
  let created = 0;

  for (const finding of alertable) {
    for (const userId of recipients) {
      const notification = await notificationRepository.createIfAbsent({
        userId,
        type: 'SAFETY_FINDING',
        severity: finding.severity,
        title: `${finding.severity} safety finding`,
        message: finding.title,
        resourceType: 'SafetyFinding',
        resourceId: finding.id,
        dedupeKey: `${patient.id}:${finding.dedupeKey}:${finding.severity}`,
      });
      if (notification) created += 1;
    }
  }

  return { created, safetyCheckId };
};

const notifyReportReady = async ({ patient, report }) => {
  const recipients = await recipientsForPatient(patient);
  for (const userId of recipients) {
    await notificationRepository.createIfAbsent({
      userId,
      type: 'REPORT_READY',
      title: 'Safety report available',
      message: `Report ${report.reportNumber} is ready`,
      resourceType: 'SafetyReport',
      resourceId: report.id,
      dedupeKey: `report:${report.id}`,
    });
  }
};

const listForUser = async (userId, filters) => {
  const { items, total, pagination } = await notificationRepository.listForUser(userId, filters);
  return paginatedResult(items, total, pagination);
};

const markRead = (userId, id) => notificationRepository.markRead(id, userId);

const markAllRead = (userId) => notificationRepository.markAllRead(userId);

module.exports = { notifySafetyFindings, notifyReportReady, listForUser, markRead, markAllRead };
