import { prisma, isDatabaseAvailable } from '../config/database.js';

const IN_MEMORY_PRESCRIPTIONS = [
  {
    id: 'rx-seed-1',
    patientId: 'pt-101',
    fileName: 'sarah_rx_nov.pdf',
    fileUrl: '/uploads/sarah_rx_nov.pdf',
    mimeType: 'application/pdf',
    fileSize: 15420,
    status: 'COMPLETED',
    createdAt: new Date(),
    items: [],
  },
];

export const prescriptionRepository = {
  async create({ patientId, fileName, fileUrl, mimeType, fileSize }) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.prescription.create({
          data: {
            patientId,
            fileName,
            fileUrl,
            mimeType,
            fileSize,
            status: 'PENDING_OCR',
          },
        });
      }
    } catch {
      // Fallback
    }

    const rx = {
      id: `rx-mock-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      patientId,
      fileName,
      fileUrl,
      mimeType,
      fileSize,
      status: 'PENDING_OCR',
      createdAt: new Date(),
      items: [],
    };
    IN_MEMORY_PRESCRIPTIONS.push(rx);
    return rx;
  },

  async findById(id) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        const found = await prisma.prescription.findUnique({
          where: { id },
          include: {
            items: true,
            patient: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        });
        if (found) return found;
      }
    } catch {
      // Fallback
    }

    return IN_MEMORY_PRESCRIPTIONS.find((p) => p.id === id) || null;
  },

  async findAll(params = {}) {
    const { patientId, skip = 0, take = 20 } = params;
    const where = {};
    if (patientId) where.patientId = patientId;

    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.prescription.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        });
      }
    } catch {
      // Fallback
    }

    let list = [...IN_MEMORY_PRESCRIPTIONS];
    if (patientId) {
      list = list.filter((p) => p.patientId === patientId);
    }
    return list.slice(skip, skip + take);
  },

  async updateStatus(id, status, ocrRawText = null) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.prescription.update({
          where: { id },
          data: {
            status,
            ...(ocrRawText && { ocrRawText }),
          },
        });
      }
    } catch {
      // Fallback
    }

    const rx = IN_MEMORY_PRESCRIPTIONS.find((p) => p.id === id);
    if (rx) {
      rx.status = status;
      if (ocrRawText) rx.ocrRawText = ocrRawText;
      return rx;
    }
    return { id, status, ocrRawText };
  },

  async addItems(prescriptionId, items = []) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.$transaction(
          items.map((item) =>
            prisma.prescriptionItem.create({
              data: {
                prescriptionId,
                detectedName: item.detectedName,
                normalizedName: item.normalizedName || null,
                genericName: item.genericName || null,
                strength: item.strength || null,
                form: item.form || null,
                route: item.route || null,
                frequency: item.frequency || null,
                confidenceScore: item.confidenceScore || 0,
                rxNormCode: item.rxNormCode || null,
                status: item.status || 'NEEDS_VERIFICATION',
                flagWarning: item.flagWarning || null,
              },
            })
          )
        );
      }
    } catch {
      // Fallback
    }

    const rx = IN_MEMORY_PRESCRIPTIONS.find((p) => p.id === prescriptionId);
    const createdItems = items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      prescriptionId,
      ...item,
    }));
    if (rx) {
      rx.items = [...(rx.items || []), ...createdItems];
    }
    return createdItems;
  },

  async updateItemStatus(itemId, status, normalizedData = {}) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.prescriptionItem.update({
          where: { id: itemId },
          data: {
            status,
            ...normalizedData,
          },
        });
      }
    } catch {
      // Fallback
    }

    for (const rx of IN_MEMORY_PRESCRIPTIONS) {
      const item = (rx.items || []).find((i) => i.id === itemId);
      if (item) {
        item.status = status;
        Object.assign(item, normalizedData);
        return item;
      }
    }
    return { id: itemId, status, ...normalizedData };
  },
};


