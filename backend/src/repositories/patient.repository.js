import { prisma, isDatabaseAvailable } from '../config/database.js';

const IN_MEMORY_PATIENTS = [
  {
    id: 'pt-101',
    userId: 'usr-patient-1',
    mrn: 'MRN-84920',
    dateOfBirth: new Date('1959-04-12'),
    age: 67,
    gender: 'Female',
    bloodGroup: 'A+',
    weightKg: 64.5,
    heightCm: 162,
    phone: '+1 (555) 342-8891',
    primaryDoctor: 'Dr. Marcus Chen, MD',
    user: { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com' },
    conditions: [
      { id: 'c-1', conditionName: 'Chronic Kidney Disease (Stage 3a)', icd10Code: 'N18.31', status: 'Active' },
      { id: 'c-2', conditionName: 'Essential Hypertension', icd10Code: 'I10', status: 'Active' },
      { id: 'c-3', conditionName: 'Nonvalvular Atrial Fibrillation', icd10Code: 'I48.0', status: 'Active' },
    ],
    allergies: [
      { id: 'a-1', allergen: 'Penicillin', reaction: 'Anaphylaxis, Urticaria', severity: 'Severe' },
      { id: 'a-2', allergen: 'Sulfa Drugs', reaction: 'Erythematous Maculopapular Rash', severity: 'Moderate' },
    ],
    medications: [
      { id: 'med-1', medicationName: 'Coumadin', genericName: 'Warfarin Sodium', strength: '5 mg', status: 'Active' },
      { id: 'med-2', medicationName: 'Bayer Aspirin', genericName: 'Aspirin', strength: '81 mg', status: 'Active' },
    ],
    labResults: [
      { id: 'l-1', testName: 'eGFR (CKD-EPI)', value: '48', unit: 'mL/min', interpretation: 'Low', testDate: new Date() },
      { id: 'l-2', testName: 'Serum Creatinine', value: '1.4', unit: 'mg/dL', interpretation: 'High', testDate: new Date() },
    ],
  },
];

export const patientRepository = {
  async findById(id) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        const patient = await prisma.patient.findUnique({
          where: { id },
          include: {
            conditions: true,
            allergies: true,
            medications: {
              where: { status: 'Active' },
              include: { drug: true },
            },
            labResults: {
              orderBy: { testDate: 'desc' },
              take: 10,
            },
            user: true,
          },
        });
        if (patient) return patient;
      }
    } catch {
      // Fallback
    }

    return IN_MEMORY_PATIENTS.find((p) => p.id === id) || null;
  },

  async findByUserId(userId) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        const patient = await prisma.patient.findUnique({
          where: { userId },
          include: {
            conditions: true,
            allergies: true,
            medications: { where: { status: 'Active' } },
            labResults: { orderBy: { testDate: 'desc' }, take: 10 },
            user: true,
          },
        });
        if (patient) return patient;
      }
    } catch {
      // Fallback
    }

    return IN_MEMORY_PATIENTS.find((p) => p.userId === userId) || null;
  },

  async findAll(params = {}) {
    const { skip = 0, take = 20, search } = params;

    try {
      if (prisma && (await isDatabaseAvailable())) {
        const where = {};
        if (search) {
          where.OR = [
            { mrn: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
          ];
        }

        const [patients, total] = await Promise.all([
          prisma.patient.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { name: true, email: true } },
              conditions: true,
              allergies: true,
              medications: { where: { status: 'Active' } },
            },
          }),
          prisma.patient.count({ where }),
        ]);

        if (patients.length > 0 || !search) {
          return { patients, total };
        }
      }
    } catch {
      // Fallback
    }

    return {
      patients: IN_MEMORY_PATIENTS.slice(skip, skip + take),
      total: IN_MEMORY_PATIENTS.length,
    };
  },

  async create(data) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.patient.create({
          data,
          include: { conditions: true, allergies: true },
        });
      }
    } catch {
      // Fallback
    }

    const targetId = data.id || `pt-${Date.now()}`;
    const existingIndex = IN_MEMORY_PATIENTS.findIndex(
      (p) => (data.id && p.id === data.id) || (data.userId && p.userId === data.userId)
    );
    const newPt = {
      id: targetId,
      conditions: [],
      allergies: [],
      medications: [],
      labResults: [],
      ...data,
    };
    if (existingIndex >= 0) {
      IN_MEMORY_PATIENTS[existingIndex] = newPt;
    } else {
      IN_MEMORY_PATIENTS.push(newPt);
    }
    return newPt;
  },

  async update(id, data) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.patient.update({
          where: { id },
          data,
          include: { conditions: true, allergies: true },
        });
      }
    } catch {
      // Fallback
    }

    const pt = IN_MEMORY_PATIENTS.find((p) => p.id === id);
    if (pt) Object.assign(pt, data);
    return pt;
  },

  async getConditions(patientId) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.patientCondition.findMany({
          where: { patientId },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch {
      // Fallback
    }

    const pt = IN_MEMORY_PATIENTS.find((p) => p.id === patientId);
    return pt ? pt.conditions : [];
  },

  async addCondition(patientId, conditionData) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.patientCondition.create({
          data: {
            patientId,
            conditionName: conditionData.conditionName,
            icd10Code: conditionData.icd10Code,
            status: conditionData.status || 'Active',
            diagnosedDate: conditionData.diagnosedDate ? new Date(conditionData.diagnosedDate) : new Date(),
            notes: conditionData.notes,
          },
        });
      }
    } catch {
      // Fallback
    }

    const newCond = { id: `c-${Date.now()}`, patientId, ...conditionData };
    const pt = IN_MEMORY_PATIENTS.find((p) => p.id === patientId);
    if (pt) pt.conditions.push(newCond);
    return newCond;
  },

  async getAllergies(patientId) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.patientAllergy.findMany({
          where: { patientId },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch {
      // Fallback
    }

    const pt = IN_MEMORY_PATIENTS.find((p) => p.id === patientId);
    return pt ? pt.allergies : [];
  },

  async addAllergy(patientId, allergyData) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.patientAllergy.create({
          data: {
            patientId,
            allergen: allergyData.allergen,
            reaction: allergyData.reaction,
            severity: allergyData.severity || 'Moderate',
            diagnosedDate: allergyData.diagnosedDate ? new Date(allergyData.diagnosedDate) : new Date(),
            notes: allergyData.notes,
          },
        });
      }
    } catch {
      // Fallback
    }

    const newAllergy = { id: `a-${Date.now()}`, patientId, ...allergyData };
    const pt = IN_MEMORY_PATIENTS.find((p) => p.id === patientId);
    if (pt) pt.allergies.push(newAllergy);
    return newAllergy;
  },

  async getLabs(patientId) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.labResult.findMany({
          where: { patientId },
          orderBy: { testDate: 'desc' },
        });
      }
    } catch {
      // Fallback
    }

    const pt = IN_MEMORY_PATIENTS.find((p) => p.id === patientId);
    return pt ? pt.labResults : [];
  },

  async addLab(patientId, labData) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.labResult.create({
          data: {
            patientId,
            testName: labData.testName,
            value: String(labData.value),
            unit: labData.unit,
            referenceRange: labData.referenceRange,
            interpretation: labData.interpretation || 'Normal',
            testDate: labData.testDate ? new Date(labData.testDate) : new Date(),
          },
        });
      }
    } catch {
      // Fallback
    }

    const newLab = { id: `l-${Date.now()}`, patientId, ...labData, testDate: new Date() };
    const pt = IN_MEMORY_PATIENTS.find((p) => p.id === patientId);
    if (pt) pt.labResults.push(newLab);
    return newLab;
  },
};

