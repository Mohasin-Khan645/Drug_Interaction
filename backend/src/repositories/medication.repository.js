import { prisma, isDatabaseAvailable } from '../config/database.js';

const IN_MEMORY_MEDICATIONS = [
  {
    id: 'med-1',
    patientId: 'pt-101',
    medicationName: 'Coumadin',
    genericName: 'Warfarin Sodium',
    strength: '5 mg',
    doseForm: 'Tablet',
    route: 'Oral',
    frequency: 'Daily',
    status: 'Active',
    startDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'med-2',
    patientId: 'pt-101',
    medicationName: 'Bayer Aspirin',
    genericName: 'Aspirin',
    strength: '81 mg',
    doseForm: 'Tablet',
    route: 'Oral',
    frequency: 'Daily',
    status: 'Active',
    startDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const medicationRepository = {
  async findById(id) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.patientMedication.findUnique({
          where: { id },
          include: { drug: true, patient: true },
        });
      }
    } catch {
      // Fallback
    }
    return IN_MEMORY_MEDICATIONS.find((m) => m.id === id) || null;
  },

  async findByPatientId(patientId, status = 'Active') {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        const where = { patientId };
        if (status) where.status = status;
        return await prisma.patientMedication.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: { drug: true },
        });
      }
    } catch {
      // Fallback
    }
    return IN_MEMORY_MEDICATIONS.filter(
      (m) => m.patientId === patientId && (!status || m.status === status)
    );
  },

  async create(data) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.patientMedication.create({
          data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            endDate: data.endDate ? new Date(data.endDate) : null,
          },
          include: { drug: true },
        });
      }
    } catch {
      // Fallback
    }

    const newMed = {
      id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'Active',
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    IN_MEMORY_MEDICATIONS.push(newMed);
    return newMed;
  },

  async update(id, data) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        const updateData = { ...data };
        if (data.startDate) updateData.startDate = new Date(data.startDate);
        if (data.endDate) updateData.endDate = new Date(data.endDate);
        return await prisma.patientMedication.update({
          where: { id },
          data: updateData,
          include: { drug: true },
        });
      }
    } catch {
      // Fallback
    }

    const med = IN_MEMORY_MEDICATIONS.find((m) => m.id === id);
    if (med) {
      Object.assign(med, data, { updatedAt: new Date() });
    }
    return med || null;
  },

  /**
   * Never hard delete medication records: soft deactivation ensures auditability
   */
  async deactivate(id, reason = 'Discontinued') {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.patientMedication.update({
          where: { id },
          data: {
            status: 'Discontinued',
            endDate: new Date(),
            notes: reason,
          },
        });
      }
    } catch {
      // Fallback
    }

    const med = IN_MEMORY_MEDICATIONS.find((m) => m.id === id);
    if (med) {
      med.status = 'Discontinued';
      med.endDate = new Date();
      med.notes = reason;
    }
    return med || null;
  },
};

