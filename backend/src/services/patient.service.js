import { patientRepository } from '../repositories/patient.repository.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import { UserRole } from '../constants/roles.js';

export const patientService = {
  /**
   * Enforces object-level authorization for medical patient data access
   */
  async verifyPatientAccess(currentUser, patientId) {
    if (currentUser.role === UserRole.ADMIN) {
      return true;
    }

    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient record not found.');
    }

    if (currentUser.role === UserRole.PATIENT) {
      // Patient can ONLY access their own profile
      if (patient.userId !== currentUser.id && patient.id !== currentUser.patientId) {
        throw new ForbiddenError('Unauthorized: You do not have permission to view other patient records.');
      }
      return patient;
    }

    // Doctors and Pharmacists have clinical access for care delivery
    if (currentUser.role === UserRole.DOCTOR || currentUser.role === UserRole.PHARMACIST) {
      return patient;
    }

    throw new ForbiddenError('Access denied: Unauthorized role.');
  },

  async getPatients(currentUser, params = {}) {
    if (currentUser.role === UserRole.PATIENT) {
      // Return only the current patient's record
      const patient = await patientRepository.findByUserId(currentUser.id);
      return { patients: patient ? [patient] : [], total: patient ? 1 : 0 };
    }

    // Clinicians & Admins can query patient rosters
    return patientRepository.findAll(params);
  },

  async getPatientById(currentUser, id) {
    const patient = await this.verifyPatientAccess(currentUser, id);
    return patient;
  },

  async updatePatientProfile(currentUser, id, updateData) {
    await this.verifyPatientAccess(currentUser, id);

    // Patients cannot modify clinical diagnostic or prescription history directly
    const safeData = { ...updateData };
    if (currentUser.role === UserRole.PATIENT) {
      delete safeData.primaryDoctor;
      delete safeData.mrn;
    }

    return patientRepository.update(id, safeData);
  },

  async getPatientConditions(currentUser, patientId) {
    await this.verifyPatientAccess(currentUser, patientId);
    return patientRepository.getConditions(patientId);
  },

  async addPatientCondition(currentUser, patientId, conditionData) {
    await this.verifyPatientAccess(currentUser, patientId);
    // Only clinicians can add verified medical diagnoses
    if (currentUser.role === UserRole.PATIENT) {
      throw new ForbiddenError('Only licensed clinicians may append diagnostic conditions to the medical record.');
    }
    return patientRepository.addCondition(patientId, conditionData);
  },

  async getPatientAllergies(currentUser, patientId) {
    await this.verifyPatientAccess(currentUser, patientId);
    return patientRepository.getAllergies(patientId);
  },

  async addPatientAllergy(currentUser, patientId, allergyData) {
    await this.verifyPatientAccess(currentUser, patientId);
    return patientRepository.addAllergy(patientId, allergyData);
  },

  async getPatientLabs(currentUser, patientId) {
    await this.verifyPatientAccess(currentUser, patientId);
    return patientRepository.getLabs(patientId);
  },

  async getPatientFactors(currentUser, patientId) {
    const patient = await this.verifyPatientAccess(currentUser, patientId);
    // Calculate clinical factors (renal function, age, hepatic status)
    const labs = await patientRepository.getLabs(patientId);
    const serumCrLab = labs.find((l) => /creatinine|serum cr/i.test(l.testName));
    const egfrLab = labs.find((l) => /egfr/i.test(l.testName));

    return {
      patientId: patient.id,
      age: patient.age,
      gender: patient.gender,
      weightKg: patient.weightKg,
      heightCm: patient.heightCm,
      egfr: egfrLab ? parseFloat(egfrLab.value) : 60,
      serumCr: serumCrLab ? parseFloat(serumCrLab.value) : 1.0,
      hepaticStatus: 'Normal',
      highRiskFlags: [],
    };
  },
};

