import { prisma, isDatabaseAvailable } from '../config/database.js';
import { logger } from '../config/logger.js';

export const IN_MEMORY_DRUGS = [
  {
    id: 'drg-11',
    genericName: 'Hydrocodone / Acetaminophen',
    brandName: 'Vicodin',
    drugClass: 'Opioid Analgesic Combination',
    activeIngredient: 'Acetaminophen',
    rxNormCode: '857005',
    strength: '5/300 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    aliases: [{ alias: 'Vicodin', type: 'BRAND' }, { alias: 'Norco', type: 'BRAND' }, { alias: 'Lortab', type: 'BRAND' }],
    identifiers: [{ type: 'RXNORM', value: '857005' }],
  },
  {
    id: 'drg-1',
    genericName: 'Warfarin Sodium',
    brandName: 'Coumadin',
    drugClass: 'Vitamin K Antagonist Anticoagulant',
    activeIngredient: 'Warfarin',
    rxNormCode: '855332',
    atcCode: 'B01AA03',
    strength: '5 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    aliases: [{ alias: 'Coumadin', type: 'BRAND' }, { alias: 'Jantoven', type: 'BRAND' }],
    identifiers: [{ type: 'RXNORM', value: '855332' }],
  },
  {
    id: 'drg-2',
    genericName: 'Aspirin',
    brandName: 'Bayer Aspirin',
    drugClass: 'Salicylate / Antiplatelet / NSAID',
    activeIngredient: 'Acetylsalicylic Acid',
    rxNormCode: '1191',
    atcCode: 'B01AC06',
    strength: '81 mg',
    dosageForm: 'Enteric Coated Tablet',
    route: 'Oral',
    aliases: [{ alias: 'Bayer', type: 'BRAND' }, { alias: 'Ecotrin', type: 'BRAND' }],
    identifiers: [{ type: 'RXNORM', value: '1191' }],
  },
  {
    id: 'drg-3',
    genericName: 'Lisinopril',
    brandName: 'Zestril',
    drugClass: 'Angiotensin Converting Enzyme (ACE) Inhibitor',
    activeIngredient: 'Lisinopril',
    rxNormCode: '29046',
    atcCode: 'C09AA03',
    strength: '20 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    aliases: [{ alias: 'Prinivil', type: 'BRAND' }, { alias: 'Zestril', type: 'BRAND' }],
    identifiers: [{ type: 'RXNORM', value: '29046' }],
  },
  {
    id: 'drg-4',
    genericName: 'Metformin Hydrochloride',
    brandName: 'Glucophage',
    drugClass: 'Biguanide Antidiabetic Agent',
    activeIngredient: 'Metformin',
    rxNormCode: '6809',
    atcCode: 'A10BA02',
    strength: '500 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    aliases: [{ alias: 'Glucophage', type: 'BRAND' }, { alias: 'Fortamet', type: 'BRAND' }],
    identifiers: [{ type: 'RXNORM', value: '6809' }],
  },
  {
    id: 'drg-5',
    genericName: 'Amoxicillin',
    brandName: 'Amoxil',
    drugClass: 'Aminopenicillin Antibiotic',
    activeIngredient: 'Amoxicillin',
    rxNormCode: '723',
    atcCode: 'J01CA04',
    strength: '500 mg',
    dosageForm: 'Capsule',
    route: 'Oral',
    aliases: [{ alias: 'Amoxil', type: 'BRAND' }],
    identifiers: [{ type: 'RXNORM', value: '723' }],
  },
  {
    id: 'drg-6',
    genericName: 'Simvastatin',
    brandName: 'Zocor',
    drugClass: 'HMG-CoA Reductase Inhibitor (Statin)',
    activeIngredient: 'Simvastatin',
    rxNormCode: '36567',
    atcCode: 'C10AA01',
    strength: '40 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    aliases: [{ alias: 'Zocor', type: 'BRAND' }],
    identifiers: [{ type: 'RXNORM', value: '36567' }],
  },
  {
    id: 'drg-7',
    genericName: 'Clarithromycin',
    brandName: 'Biaxin',
    drugClass: 'Macrolide Antibiotic / Potent CYP3A4 Inhibitor',
    activeIngredient: 'Clarithromycin',
    rxNormCode: '21212',
    atcCode: 'J01FA09',
    strength: '500 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    aliases: [{ alias: 'Biaxin', type: 'BRAND' }],
    identifiers: [{ type: 'RXNORM', value: '21212' }],
  },
  {
    id: 'drg-8',
    genericName: 'Spironolactone',
    brandName: 'Aldactone',
    drugClass: 'Aldosterone Receptor Antagonist / Potassium-Sparing Diuretic',
    activeIngredient: 'Spironolactone',
    rxNormCode: '9997',
    atcCode: 'C03DA01',
    strength: '25 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    aliases: [{ alias: 'Aldactone', type: 'BRAND' }],
    identifiers: [{ type: 'RXNORM', value: '9997' }],
  },
  {
    id: 'drg-9',
    genericName: 'Acetaminophen',
    brandName: 'Tylenol Extra Strength',
    drugClass: 'Analgesic and Antipyretic',
    activeIngredient: 'Acetaminophen',
    rxNormCode: '161',
    atcCode: 'N02BE01',
    strength: '500 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    aliases: [{ alias: 'Tylenol', type: 'BRAND' }, { alias: 'Panadol', type: 'BRAND' }],
    identifiers: [{ type: 'RXNORM', value: '161' }],
  },
  {
    id: 'drg-10',
    genericName: 'Ibuprofen',
    brandName: 'Advil',
    drugClass: 'Nonsteroidal Anti-inflammatory Drug (NSAID)',
    activeIngredient: 'Ibuprofen',
    rxNormCode: '5640',
    atcCode: 'M01AE01',
    strength: '400 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    aliases: [{ alias: 'Advil', type: 'BRAND' }, { alias: 'Motrin', type: 'BRAND' }],
    identifiers: [{ type: 'RXNORM', value: '5640' }],
  },
];

export const drugRepository = {
  async findById(id) {
    try {
      if (prisma && (await isDatabaseAvailable())) {
        const drug = await prisma.drug.findUnique({
          where: { id },
          include: {
            aliases: true,
            identifiers: true,
            diseaseRules: true,
            allergyRules: true,
          },
        });
        if (drug) return drug;
      }
    } catch {
      // Fallback
    }

    return IN_MEMORY_DRUGS.find((d) => d.id === id) || null;
  },

  async findByNameOrAlias(name) {
    const clean = name.trim().toLowerCase();

    try {
      if (prisma && (await isDatabaseAvailable())) {
        const drug = await prisma.drug.findFirst({
          where: {
            OR: [
              { genericName: { equals: name.trim(), mode: 'insensitive' } },
              { brandName: { equals: name.trim(), mode: 'insensitive' } },
              { activeIngredient: { equals: name.trim(), mode: 'insensitive' } },
              { aliases: { some: { alias: { equals: name.trim(), mode: 'insensitive' } } } },
              { identifiers: { some: { value: { equals: name.trim(), mode: 'insensitive' } } } },
            ],
          },
          include: {
            aliases: true,
            identifiers: true,
          },
        });
        if (drug) return drug;
      }
    } catch {
      // Fallback to in-memory clinical formulary
    }

    return (
      IN_MEMORY_DRUGS.find(
        (d) =>
          d.genericName.toLowerCase() === clean ||
          d.brandName.toLowerCase() === clean ||
          d.activeIngredient.toLowerCase() === clean ||
          d.aliases.some((a) => a.alias.toLowerCase() === clean) ||
          d.identifiers.some((i) => i.value === clean)
      ) || null
    );
  },

  async search(params = {}) {
    const { search = '', drugClass, limit = 20, page = 1, sortBy = 'genericName', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;

    try {
      if (prisma && (await isDatabaseAvailable())) {
        const where = {};
        if (drugClass) {
          where.drugClass = { equals: drugClass, mode: 'insensitive' };
        }

        if (search && search.trim().length > 0) {
          const q = search.trim();
          where.OR = [
            { genericName: { contains: q, mode: 'insensitive' } },
            { brandName: { contains: q, mode: 'insensitive' } },
            { activeIngredient: { contains: q, mode: 'insensitive' } },
            { drugClass: { contains: q, mode: 'insensitive' } },
            { rxNormCode: { contains: q, mode: 'insensitive' } },
            { aliases: { some: { alias: { contains: q, mode: 'insensitive' } } } },
            { identifiers: { some: { value: { contains: q, mode: 'insensitive' } } } },
          ];
        }

        const [drugs, total] = await Promise.all([
          prisma.drug.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
              aliases: true,
              identifiers: true,
            },
          }),
          prisma.drug.count({ where }),
        ]);

        if (drugs.length > 0 || !search) {
          return { drugs, total, page, limit };
        }
      }
    } catch {
      // Fallback
    }

    // In-memory fallback
    const q = search.toLowerCase().trim();
    let results = IN_MEMORY_DRUGS.filter(
      (d) =>
        !q ||
        d.genericName.toLowerCase().includes(q) ||
        d.brandName.toLowerCase().includes(q) ||
        d.activeIngredient.toLowerCase().includes(q) ||
        d.drugClass.toLowerCase().includes(q) ||
        (d.rxNormCode && d.rxNormCode.includes(q)) ||
        d.aliases.some((a) => a.alias.toLowerCase().includes(q))
    );

    if (drugClass) {
      results = results.filter((d) => d.drugClass.toLowerCase() === drugClass.toLowerCase());
    }

    return {
      drugs: results.slice(skip, skip + limit),
      total: results.length,
      page,
      limit,
    };
  },

  async findAllClasses() {
    try {
      if (prisma) {
        const results = await prisma.drug.findMany({
          select: { drugClass: true },
          distinct: ['drugClass'],
          orderBy: { drugClass: 'asc' },
        });
        if (results.length > 0) return results.map((r) => r.drugClass).filter(Boolean);
      }
    } catch {
      // Fallback
    }

    return Array.from(new Set(IN_MEMORY_DRUGS.map((d) => d.drugClass)));
  },

  async getInteractions(drugId) {
    try {
      if (prisma) {
        const [asDrugA, asDrugB] = await Promise.all([
          prisma.drugInteraction.findMany({
            where: { drugAId: drugId, status: 'ACTIVE' },
            include: { drugB: true },
          }),
          prisma.drugInteraction.findMany({
            where: { drugBId: drugId, status: 'ACTIVE' },
            include: { drugA: true },
          }),
        ]);
        return [...asDrugA, ...asDrugB];
      }
    } catch {
      // Fallback
    }
    return [];
  },

  async create(data) {
    try {
      if (prisma) {
        const { aliases = [], identifiers = [], ...drugData } = data;
        return await prisma.drug.create({
          data: {
            ...drugData,
            aliases: {
              create: aliases.map((alias) => ({ alias, type: 'BRAND' })),
            },
            identifiers: {
              create: identifiers.map((ident) => ({ type: ident.type, value: ident.value })),
            },
          },
          include: {
            aliases: true,
            identifiers: true,
          },
        });
      }
    } catch {
      // Fallback
    }

    const newDrug = { id: `drg-${Date.now()}`, ...data, aliases: [], identifiers: [] };
    IN_MEMORY_DRUGS.push(newDrug);
    return newDrug;
  },
};

