import { prisma, isDatabaseAvailable } from '../config/database.js';

const IN_MEMORY_REPORTS = [];

export const reportRepository = {
  async create({ patientId, safetyCheckId, reportNumber, createdBy }) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.safetyReport.create({
          data: {
            patientId: patientId || null,
            safetyCheckId,
            reportNumber,
            createdBy: createdBy || null,
            status: 'GENERATED',
          },
          include: {
            safetyCheck: {
              include: {
                findings: {
                  include: {
                    clinicianReviews: {
                      include: { reviewer: true },
                    },
                  },
                },
              },
            },
            patient: {
              include: {
                user: true,
                conditions: true,
                allergies: true,
                medications: true,
              },
            },
          },
        });
      }
    } catch {
      // Fallback
    }

    const rpt = {
      id: `rpt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      patientId: patientId || null,
      safetyCheckId,
      reportNumber,
      createdBy: createdBy || null,
      status: 'GENERATED',
      createdAt: new Date(),
    };
    IN_MEMORY_REPORTS.push(rpt);
    return rpt;
  },

  async findById(id) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.safetyReport.findUnique({
          where: { id },
          include: {
            safetyCheck: {
              include: {
                findings: {
                  include: {
                    clinicianReviews: {
                      include: { reviewer: true },
                    },
                    evidenceRefs: true,
                  },
                },
              },
            },
            patient: {
              include: {
                user: true,
                conditions: true,
                allergies: true,
                medications: true,
                labResults: true,
              },
            },
          },
        });
      }
    } catch {
      // Fallback
    }

    return IN_MEMORY_REPORTS.find((r) => r.id === id) || null;
  },

  async findAll(params = {}) {
    const { patientId, skip = 0, take = 20 } = params;
    try {
      if (prisma && (await isDatabaseAvailable())) {
        const where = {};
        if (patientId) where.patientId = patientId;

        return await prisma.safetyReport.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            safetyCheck: true,
            patient: {
              include: { user: { select: { name: true } } },
            },
          },
        });
      }
    } catch {
      // Fallback
    }

    let list = [...IN_MEMORY_REPORTS];
    if (patientId) list = list.filter((r) => r.patientId === patientId);
    return list.slice(skip, skip + take);
  },
};

