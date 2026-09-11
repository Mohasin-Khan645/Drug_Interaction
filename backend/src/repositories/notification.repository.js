import { prisma } from '../config/database.js';

export const notificationRepository = {
  async create(data) {
    // Check if an unread notification with identical title and patient/resource already exists to prevent alert fatigue
    if (data.resourceId) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: data.userId,
          resourceId: data.resourceId,
          status: 'UNREAD',
        },
      });
      if (existing) {
        return existing;
      }
    }

    return prisma.notification.create({
      data: {
        userId: data.userId,
        patientId: data.patientId || null,
        type: data.type || 'INTERACTION_ALERT',
        severity: data.severity || 'MAJOR',
        title: data.title,
        message: data.message,
        resourceType: data.resourceType || 'SafetyFinding',
        resourceId: data.resourceId ? String(data.resourceId) : null,
        status: 'UNREAD',
      },
    });
  },

  async findByUserId(userId, params = {}) {
    const where = { userId };
    if (params.status) {
      where.status = params.status;
    }

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit || 50,
    });
  },

  async markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  },

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, status: 'UNREAD' },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  },

  async updateStatus(id, userId, status) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { status },
    });
  },
};

