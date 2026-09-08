'use strict';

/*
 * Development seed data.
 *
 * The clinical content below is a small, clearly labelled DEMONSTRATION dataset
 * used to exercise the deterministic safety engines. It is not a curated
 * clinical knowledge base and must be replaced with a licensed, reviewed source
 * before any real clinical use.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_SOURCE_NAME = 'DrugSafe Demonstration Dataset (NOT FOR CLINICAL USE)';

const seedPassword = (key, fallback) => {
  const value = process.env[key];
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${key} must be set; refusing to seed default credentials in production`);
  }
  return fallback;
};

const users = [
  { email: 'admin@example.com', name: 'Demo Admin', role: 'ADMIN', passwordKey: 'SEED_ADMIN_PASSWORD', fallback: 'DevAdmin!2345' },
  { email: 'doctor@example.com', name: 'Demo Doctor', role: 'DOCTOR', passwordKey: 'SEED_DOCTOR_PASSWORD', fallback: 'DevDoctor!2345' },
  { email: 'pharmacist@example.com', name: 'Demo Pharmacist', role: 'PHARMACIST', passwordKey: 'SEED_PHARMACIST_PASSWORD', fallback: 'DevPharm!2345' },
  { email: 'patient@example.com', name: 'Demo Patient', role: 'PATIENT', passwordKey: 'SEED_PATIENT_PASSWORD', fallback: 'DevPatient!2345' },
];

const ingredients = [
  'warfarin',
  'ibuprofen',
  'naproxen',
  'lisinopril',
  'spironolactone',
  'metformin',
  'amoxicillin',
  'clavulanic acid',
];

const drugClasses = [
  { name: 'Vitamin K antagonist' },
  { name: 'NSAID' },
  { name: 'ACE inhibitor' },
  { name: 'Potassium-sparing diuretic' },
  { name: 'Biguanide' },
  { name: 'Penicillin antibiotic' },
];

const drugs = [
  { generic: 'Warfarin', brand: 'Coumadin', className: 'Vitamin K antagonist', ingredients: ['warfarin'], aliases: ['coumadin', 'warfarin sodium'] },
  { generic: 'Ibuprofen', brand: 'Advil', className: 'NSAID', ingredients: ['ibuprofen'], aliases: ['advil', 'brufen'] },
  { generic: 'Naproxen', brand: 'Aleve', className: 'NSAID', ingredients: ['naproxen'], aliases: ['aleve'] },
  { generic: 'Lisinopril', brand: 'Zestril', className: 'ACE inhibitor', ingredients: ['lisinopril'], aliases: ['zestril'] },
  { generic: 'Spironolactone', brand: 'Aldactone', className: 'Potassium-sparing diuretic', ingredients: ['spironolactone'], aliases: ['aldactone'] },
  { generic: 'Metformin', brand: 'Glucophage', className: 'Biguanide', ingredients: ['metformin'], aliases: ['glucophage'] },
  { generic: 'Amoxicillin', brand: 'Amoxil', className: 'Penicillin antibiotic', ingredients: ['amoxicillin'], aliases: ['amoxil'] },
  {
    generic: 'Amoxicillin/Clavulanate',
    brand: 'Augmentin',
    className: 'Penicillin antibiotic',
    ingredients: ['amoxicillin', 'clavulanic acid'],
    aliases: ['augmentin', 'co-amoxiclav'],
  },
];

const conditions = [
  { name: 'Chronic kidney disease', code: 'N18' },
  { name: 'Peptic ulcer disease', code: 'K27' },
  { name: 'Hyperkalemia', code: 'E87.5' },
];

async function upsertUsers() {
  const created = {};
  for (const user of users) {
    const password = seedPassword(user.passwordKey, user.fallback);
    const passwordHash = await bcrypt.hash(password, 12);
    created[user.role] = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, emailVerified: true },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash,
        emailVerified: true,
      },
    });
  }
  return created;
}

async function upsertCatalog() {
  const classMap = {};
  for (const cls of drugClasses) {
    classMap[cls.name] = await prisma.drugClass.upsert({
      where: { name: cls.name },
      update: {},
      create: cls,
    });
  }

  const ingredientMap = {};
  for (const name of ingredients) {
    ingredientMap[name] = await prisma.ingredient.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const drugMap = {};
  for (const drug of drugs) {
    const existing = await prisma.drug.findFirst({ where: { genericName: drug.generic } });
    const record =
      existing ||
      (await prisma.drug.create({
        data: {
          genericName: drug.generic,
          brandName: drug.brand,
          drugClassId: classMap[drug.className].id,
        },
      }));
    drugMap[drug.generic] = record;

    for (const ingredientName of drug.ingredients) {
      await prisma.drugIngredient.upsert({
        where: { drugId_ingredientId: { drugId: record.id, ingredientId: ingredientMap[ingredientName].id } },
        update: {},
        create: { drugId: record.id, ingredientId: ingredientMap[ingredientName].id },
      });
    }

    for (const alias of drug.aliases) {
      await prisma.drugAlias.upsert({
        where: { drugId_alias: { drugId: record.id, alias } },
        update: {},
        create: { drugId: record.id, alias, type: alias === drug.brand?.toLowerCase() ? 'BRAND' : 'SYNONYM' },
      });
    }
  }

  const conditionMap = {};
  for (const condition of conditions) {
    conditionMap[condition.name] = await prisma.condition.upsert({
      where: { name: condition.name },
      update: {},
      create: condition,
    });
  }

  return { classMap, ingredientMap, drugMap, conditionMap };
}

async function upsertKnowledge() {
  const source = await prisma.knowledgeSource.upsert({
    where: { name: DEMO_SOURCE_NAME },
    update: {},
    create: {
      name: DEMO_SOURCE_NAME,
      description:
        'Illustrative rule set bundled with the DrugSafe development environment. Every entry must be replaced by a licensed, clinically reviewed source before production use.',
      version: 'demo-1',
    },
  });

  const document = await prisma.knowledgeDocument.findFirst({
    where: { sourceId: source.id, title: 'Demonstration interaction notes' },
  });

  const doc =
    document ||
    (await prisma.knowledgeDocument.create({
      data: {
        sourceId: source.id,
        title: 'Demonstration interaction notes',
        reference: 'internal://demo/interaction-notes',
        version: 'demo-1',
        evidenceLevel: 'DEMONSTRATION',
        retrievedAt: new Date(),
        reviewedAt: new Date(),
        content:
          'Demonstration content used to exercise the evidence pipeline. It records only widely documented, textbook-level pharmacology statements and is not a substitute for a curated clinical source.',
      },
    }));

  return { source, doc };
}

async function upsertRules({ drugMap, ingredientMap, classMap, conditionMap }, { source, doc }) {
  const evidence = { sourceId: source.id, documentId: doc.id, evidenceLevel: 'DEMONSTRATION', reviewedAt: new Date() };

  const canonicalPair = (a, b) => (a.id < b.id ? [a.id, b.id] : [b.id, a.id]);

  const interactions = [
    {
      pair: canonicalPair(drugMap.Warfarin, drugMap.Ibuprofen),
      severity: 'MAJOR',
      clinicalEffect: 'Increased risk of gastrointestinal and other bleeding.',
      mechanism: 'NSAID antiplatelet effect and gastric mucosal injury added to anticoagulation.',
      management: 'Avoid the combination where possible; if unavoidable, monitor for bleeding and consider gastroprotection.',
    },
    {
      pair: canonicalPair(drugMap.Warfarin, drugMap.Naproxen),
      severity: 'MAJOR',
      clinicalEffect: 'Increased risk of gastrointestinal and other bleeding.',
      mechanism: 'NSAID antiplatelet effect and gastric mucosal injury added to anticoagulation.',
      management: 'Avoid the combination where possible; if unavoidable, monitor for bleeding and consider gastroprotection.',
    },
    {
      pair: canonicalPair(drugMap.Lisinopril, drugMap.Spironolactone),
      severity: 'MODERATE',
      clinicalEffect: 'Risk of hyperkalemia.',
      mechanism: 'Both agents reduce potassium excretion.',
      management: 'Monitor serum potassium and renal function.',
    },
  ];

  for (const item of interactions) {
    const [drugAId, drugBId] = item.pair;
    await prisma.drugInteraction.upsert({
      where: { drugAId_drugBId_version: { drugAId, drugBId, version: 1 } },
      update: {},
      create: {
        drugAId,
        drugBId,
        severity: item.severity,
        clinicalEffect: item.clinicalEffect,
        mechanism: item.mechanism,
        management: item.management,
        ...evidence,
      },
    });
  }

  const diseaseRules = [
    {
      drug: drugMap.Ibuprofen,
      condition: conditionMap['Peptic ulcer disease'],
      ruleType: 'CONTRAINDICATION',
      severity: 'CONTRAINDICATED',
      description: 'NSAIDs can worsen or reactivate peptic ulcer disease.',
      management: 'Prefer a non-NSAID analgesic.',
    },
    {
      drug: drugMap.Spironolactone,
      condition: conditionMap.Hyperkalemia,
      ruleType: 'CONTRAINDICATION',
      severity: 'CONTRAINDICATED',
      description: 'Potassium-sparing diuretics further raise serum potassium.',
      management: 'Correct potassium before use and select an alternative diuretic.',
    },
    {
      drug: drugMap.Metformin,
      condition: conditionMap['Chronic kidney disease'],
      ruleType: 'PRECAUTION',
      severity: 'MAJOR',
      description: 'Reduced renal clearance of metformin increases lactic acidosis risk.',
      management: 'Assess eGFR before and during therapy and adjust or withhold accordingly.',
    },
  ];

  for (const rule of diseaseRules) {
    await prisma.drugDiseaseRule.upsert({
      where: { drugId_conditionId_version: { drugId: rule.drug.id, conditionId: rule.condition.id, version: 1 } },
      update: {},
      create: {
        drugId: rule.drug.id,
        conditionId: rule.condition.id,
        ruleType: rule.ruleType,
        severity: rule.severity,
        description: rule.description,
        management: rule.management,
        ...evidence,
      },
    });
  }

  const allergyRules = [
    {
      allergen: 'penicillin',
      relation: 'CLASS',
      drugClassId: classMap['Penicillin antibiotic'].id,
      severity: 'CONTRAINDICATED',
      description: 'Documented penicillin allergy contraindicates penicillin-class antibiotics.',
      management: 'Select a non-beta-lactam alternative unless the allergy has been formally de-labelled.',
      certain: true,
    },
    {
      allergen: 'ibuprofen',
      relation: 'INGREDIENT',
      ingredientId: ingredientMap.ibuprofen.id,
      severity: 'CONTRAINDICATED',
      description: 'Documented ibuprofen allergy contraindicates ibuprofen-containing products.',
      management: 'Avoid ibuprofen-containing products.',
      certain: true,
    },
  ];

  for (const rule of allergyRules) {
    const existing = await prisma.drugAllergyRule.findFirst({
      where: { allergen: rule.allergen, relation: rule.relation, version: 1 },
    });
    if (!existing) {
      await prisma.drugAllergyRule.create({ data: { ...rule, ...evidence } });
    }
  }

  const duplicationRules = [
    {
      ruleType: 'THERAPEUTIC',
      drugClassId: classMap.NSAID.id,
      severity: 'MODERATE',
      description: 'Concurrent use of two NSAIDs increases toxicity without added analgesic benefit.',
      management: 'Use a single NSAID at the lowest effective dose.',
    },
  ];

  for (const rule of duplicationRules) {
    const existing = await prisma.duplicationRule.findFirst({
      where: { ruleType: rule.ruleType, drugClassId: rule.drugClassId, version: 1 },
    });
    if (!existing) {
      await prisma.duplicationRule.create({ data: { ...rule, ...evidence } });
    }
  }

  const factorRules = [
    {
      drugId: drugMap.Metformin.id,
      factorType: 'LAB_VALUE',
      labCode: 'EGFR',
      operator: 'LT',
      threshold: 30,
      unit: 'mL/min/1.73m2',
      severity: 'CONTRAINDICATED',
      description: 'Metformin is contraindicated when eGFR is below 30 mL/min/1.73m2.',
      management: 'Stop metformin and select an alternative glucose-lowering agent.',
    },
  ];

  for (const rule of factorRules) {
    const existing = await prisma.patientFactorRule.findFirst({
      where: { drugId: rule.drugId, factorType: rule.factorType, labCode: rule.labCode, version: 1 },
    });
    if (!existing) {
      await prisma.patientFactorRule.create({ data: { ...rule, ...evidence } });
    }
  }
}

async function upsertPatient(createdUsers, { drugMap, conditionMap }) {
  const patient = await prisma.patient.upsert({
    where: { userId: createdUsers.PATIENT.id },
    update: {},
    create: {
      userId: createdUsers.PATIENT.id,
      dateOfBirth: new Date('1955-04-12'),
      sex: 'female',
      heightCm: 165,
      weightKg: 72,
      medicalHistory: 'Demonstration patient record.',
    },
  });

  for (const clinician of [createdUsers.DOCTOR, createdUsers.PHARMACIST]) {
    await prisma.careTeamMember.upsert({
      where: { patientId_userId: { patientId: patient.id, userId: clinician.id } },
      update: { status: 'ACTIVE' },
      create: { patientId: patient.id, userId: clinician.id },
    });
  }

  await prisma.patientCondition.upsert({
    where: {
      patientId_conditionId: { patientId: patient.id, conditionId: conditionMap['Chronic kidney disease'].id },
    },
    update: {},
    create: { patientId: patient.id, conditionId: conditionMap['Chronic kidney disease'].id },
  });

  const existingAllergy = await prisma.patientAllergy.findFirst({
    where: { patientId: patient.id, allergen: 'penicillin' },
  });
  if (!existingAllergy) {
    await prisma.patientAllergy.create({
      data: { patientId: patient.id, allergen: 'penicillin', reaction: 'rash', severity: 'MODERATE' },
    });
  }

  for (const generic of ['Warfarin', 'Ibuprofen', 'Metformin']) {
    const existing = await prisma.patientMedication.findFirst({
      where: { patientId: patient.id, drugId: drugMap[generic].id },
    });
    if (!existing) {
      await prisma.patientMedication.create({
        data: {
          patientId: patient.id,
          drugId: drugMap[generic].id,
          rawName: generic,
          source: 'CLINICIAN_ENTERED',
        },
      });
    }
  }

  const existingLab = await prisma.labResult.findFirst({ where: { patientId: patient.id, code: 'EGFR' } });
  if (!existingLab) {
    await prisma.labResult.create({
      data: { patientId: patient.id, code: 'EGFR', name: 'Estimated GFR', value: 26, unit: 'mL/min/1.73m2' },
    });
  }

  return patient;
}

async function main() {
  const createdUsers = await upsertUsers();
  const catalog = await upsertCatalog();
  const knowledge = await upsertKnowledge();
  await upsertRules(catalog, knowledge);
  await upsertPatient(createdUsers, catalog);
  // eslint-disable-next-line no-console
  console.log('Seed complete. Demo clinical data is illustrative only.');
}

main()
  .catch((err) => {
     
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
