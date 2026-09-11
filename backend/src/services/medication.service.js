import { medicationRepository } from '../repositories/medication.repository.js';
import { patientService } from './patient.service.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { UserRole } from '../constants/roles.js';

export const medicationService = {
  async getMedications(currentUser, params = {}) {
    const patientId = params.patientId || currentUser.patientId;
    if (!patientId) {
      if (currentUser.role === UserRole.PATIENT) {
        return [];
      }
      return [];
    }

    await patientService.verifyPatientAccess(currentUser, patientId);
    return medicationRepository.findByPatientId(patientId, params.status || 'Active');
  },

  async getMedicationById(currentUser, id) {
    const med = await medicationRepository.findById(id);
    if (!med) {
      throw new NotFoundError('Medication record not found.');
    }
    await patientService.verifyPatientAccess(currentUser, med.patientId);
    return med;
  },

  async addMedication(currentUser, data) {
    const patientId = data.patientId || currentUser.patientId;
    if (!patientId) {
      throw new ForbiddenError('Patient identifier is required to add medication.');
    }
    await patientService.verifyPatientAccess(currentUser, patientId);

    return medicationRepository.create({
      ...data,
      patientId,
    });
  },

  async updateMedication(currentUser, id, data) {
    const existing = await medicationRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Medication record not found.');
    }
    await patientService.verifyPatientAccess(currentUser, existing.patientId);

    return medicationRepository.update(id, data);
  },

  /**
   * Discontinue rather than hard-delete to maintain medical history
   */
  async deleteMedication(currentUser, id) {
    const existing = await medicationRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Medication record not found.');
    }
    await patientService.verifyPatientAccess(currentUser, existing.patientId);

    return medicationRepository.deactivate(id, 'Discontinued by user/clinician request');
  },
};

