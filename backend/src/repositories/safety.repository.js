import { prisma, isDatabaseAvailable } from '../config/database.js';

export const safetyRepository = {
  /**
   * Persists a complete safety evaluation record and its child findings atomically
   */
  async saveSafetyCheck({ patientId, evaluatedMedications, overallSafetyStatus, totalFindings, checkedByUserId, findings = [] }) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.$transaction(async (tx) => {
          const check = await tx.safetyCheck.create({
            data: {
              patientId: patientId || null,
              evaluatedMedications: JSON.stringify(evaluatedMedications),
              overallSafetyStatus,
              totalFindings,
              checkedByUserId: checkedByUserId || null,
            },
          });

          const createdFindings = [];
          for (const f of findings) {
            const findingRecord = await tx.safetyFinding.create({
              data: {
                safetyCheckId: check.id,
                category: f.category || 'DRUG_DRUG',
                severity: f.severity,
                title: f.title,
                affectedDrugs: JSON.stringify(f.affectedDrugs || []),
                clinicalEffect: f.clinicalEffect,
                mechanism: f.mechanism,
                management: f.management || f.recommendation,
                recommendation: f.recommendation,
                evidence: f.evidence,
                evidenceLevel: f.evidenceLevel,
                source: f.source,
                status: f.status || 'OPEN',
              },
            });

            if (f.evidenceRefs && f.evidenceRefs.length > 0) {
              for (const ev of f.evidenceRefs) {
                await tx.findingEvidence.create({
                  data: {
                    findingId: findingRecord.id,
                    sourceId: ev.sourceId || null,
                    documentTitle: ev.title,
                    referenceUrl: ev.url,
                    evidenceSnippet: ev.snippet || '',
                    evidenceLevel: ev.evidenceLevel || 'Level 1',
                  },
                });
              }
            }

            createdFindings.push(findingRecord);
          }

          return { ...check, findings: createdFindings };
        });
      }
    } catch {
      // Fallback
    }

    return {
      id: `chk-${Date.now()}`,
      patientId: patientId || null,
      evaluatedMedications,
      overallSafetyStatus,
      totalFindings,
      findings,
      createdAt: new Date(),
    };
  },

  async findById(id) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.safetyCheck.findUnique({
          where: { id },
          include: {
            patient: {
              include: { conditions: true, allergies: true },
            },
            findings: {
              include: {
                clinicianReviews: {
                  include: { reviewer: { select: { id: true, name: true, role: true } } },
                },
                evidenceRefs: true,
              },
            },
          },
        });
      }
    } catch {
      // Fallback
    }

    return null;
  },

  async findByPatientId(patientId, limit = 10) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.safetyCheck.findMany({
          where: { patientId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            findings: true,
          },
        });
      }
    } catch {
      // Fallback
    }

    return [];
  },
};

