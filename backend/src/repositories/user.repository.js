import { prisma, isDatabaseAvailable } from '../config/database.js';

const DEMO_PW_HASH = '$2a$10$EcQH6E432V8u3O/7oWJzeug1IyWqV9EonovB7qwCwPZMyY.8ykCX.'; // Password123!

const USER_ROLE_INCLUDES = {
  patient: true,
  doctorProfile: true,
  pharmacistProfile: true,
  adminProfile: true,
};

const IN_MEMORY_USERS = [
  {
    id: 'usr-admin-1',
    name: 'David Vance',
    email: 'admin@example.com',
    passwordHash: DEMO_PW_HASH,
    role: 'ADMIN',
    status: 'ACTIVE',
    department: 'Healthcare Systems Engineering',
    adminProfile: {
      id: 'prof-adm-1',
      userId: 'usr-admin-1',
      adminLevel: 'SUPER_ADMIN',
      department: 'Healthcare Systems Engineering',
      employeeId: 'EMP-ADM-001',
      canAudit: true,
      canManageUsers: true,
      canManageRules: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'usr-doctor-1',
    name: 'Dr. Marcus Chen, MD',
    email: 'doctor@example.com',
    passwordHash: DEMO_PW_HASH,
    role: 'DOCTOR',
    status: 'ACTIVE',
    department: 'Internal Medicine & Cardiology',
    licenseNumber: 'CA-MD-89210',
    doctorProfile: {
      id: 'prof-doc-1',
      userId: 'usr-doctor-1',
      specialty: 'Internal Medicine & Cardiology',
      licenseNumber: 'CA-MD-89210',
      npiNumber: '1982736450',
      deaNumber: 'BC1234567',
      hospitalAffiliation: 'St. Jude Health System',
      phone: '+1 (555) 234-5678',
      officeLocation: 'Suite 400, Cardiology Clinic',
      consultationHours: 'Mon-Thu 08:00-16:00',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'usr-doctor-2',
    name: 'Dr. Marcus Chen, MD',
    email: 'marcus.chen@drugsafe.hospital.org',
    passwordHash: DEMO_PW_HASH,
    role: 'DOCTOR',
    status: 'ACTIVE',
    department: 'Internal Medicine & Cardiology',
    licenseNumber: 'CA-MD-89210',
    doctorProfile: {
      id: 'prof-doc-2',
      userId: 'usr-doctor-2',
      specialty: 'Internal Medicine & Cardiology',
      licenseNumber: 'CA-MD-89210',
      npiNumber: '1982736450',
      deaNumber: 'BC1234567',
      hospitalAffiliation: 'St. Jude Health System',
      phone: '+1 (555) 234-5678',
      officeLocation: 'Suite 400, Cardiology Clinic',
      consultationHours: 'Mon-Thu 08:00-16:00',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'usr-pharmacist-1',
    name: 'Elena Rostova, PharmD',
    email: 'pharmacist@example.com',
    passwordHash: DEMO_PW_HASH,
    role: 'PHARMACIST',
    status: 'ACTIVE',
    licenseNumber: 'RPH-55419',
    pharmacistProfile: {
      id: 'prof-phm-1',
      userId: 'usr-pharmacist-1',
      licenseNumber: 'RPH-55419',
      licenseState: 'CA',
      pharmacyName: 'DrugSafe Central Clinical Pharmacy',
      pharmacyNpi: '1092837465',
      workShift: 'Day Shift (07:00 - 15:30)',
      phone: '+1 (555) 345-6789',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'usr-admin-2',
    name: 'David Vance',
    email: 'admin@drugsafe.io',
    passwordHash: DEMO_PW_HASH,
    role: 'ADMIN',
    status: 'ACTIVE',
    department: 'Healthcare Systems Engineering',
    adminProfile: {
      id: 'prof-adm-2',
      userId: 'usr-admin-2',
      adminLevel: 'SUPER_ADMIN',
      department: 'Healthcare Systems Engineering',
      employeeId: 'EMP-ADM-002',
      canAudit: true,
      canManageUsers: true,
      canManageRules: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'usr-pharmacist-2',
    name: 'Elena Rostova, PharmD',
    email: 'elena.rostova@healthrx.org',
    passwordHash: DEMO_PW_HASH,
    role: 'PHARMACIST',
    status: 'ACTIVE',
    department: 'Clinical Pharmacy Services',
    licenseNumber: 'RPH-55419',
    pharmacistProfile: {
      id: 'prof-phm-2',
      userId: 'usr-pharmacist-2',
      licenseNumber: 'RPH-55419',
      licenseState: 'CA',
      pharmacyName: 'DrugSafe Central Clinical Pharmacy',
      pharmacyNpi: '1092837465',
      workShift: 'Day Shift (07:00 - 15:30)',
      phone: '+1 (555) 345-6789',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'usr-patient-1',
    name: 'Sarah Jenkins',
    email: 'patient@example.com',
    passwordHash: DEMO_PW_HASH,
    role: 'PATIENT',
    status: 'ACTIVE',
    patient: {
      id: 'pt-101',
      userId: 'usr-patient-1',
      mrn: 'MRN-84920',
      primaryDoctor: 'Dr. Marcus Chen, MD',
      primaryDoctorId: 'usr-doctor-1',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'usr-patient-2',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    passwordHash: DEMO_PW_HASH,
    role: 'PATIENT',
    status: 'ACTIVE',
    patient: {
      id: 'pt-101',
      userId: 'usr-patient-2',
      mrn: 'MRN-84920',
      primaryDoctor: 'Dr. Marcus Chen, MD',
      primaryDoctorId: 'usr-doctor-1',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const userRepository = {
  async findById(id) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        const u = await prisma.user.findUnique({
          where: { id },
          include: USER_ROLE_INCLUDES,
        });
        if (u) return u;
      }
    } catch {
      // Fallback
    }

    return IN_MEMORY_USERS.find((u) => u.id === id) || null;
  },

  async findByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();

    try {
      if (prisma && (await isDatabaseAvailable())) {
        const u = await prisma.user.findUnique({
          where: { email: cleanEmail },
          include: USER_ROLE_INCLUDES,
        });
        if (u) return u;
      }
    } catch {
      // Fallback
    }

    return IN_MEMORY_USERS.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findByRole(role) {
    const roleUpper = role.toUpperCase();
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.user.findMany({
          where: { role: roleUpper },
          include: USER_ROLE_INCLUDES,
          orderBy: { name: 'asc' },
        });
      }
    } catch {
      // Fallback
    }

    return IN_MEMORY_USERS.filter((u) => u.role === roleUpper);
  },

  async getRoleProfile(userId) {
    const u = await this.findById(userId);
    if (!u) return null;
    switch (u.role) {
      case 'PATIENT':
        return u.patient || null;
      case 'DOCTOR':
        return u.doctorProfile || null;
      case 'PHARMACIST':
        return u.pharmacistProfile || null;
      case 'ADMIN':
        return u.adminProfile || null;
      default:
        return null;
    }
  },

  async assignRoleProfile(userId, role, profileData) {
    const roleUpper = role.toUpperCase();
    const u = await this.findById(userId);
    if (!u) return null;

    try {
      if (prisma && (await isDatabaseAvailable())) {
        if (roleUpper === 'DOCTOR') {
          await prisma.doctorProfile.upsert({
            where: { userId },
            update: profileData,
            create: { userId, ...profileData },
          });
        } else if (roleUpper === 'PHARMACIST') {
          await prisma.pharmacistProfile.upsert({
            where: { userId },
            update: profileData,
            create: { userId, ...profileData },
          });
        } else if (roleUpper === 'ADMIN') {
          await prisma.adminProfile.upsert({
            where: { userId },
            update: profileData,
            create: { userId, ...profileData },
          });
        } else if (roleUpper === 'PATIENT') {
          await prisma.patient.upsert({
            where: { userId },
            update: profileData,
            create: { userId, mrn: profileData.mrn || `MRN-${Date.now().toString().slice(-5)}`, ...profileData },
          });
        }
        return await this.findById(userId);
      }
    } catch {
      // Fallback
    }

    if (roleUpper === 'DOCTOR') {
      u.doctorProfile = { id: `prof-doc-${Date.now()}`, userId, ...profileData };
    } else if (roleUpper === 'PHARMACIST') {
      u.pharmacistProfile = { id: `prof-phm-${Date.now()}`, userId, ...profileData };
    } else if (roleUpper === 'ADMIN') {
      u.adminProfile = { id: `prof-adm-${Date.now()}`, userId, ...profileData };
    } else if (roleUpper === 'PATIENT') {
      u.patient = { id: `pt-${Date.now()}`, userId, ...profileData };
    }
    return u;
  },

  async create(userData) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.user.create({
          data: {
            ...userData,
            email: userData.email.toLowerCase(),
          },
          include: USER_ROLE_INCLUDES,
        });
      }
    } catch {
      // Fallback
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    IN_MEMORY_USERS.push(newUser);
    return newUser;
  },

  async update(id, data) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        return await prisma.user.update({
          where: { id },
          data,
          include: USER_ROLE_INCLUDES,
        });
      }
    } catch {
      // Fallback
    }

    const u = IN_MEMORY_USERS.find((usr) => usr.id === id);
    if (u) Object.assign(u, data);
    return u;
  },

  async findAll(params = {}) {
    const { skip = 0, take = 50, role, status, search } = params;

    try {
      if (prisma && (await isDatabaseAvailable())) {
        const where = {};
        if (role) where.role = role;
        if (status) where.status = status;
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ];
        }

        const [users, total] = await Promise.all([
          prisma.user.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
              emailVerified: true,
              department: true,
              licenseNumber: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
          prisma.user.count({ where }),
        ]);

        if (users.length > 0) {
          return { users, total };
        }
      }
    } catch {
      // Fallback
    }

    let list = [...IN_MEMORY_USERS];
    if (role) list = list.filter((u) => u.role === role);
    if (status) list = list.filter((u) => u.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    return {
      users: list.slice(skip, skip + take),
      total: list.length,
    };
  },

  async recordLoginAttempt(userId, success) {
    const u = await this.findById(userId);
    if (!u) return;

    if (success) {
      u.failedLoginAttempts = 0;
      u.lockedUntil = null;
      u.lastLoginAt = new Date();
    } else {
      u.failedLoginAttempts = (u.failedLoginAttempts || 0) + 1;
      if (u.failedLoginAttempts >= 5) {
        // Lock account for 15 minutes
        u.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
    }
    return u;
  },

  async unlockAccount(userId) {
    const u = await this.findById(userId);
    if (u) {
      u.failedLoginAttempts = 0;
      u.lockedUntil = null;
    }
    return u;
  },

  async updateMfa(userId, { mfaEnabled, mfaSecret, mfaMethod = 'APP' }) {
    const u = await this.findById(userId);
    if (u) {
      u.mfaEnabled = mfaEnabled;
      if (mfaSecret !== undefined) u.mfaSecret = mfaSecret;
      u.mfaMethod = mfaMethod;
    }
    return u;
  },

  async createSession(userId, sessionData) {
    const u = await this.findById(userId);
    if (!u) return null;
    if (!u.activeSessions) u.activeSessions = [];

    const newSession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      device: sessionData.device || 'Desktop Browser',
      browser: sessionData.browser || 'Unknown',
      os: sessionData.os || 'Windows',
      ip: sessionData.ip || '127.0.0.1',
      userAgent: sessionData.userAgent || '',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    // Keep max 10 active sessions
    u.activeSessions.unshift(newSession);
    if (u.activeSessions.length > 10) {
      u.activeSessions = u.activeSessions.slice(0, 10);
    }

    return newSession;
  },

  async listSessions(userId) {
    const u = await this.findById(userId);
    return u?.activeSessions || [];
  },

  async revokeSession(userId, sessionId) {
    const u = await this.findById(userId);
    if (u && u.activeSessions) {
      u.activeSessions = u.activeSessions.filter((s) => s.id !== sessionId);
      return true;
    }
    return false;
  },

  async revokeAllSessions(userId) {
    const u = await this.findById(userId);
    if (u) {
      u.activeSessions = [];
      return true;
    }
    return false;
  },
};

