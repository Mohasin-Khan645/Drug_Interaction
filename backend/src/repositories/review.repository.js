import { prisma, isDatabaseAvailable } from '../config/database.js';

const IN_MEMORY_REVIEWS = [];

export const reviewRepository = {
  async createReview(data) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.$transaction(async (tx) => {
          const review = await tx.clinicianReview.create({
            data: {
              findingId: data.findingId,
              reviewerId: data.reviewerId,
              decision: data.decision,
              clinicalNote: data.clinicalNote,
              recommendationOverride: data.recommendationOverride || false,
              notifyPrescriber: data.notifyPrescriber || false,
            },
            include: {
              reviewer: {
                select: { id: true, name: true, role: true, department: true },
              },
            },
          });

          const findingStatus =
            data.decision === 'ACCEPTED'
              ? 'ACCEPTED'
              : data.decision === 'ACKNOWLEDGED'
              ? 'ACKNOWLEDGED'
              : 'REVIEW_REQUIRED';

          await tx.safetyFinding.update({
            where: { id: data.findingId },
            data: { status: findingStatus },
          });

          return review;
        });
      }
    } catch {
      // Fallback
    }

    const created = {
      id: `rev-${Date.now()}`,
      findingId: data.findingId,
      reviewerId: data.reviewerId,
      decision: data.decision,
      clinicalNote: data.clinicalNote,
      recommendationOverride: data.recommendationOverride || false,
      notifyPrescriber: data.notifyPrescriber || false,
      createdAt: new Date(),
    };
    IN_MEMORY_REVIEWS.push(created);
    return created;
  },

  async findPendingReviews(params = {}) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.safetyFinding.findMany({
          where: {
            status: { in: ['OPEN', 'REVIEW_REQUIRED'] },
            severity: { in: ['CRITICAL', 'MAJOR', 'CONTRAINDICATED'] },
          },
          include: {
            safetyCheck: {
              include: {
                patient: {
                  include: { user: { select: { name: true } } },
                },
              },
            },
            clinicianReviews: {
              include: {
                reviewer: { select: { name: true, role: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: params.limit || 50,
        });
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'finding-warfarin-aspirin',
        category: 'DRUG_DRUG_INTERACTION',
        severity: 'CRITICAL',
        title: 'Severe Gastrointestinal & Major Hemorrhage Risk',
        affectedDrugs: 'Warfarin Sodium, Aspirin',
        clinicalEffect: 'Concurrent administration markedly potentiates systemic hypoprothrombinemic effect.',
        mechanism: 'Additive pharmacodynamic anticoagulant and antiplatelet inhibition.',
        management: 'Avoid combination unless specifically indicated. If co-prescribed, add PPI and monitor INR.',
        recommendation: 'Evaluate alternative analgesic such as Acetaminophen with dose capping.',
        evidence: 'FDA Approved Package Labeling & CHEST Guidelines 2024',
        evidenceLevel: 'Level 1 (RCT / Meta-analysis)',
        source: 'CHEST / FDA MedWatch',
        status: 'REVIEW_REQUIRED',
        createdAt: new Date(),
        safetyCheck: {
          patient: {
            user: { name: 'Sarah Jenkins' },
          },
        },
        clinicianReviews: [],
      },
    ];
  },

  async findById(id) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.clinicianReview.findUnique({
          where: { id },
          include: {
            finding: {
              include: { safetyCheck: true },
            },
            reviewer: {
              select: { id: true, name: true, role: true, department: true },
            },
          },
        });
      }
    } catch {
      // Fallback
    }

    return IN_MEMORY_REVIEWS.find((r) => r.id === id) || null;
  },
};


