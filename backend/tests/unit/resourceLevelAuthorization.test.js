import { describe, it, expect, beforeEach } from 'vitest';
import { patientService } from '../../src/services/patient.service.js';
import { medicationService } from '../../src/services/medication.service.js';
import { prescriptionService } from '../../src/services/prescription.service.js';
import { reportService } from '../../src/services/report.service.js';
import { patientRepository } from '../../src/repositories/patient.repository.js';
import { medicationRepository } from '../../src/repositories/medication.repository.js';
import { prescriptionRepository } from '../../src/repositories/prescription.repository.js';
import { reportRepository } from '../../src/repositories/report.repository.js';
import { UserRole } from '../../src/constants/roles.js';

describe('Phase 4: Resource-Level Authorization & IDOR Protection', () => {
  const patientAUser = {
    id: 'usr-patient-1',
    role: UserRole.PATIENT,
    patientId: 'pt-101',
    name: 'Sarah Jenkins',
  };

  const patientBUser = {
    id: 'usr-patient-b',
    role: UserRole.PATIENT,
    patientId: 'pt-999',
    name: 'John Doe',
  };

  const doctorUser = {
    id: 'usr-doctor-1',
    role: UserRole.DOCTOR,
    name: 'Dr. Marcus Chen, MD',
  };

  const pharmacistUser = {
    id: 'usr-pharmacist-1',
    role: UserRole.PHARMACIST,
    name: 'Elena Rostova, PharmD',
  };

  const adminUser = {
    id: 'usr-admin-1',
    role: UserRole.ADMIN,
    name: 'David Vance',
  };

  beforeEach(async () => {
    // Ensure patient B exists in repository mock
    await patientRepository.create({
      id: 'pt-999',
      userId: 'usr-patient-b',
      mrn: 'MRN-99999',
      primaryDoctor: 'Dr. Marcus Chen, MD',
      user: { name: 'John Doe', email: 'john.doe@example.com' },
    });
  });

  describe('Patient Profile Resource-Level Isolation', () => {
    it('allows Patient A to access their own medical record (pt-101)', async () => {
      const p = await patientService.getPatientById(patientAUser, 'pt-101');
      expect(p).toBeDefined();
      expect(p.id).toBe('pt-101');
    });

    it('strictly forbids Patient A from accessing Patient B record (pt-999) with 403', async () => {
      await expect(
        patientService.getPatientById(patientAUser, 'pt-999')
      ).rejects.toThrow(/Unauthorized: You do not have permission to view other patient records/);
    });

    it('allows DOCTOR to access both Patient A and Patient B records for care delivery', async () => {
      const patientA = await patientService.getPatientById(doctorUser, 'pt-101');
      expect(patientA).toBeDefined();

      const patientB = await patientService.getPatientById(doctorUser, 'pt-999');
      expect(patientB).toBeDefined();
    });

    it('allows PHARMACIST to access patient profiles for medication dispensing', async () => {
      const patientA = await patientService.getPatientById(pharmacistUser, 'pt-101');
      expect(patientA).toBeDefined();
    });

    it('allows ADMIN to access patient profiles for governance inspection', async () => {
      const patientA = await patientService.getPatientById(adminUser, 'pt-101');
      expect(patientA).toBeDefined();
    });

    it('prohibits Patient from appending diagnostic conditions directly (clinician-only)', async () => {
      await expect(
        patientService.addPatientCondition(patientAUser, 'pt-101', {
          conditionName: 'Self-Diagnosed Migraine',
          status: 'Active',
        })
      ).rejects.toThrow(/Only licensed clinicians may append diagnostic conditions/);
    });

    it('permits DOCTOR to append verified clinical conditions to patient profile', async () => {
      const cond = await patientService.addPatientCondition(doctorUser, 'pt-101', {
        conditionName: 'Type 2 Diabetes Mellitus',
        status: 'Active',
        icd10Code: 'E11.9',
      });
      expect(cond).toBeDefined();
      expect(cond.conditionName).toBe('Type 2 Diabetes Mellitus');
    });
  });

  describe('Medication Resource-Level Authorization', () => {
    let medAId;
    let medBId;

    beforeEach(async () => {
      const medA = await medicationRepository.create({
        patientId: 'pt-101',
        medicationName: 'Warfarin 5mg',
        strength: '5mg',
        doseForm: 'Tablet',
        route: 'Oral',
        frequency: 'Daily',
      });
      medAId = medA.id;

      const medB = await medicationRepository.create({
        patientId: 'pt-999',
        medicationName: 'Insulin Glargine 100U/mL',
        strength: '100U/mL',
        doseForm: 'Injection',
        route: 'Subcutaneous',
        frequency: 'Nightly',
      });
      medBId = medB.id;
    });

    it('allows Patient A to access their own medication', async () => {
      const med = await medicationService.getMedicationById(patientAUser, medAId);
      expect(med).toBeDefined();
      expect(med.medicationName).toBe('Warfarin 5mg');
    });

    it('strictly forbids Patient A from accessing Patient B medication with 403', async () => {
      await expect(
        medicationService.getMedicationById(patientAUser, medBId)
      ).rejects.toThrow(/Unauthorized: You do not have permission to view other patient records/);
    });

    it('strictly forbids Patient A from modifying Patient B medication with 403', async () => {
      await expect(
        medicationService.updateMedication(patientAUser, medBId, { dosage: '10mg' })
      ).rejects.toThrow(/Unauthorized/);
    });

    it('strictly forbids Patient A from discontinuing Patient B medication with 403', async () => {
      await expect(
        medicationService.deleteMedication(patientAUser, medBId)
      ).rejects.toThrow(/Unauthorized/);
    });

    it('allows DOCTOR to update medications across patients', async () => {
      const updated = await medicationService.updateMedication(doctorUser, medBId, {
        notes: 'Dose adjusted by cardiologist',
      });
      expect(updated).toBeDefined();
    });
  });

  describe('Safety Reports & Prescriptions Resource-Level Isolation', () => {
    let reportAId;
    let reportBId;
    let rxBId;

    beforeEach(async () => {
      const rptA = await reportRepository.create({
        patientId: 'pt-101',
        safetyCheckId: 'chk-101',
        reportNumber: 'DS-RPT-101001',
        createdBy: 'usr-doctor-1',
      });
      reportAId = rptA.id;

      const rptB = await reportRepository.create({
        patientId: 'pt-999',
        safetyCheckId: 'chk-999',
        reportNumber: 'DS-RPT-999001',
        createdBy: 'usr-doctor-1',
      });
      reportBId = rptB.id;

      const rxB = await prescriptionRepository.create({
        patientId: 'pt-999',
        fileName: 'rx_john_doe.pdf',
        fileUrl: '/uploads/rx_john_doe.pdf',
        mimeType: 'application/pdf',
        fileSize: 10240,
      });
      rxBId = rxB.id;
    });

    it('allows Patient A to view their own safety report', async () => {
      const rpt = await reportService.getReportById(patientAUser, reportAId);
      expect(rpt).toBeDefined();
      expect(rpt.patientId).toBe('pt-101');
    });

    it('strictly denies Patient A from accessing Patient B safety report with 403', async () => {
      await expect(
        reportService.getReportById(patientAUser, reportBId)
      ).rejects.toThrow(/Unauthorized: You do not have permission to view other patient records/);
    });

    it('strictly denies Patient A from downloading PDF of Patient B safety report with 403', async () => {
      await expect(
        reportService.generatePdf(patientAUser, reportBId)
      ).rejects.toThrow(/Unauthorized/);
    });

    it('strictly denies Patient A from accessing Patient B prescription document with 403', async () => {
      await expect(
        prescriptionService.getPrescriptionById(patientAUser, rxBId)
      ).rejects.toThrow(/Unauthorized/);
    });

    it('allows DOCTOR to view safety reports across patients', async () => {
      const rpt = await reportService.getReportById(doctorUser, reportBId);
      expect(rpt).toBeDefined();
      expect(rpt.patientId).toBe('pt-999');
    });
  });
});
