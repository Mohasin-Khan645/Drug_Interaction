import { describe, it, expect, beforeEach } from 'vitest';
import {
  UserRole,
  ROLES,
  isValidRole,
  ROLE_PORTALS,
  ROLE_PROFILE_MODELS,
  ROLE_METADATA,
} from '../../src/constants/roles.js';
import { userRepository } from '../../src/repositories/user.repository.js';

describe('Phase 1: Database Role Model & Authoritative Profiles', () => {
  describe('Authoritative 4-Role Model Definition', () => {
    it('enforces the exact 4 healthcare roles', () => {
      expect(ROLES).toEqual(['PATIENT', 'DOCTOR', 'PHARMACIST', 'ADMIN']);
      expect(UserRole.PATIENT).toBe('PATIENT');
      expect(UserRole.DOCTOR).toBe('DOCTOR');
      expect(UserRole.PHARMACIST).toBe('PHARMACIST');
      expect(UserRole.ADMIN).toBe('ADMIN');
    });

    it('validates legitimate roles and strictly rejects arbitrary roles', () => {
      expect(isValidRole('PATIENT')).toBe(true);
      expect(isValidRole('patient')).toBe(true);
      expect(isValidRole('DOCTOR')).toBe(true);
      expect(isValidRole('PHARMACIST')).toBe(true);
      expect(isValidRole('ADMIN')).toBe(true);

      // Rejections
      expect(isValidRole('SUPERUSER')).toBe(false);
      expect(isValidRole('GUEST')).toBe(false);
      expect(isValidRole('CLINICIAN')).toBe(false);
      expect(isValidRole(null)).toBe(false);
      expect(isValidRole(undefined)).toBe(false);
    });

    it('maps each role to an isolated portal route', () => {
      expect(ROLE_PORTALS[UserRole.PATIENT]).toBe('/portal/patient');
      expect(ROLE_PORTALS[UserRole.DOCTOR]).toBe('/portal/doctor');
      expect(ROLE_PORTALS[UserRole.PHARMACIST]).toBe('/portal/pharmacist');
      expect(ROLE_PORTALS[UserRole.ADMIN]).toBe('/portal/admin');
    });

    it('maps each role to its dedicated database profile model', () => {
      expect(ROLE_PROFILE_MODELS[UserRole.PATIENT]).toBe('patient');
      expect(ROLE_PROFILE_MODELS[UserRole.DOCTOR]).toBe('doctorProfile');
      expect(ROLE_PROFILE_MODELS[UserRole.PHARMACIST]).toBe('pharmacistProfile');
      expect(ROLE_PROFILE_MODELS[UserRole.ADMIN]).toBe('adminProfile');
    });

    it('maintains clinical credentialing requirements in metadata', () => {
      expect(ROLE_METADATA[UserRole.DOCTOR].requiresLicense).toBe(true);
      expect(ROLE_METADATA[UserRole.PHARMACIST].requiresLicense).toBe(true);
      expect(ROLE_METADATA[UserRole.PATIENT].requiresLicense).toBe(false);
      expect(ROLE_METADATA[UserRole.ADMIN].requiresLicense).toBe(false);
    });
  });

  describe('User Repository Role Queries & Profile Associations', () => {
    it('retrieves doctor user with full DoctorProfile credentials', async () => {
      const doctor = await userRepository.findByEmail('doctor@example.com');
      expect(doctor).toBeDefined();
      expect(doctor.role).toBe(UserRole.DOCTOR);
      expect(doctor.doctorProfile).toBeDefined();
      expect(doctor.doctorProfile.specialty).toBe('Internal Medicine & Cardiology');
      expect(doctor.doctorProfile.licenseNumber).toBe('CA-MD-89210');
      expect(doctor.doctorProfile.npiNumber).toBe('1982736450');
      expect(doctor.doctorProfile.deaNumber).toBe('BC1234567');
      expect(doctor.doctorProfile.hospitalAffiliation).toBe('St. Jude Health System');
    });

    it('retrieves pharmacist user with full PharmacistProfile credentials', async () => {
      const pharmacist = await userRepository.findByEmail('pharmacist@example.com');
      expect(pharmacist).toBeDefined();
      expect(pharmacist.role).toBe(UserRole.PHARMACIST);
      expect(pharmacist.pharmacistProfile).toBeDefined();
      expect(pharmacist.pharmacistProfile.licenseNumber).toBe('RPH-55419');
      expect(pharmacist.pharmacistProfile.licenseState).toBe('CA');
      expect(pharmacist.pharmacistProfile.pharmacyName).toBe('DrugSafe Central Clinical Pharmacy');
      expect(pharmacist.pharmacistProfile.pharmacyNpi).toBe('1092837465');
    });

    it('retrieves admin user with full AdminProfile governance data', async () => {
      const admin = await userRepository.findByEmail('admin@example.com');
      expect(admin).toBeDefined();
      expect(admin.role).toBe(UserRole.ADMIN);
      expect(admin.adminProfile).toBeDefined();
      expect(admin.adminProfile.adminLevel).toBe('SUPER_ADMIN');
      expect(admin.adminProfile.employeeId).toBe('EMP-ADM-001');
      expect(admin.adminProfile.canAudit).toBe(true);
      expect(admin.adminProfile.canManageUsers).toBe(true);
      expect(admin.adminProfile.canManageRules).toBe(true);
    });

    it('retrieves patient user with Patient medical record and primary doctor link', async () => {
      const patientUser = await userRepository.findByEmail('patient@example.com');
      expect(patientUser).toBeDefined();
      expect(patientUser.role).toBe(UserRole.PATIENT);
      expect(patientUser.patient).toBeDefined();
      expect(patientUser.patient.mrn).toBe('MRN-84920');
      expect(patientUser.patient.primaryDoctor).toBe('Dr. Marcus Chen, MD');
      expect(patientUser.patient.primaryDoctorId).toBe('usr-doctor-1');
    });

    it('filters users by authoritative database role via findByRole', async () => {
      const doctors = await userRepository.findByRole(UserRole.DOCTOR);
      expect(doctors.length).toBeGreaterThanOrEqual(1);
      doctors.forEach((doc) => {
        expect(doc.role).toBe(UserRole.DOCTOR);
        expect(doc.doctorProfile).toBeDefined();
      });

      const pharmacists = await userRepository.findByRole(UserRole.PHARMACIST);
      expect(pharmacists.length).toBeGreaterThanOrEqual(1);
      pharmacists.forEach((pharm) => {
        expect(pharm.role).toBe(UserRole.PHARMACIST);
        expect(pharm.pharmacistProfile).toBeDefined();
      });

      const admins = await userRepository.findByRole(UserRole.ADMIN);
      expect(admins.length).toBeGreaterThanOrEqual(1);
      admins.forEach((adm) => {
        expect(adm.role).toBe(UserRole.ADMIN);
        expect(adm.adminProfile).toBeDefined();
      });

      const patients = await userRepository.findByRole(UserRole.PATIENT);
      expect(patients.length).toBeGreaterThanOrEqual(1);
      patients.forEach((pat) => {
        expect(pat.role).toBe(UserRole.PATIENT);
        expect(pat.patient).toBeDefined();
      });
    });

    it('extracts role profile polymorphically using getRoleProfile', async () => {
      const docProfile = await userRepository.getRoleProfile('usr-doctor-1');
      expect(docProfile).toBeDefined();
      expect(docProfile.specialty).toBe('Internal Medicine & Cardiology');

      const pharmProfile = await userRepository.getRoleProfile('usr-pharmacist-1');
      expect(pharmProfile).toBeDefined();
      expect(pharmProfile.licenseNumber).toBe('RPH-55419');

      const adminProfile = await userRepository.getRoleProfile('usr-admin-1');
      expect(adminProfile).toBeDefined();
      expect(adminProfile.adminLevel).toBe('SUPER_ADMIN');

      const patientProfile = await userRepository.getRoleProfile('usr-patient-1');
      expect(patientProfile).toBeDefined();
      expect(patientProfile.mrn).toBe('MRN-84920');
    });

    it('assigns and updates role profile dynamically via assignRoleProfile', async () => {
      const updatedDoc = await userRepository.assignRoleProfile('usr-doctor-1', UserRole.DOCTOR, {
        specialty: 'Cardiothoracic Medicine',
        hospitalAffiliation: 'Metropolitan Medical Center',
      });

      expect(updatedDoc.doctorProfile.specialty).toBe('Cardiothoracic Medicine');
      expect(updatedDoc.doctorProfile.hospitalAffiliation).toBe('Metropolitan Medical Center');

      // Reset
      await userRepository.assignRoleProfile('usr-doctor-1', UserRole.DOCTOR, {
        specialty: 'Internal Medicine & Cardiology',
        hospitalAffiliation: 'St. Jude Health System',
      });
    });
  });
});
