import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DrugSafe clinical database with verified demonstration data...');

  const devPasswordHash = await bcrypt.hash('Password123!', 12);

  // 1. Seed Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'David Vance',
      email: 'admin@example.com',
      passwordHash: devPasswordHash,
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      emailVerified: true,
      department: 'Clinical Systems Engineering',
    },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@example.com' },
    update: {},
    create: {
      name: 'Dr. Marcus Chen, MD',
      email: 'doctor@example.com',
      passwordHash: devPasswordHash,
      role: UserRole.DOCTOR,
      status: 'ACTIVE',
      emailVerified: true,
      department: 'Internal Medicine & Cardiology',
      licenseNumber: 'CA-MD-89210',
    },
  });

  const pharmacistUser = await prisma.user.upsert({
    where: { email: 'pharmacist@example.com' },
    update: {},
    create: {
      name: 'Elena Rostova, PharmD',
      email: 'pharmacist@example.com',
      passwordHash: devPasswordHash,
      role: UserRole.PHARMACIST,
      status: 'ACTIVE',
      emailVerified: true,
      department: 'Clinical Pharmacy Services',
      licenseNumber: 'RPH-55419',
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      name: 'Sarah Jenkins',
      email: 'patient@example.com',
      passwordHash: devPasswordHash,
      role: UserRole.PATIENT,
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  console.log('✔ Seeded verified clinical users (Admin, Doctor, Pharmacist, Patient)');

  // 1b. Seed 4-Role Dedicated Clinical Profiles
  await prisma.adminProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      adminLevel: 'SUPER_ADMIN',
      department: 'Clinical Systems Engineering',
      employeeId: 'EMP-ADM-001',
      canAudit: true,
      canManageUsers: true,
      canManageRules: true,
    },
  });

  await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      specialty: 'Internal Medicine & Cardiology',
      licenseNumber: 'CA-MD-89210',
      npiNumber: '1982736450',
      deaNumber: 'BC1234567',
      hospitalAffiliation: 'St. Jude Health System',
      phone: '+1 (555) 234-5678',
      officeLocation: 'Suite 400, Cardiology Clinic',
      consultationHours: 'Mon-Thu 08:00-16:00',
    },
  });

  await prisma.pharmacistProfile.upsert({
    where: { userId: pharmacistUser.id },
    update: {},
    create: {
      userId: pharmacistUser.id,
      licenseNumber: 'RPH-55419',
      licenseState: 'CA',
      pharmacyName: 'DrugSafe Central Clinical Pharmacy',
      pharmacyNpi: '1092837465',
      workShift: 'Day Shift (07:00 - 15:30)',
      phone: '+1 (555) 345-6789',
    },
  });

  console.log('✔ Seeded dedicated clinical role profiles (DoctorProfile, PharmacistProfile, AdminProfile)');

  // 2. Seed Patient Profile for Sarah Jenkins
  const patientRecord = await prisma.patient.upsert({
    where: { mrn: 'MRN-84920' },
    update: {},
    create: {
      userId: patientUser.id,
      mrn: 'MRN-84920',
      dateOfBirth: new Date('1959-04-12'),
      age: 67,
      gender: 'Female',
      bloodGroup: 'A+',
      weightKg: 64.5,
      heightCm: 162,
      phone: '+1 (555) 342-8891',
      emergencyContact: 'Mark Jenkins (Spouse) - +1 (555) 342-8892',
      primaryDoctor: 'Dr. Marcus Chen, MD',
      primaryDoctorId: doctorUser.id,
      medicalHistory: 'Hypertension, Atrial Fibrillation, Type 2 Diabetes, Stage 3a Chronic Kidney Disease.',
    },
  });

  // Conditions
  await prisma.patientCondition.deleteMany({ where: { patientId: patientRecord.id } });
  await prisma.patientCondition.createMany({
    data: [
      {
        patientId: patientRecord.id,
        conditionName: 'Chronic Kidney Disease (Stage 3a)',
        icd10Code: 'N18.31',
        status: 'Active',
      },
      {
        patientId: patientRecord.id,
        conditionName: 'Essential Hypertension',
        icd10Code: 'I10',
        status: 'Active',
      },
      {
        patientId: patientRecord.id,
        conditionName: 'Nonvalvular Atrial Fibrillation',
        icd10Code: 'I48.0',
        status: 'Active',
      },
    ],
  });

  // Allergies
  await prisma.patientAllergy.deleteMany({ where: { patientId: patientRecord.id } });
  await prisma.patientAllergy.createMany({
    data: [
      {
        patientId: patientRecord.id,
        allergen: 'Penicillin',
        reaction: 'Anaphylaxis, Urticaria',
        severity: 'Severe',
      },
      {
        patientId: patientRecord.id,
        allergen: 'Sulfa Drugs',
        reaction: 'Erythematous Maculopapular Rash',
        severity: 'Moderate',
      },
    ],
  });

  // Labs
  await prisma.labResult.deleteMany({ where: { patientId: patientRecord.id } });
  await prisma.labResult.createMany({
    data: [
      {
        patientId: patientRecord.id,
        testName: 'eGFR (CKD-EPI)',
        value: '48',
        unit: 'mL/min/1.73m2',
        referenceRange: '> 60',
        interpretation: 'Low',
        testDate: new Date('2026-08-15'),
      },
      {
        patientId: patientRecord.id,
        testName: 'Serum Creatinine',
        value: '1.4',
        unit: 'mg/dL',
        referenceRange: '0.6 - 1.1',
        interpretation: 'High',
        testDate: new Date('2026-08-15'),
      },
      {
        patientId: patientRecord.id,
        testName: 'Serum Potassium',
        value: '4.7',
        unit: 'mEq/L',
        referenceRange: '3.5 - 5.0',
        interpretation: 'Normal',
        testDate: new Date('2026-08-15'),
      },
    ],
  });

  // 3. Seed Curated Drug Formulary
  const drugsData = [
    {
      brandName: 'Coumadin',
      genericName: 'Warfarin Sodium',
      drugClass: 'Vitamin K Antagonist Anticoagulant',
      activeIngredient: 'Warfarin',
      rxNormCode: '855332',
      atcCode: 'B01AA03',
      strength: '5 mg',
      dosageForm: 'Tablet',
      route: 'Oral',
      blackBoxWarning: true,
      description: 'Anticoagulant indicated for the prophylaxis and treatment of venous thrombosis, pulmonary embolism, and thromboembolic complications associated with atrial fibrillation.',
    },
    {
      brandName: 'Bayer Aspirin',
      genericName: 'Aspirin',
      drugClass: 'Salicylate / Antiplatelet / NSAID',
      activeIngredient: 'Acetylsalicylic Acid',
      rxNormCode: '1191',
      atcCode: 'B01AC06',
      strength: '81 mg',
      dosageForm: 'Enteric Coated Tablet',
      route: 'Oral',
      blackBoxWarning: false,
      description: 'Inhibits platelet aggregation by irreversible inhibition of platelet cyclooxygenase-1 (COX-1). Indicated for secondary prevention of cardiovascular events.',
    },
    {
      brandName: 'Zestril',
      genericName: 'Lisinopril',
      drugClass: 'Angiotensin Converting Enzyme (ACE) Inhibitor',
      activeIngredient: 'Lisinopril',
      rxNormCode: '29046',
      atcCode: 'C09AA03',
      strength: '20 mg',
      dosageForm: 'Tablet',
      route: 'Oral',
      blackBoxWarning: true,
      description: 'Suppresses the renin-angiotensin-aldosterone system. Indicated for treatment of hypertension, heart failure, and acute myocardial infarction.',
    },
    {
      brandName: 'Glucophage',
      genericName: 'Metformin Hydrochloride',
      drugClass: 'Biguanide Antidiabetic Agent',
      activeIngredient: 'Metformin',
      rxNormCode: '6809',
      atcCode: 'A10BA02',
      strength: '500 mg',
      dosageForm: 'Tablet',
      route: 'Oral',
      blackBoxWarning: true,
      description: 'Decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity. First-line therapy for type 2 diabetes.',
    },
    {
      brandName: 'Amoxil',
      genericName: 'Amoxicillin',
      drugClass: 'Aminopenicillin Antibiotic',
      activeIngredient: 'Amoxicillin',
      rxNormCode: '723',
      atcCode: 'J01CA04',
      strength: '500 mg',
      dosageForm: 'Capsule',
      route: 'Oral',
      blackBoxWarning: false,
      description: 'Bactericidal antibiotic active against susceptible Gram-positive and Gram-negative organisms by inhibiting bacterial cell wall synthesis.',
    },
    {
      brandName: 'Zocor',
      genericName: 'Simvastatin',
      drugClass: 'HMG-CoA Reductase Inhibitor (Statin)',
      activeIngredient: 'Simvastatin',
      rxNormCode: '36567',
      atcCode: 'C10AA01',
      strength: '40 mg',
      dosageForm: 'Tablet',
      route: 'Oral',
      blackBoxWarning: false,
      description: 'Inhibits 3-hydroxy-3-methylglutaryl-coenzyme A reductase to lower plasma cholesterol and lipoprotein levels.',
    },
    {
      brandName: 'Biaxin',
      genericName: 'Clarithromycin',
      drugClass: 'Macrolide Antibiotic / Potent CYP3A4 Inhibitor',
      activeIngredient: 'Clarithromycin',
      rxNormCode: '21212',
      atcCode: 'J01FA09',
      strength: '500 mg',
      dosageForm: 'Tablet',
      route: 'Oral',
      blackBoxWarning: false,
      description: 'Macrolide antibacterial that binds to the 50S ribosomal subunit. Potent mechanism-based inhibitor of cytochrome P450 3A4.',
    },
    {
      brandName: 'Aldactone',
      genericName: 'Spironolactone',
      drugClass: 'Aldosterone Receptor Antagonist / Potassium-Sparing Diuretic',
      activeIngredient: 'Spironolactone',
      rxNormCode: '9997',
      atcCode: 'C03DA01',
      strength: '25 mg',
      dosageForm: 'Tablet',
      route: 'Oral',
      blackBoxWarning: false,
      description: 'Competitively blocks aldosterone receptors in the late distal convoluted tubule and collecting duct, promoting sodium excretion and potassium retention.',
    },
    {
      brandName: 'Tylenol Extra Strength',
      genericName: 'Acetaminophen',
      drugClass: 'Analgesic and Antipyretic',
      activeIngredient: 'Acetaminophen',
      rxNormCode: '161',
      atcCode: 'N02BE01',
      strength: '500 mg',
      dosageForm: 'Tablet',
      route: 'Oral',
      blackBoxWarning: true,
      description: 'Centrally acting analgesic and antipyretic. Must not exceed 4,000 mg/day across all sources.',
    },
    {
      brandName: 'Advil',
      genericName: 'Ibuprofen',
      drugClass: 'Nonsteroidal Anti-inflammatory Drug (NSAID)',
      activeIngredient: 'Ibuprofen',
      rxNormCode: '5640',
      atcCode: 'M01AE01',
      strength: '400 mg',
      dosageForm: 'Tablet',
      route: 'Oral',
      blackBoxWarning: true,
      description: 'Reversibly inhibits COX-1 and COX-2 enzymes, decreasing prostaglandin synthesis.',
    },
  ];

  const seededDrugs = {};
  for (const d of drugsData) {
    const created = await prisma.drug.create({
      data: d,
    });
    seededDrugs[d.genericName] = created;

    // Add Brand Alias
    await prisma.drugAlias.create({
      data: {
        drugId: created.id,
        alias: d.brandName,
        type: 'BRAND',
      },
    });
  }

  console.log('✔ Seeded 10 verified pharmaceutical formularies and aliases');

  // 4. Seed Verified Drug Interactions
  const warfarin = seededDrugs['Warfarin Sodium'];
  const aspirin = seededDrugs['Aspirin'];
  const simvastatin = seededDrugs['Simvastatin'];
  const clarithromycin = seededDrugs['Clarithromycin'];
  const lisinopril = seededDrugs['Lisinopril'];
  const spironolactone = seededDrugs['Spironolactone'];

  if (warfarin && aspirin) {
    await prisma.drugInteraction.create({
      data: {
        drugAId: warfarin.id,
        drugBId: aspirin.id,
        severity: 'CRITICAL',
        title: 'Severe Gastrointestinal & Major Hemorrhage Risk',
        clinicalEffect:
          'Concurrent administration markedly potentiates systemic hypoprothrombinemic effect and suppresses platelet aggregation, yielding up to a 4-fold increase in major gastrointestinal hemorrhage.',
        mechanism:
          'Additive pharmacodynamic anticoagulant and antiplatelet inhibition; aspirin also displaces warfarin from albumin binding sites and exerts direct topical gastric mucosal erosion.',
        management:
          'Avoid combination unless specifically indicated (e.g. mechanical heart valve). If co-prescribed, add gastric protection (PPI) and monitor INR diligently.',
        evidenceLevel: 'Level 1 (RCT / Meta-analysis)',
        sourceId: 'FDA Approved Package Labeling & CHEST Guidelines 2024',
        status: 'ACTIVE',
      },
    });
  }

  if (simvastatin && clarithromycin) {
    await prisma.drugInteraction.create({
      data: {
        drugAId: simvastatin.id,
        drugBId: clarithromycin.id,
        severity: 'CRITICAL',
        title: 'Severe Rhabdomyolysis & Acute Myopathy Contraindication',
        clinicalEffect:
          'Marked increase in simvastatin plasma AUC (up to 10-fold), causing extreme risk of severe skeletal muscle breakdown (rhabdomyolysis), myoglobinuria, and fatal acute renal failure.',
        mechanism:
          'Potent irreversible time-dependent inhibition of cytochrome P450 3A4 (CYP3A4) enzyme system responsible for extensive first-pass hepatic metabolism of simvastatin.',
        management:
          'Co-administration is contraindicated. Temporarily suspend simvastatin therapy throughout clarithromycin course, or select an alternative antibiotic.',
        evidenceLevel: 'Level 1 (FDA Approved Labeling & Warning)',
        sourceId: 'DailyMed / FDA MedWatch Alerts',
        status: 'ACTIVE',
      },
    });
  }

  if (lisinopril && spironolactone) {
    await prisma.drugInteraction.create({
      data: {
        drugAId: lisinopril.id,
        drugBId: spironolactone.id,
        severity: 'MAJOR',
        title: 'Severe Hyperkalemia Risk',
        clinicalEffect:
          'Additive potassium retention producing life-threatening cardiac arrhythmias, muscle weakness, and cardiac arrest.',
        mechanism:
          'Concurrent inhibition of aldosterone synthesis (via ACE inhibition) and competitive blockade of mineralocorticoid receptors in the distal renal tubules prevents normal kaliuresis.',
        management:
          'Check baseline serum potassium and renal function before starting. Re-check potassium at 3 days, 1 week, and monthly. Discontinue potassium supplements.',
        evidenceLevel: 'Level 1 (RCT / Meta-analysis)',
        sourceId: 'AHA/ACC Heart Failure Guidelines',
        status: 'ACTIVE',
      },
    });
  }

  // 5. Seed Knowledge Sources
  await prisma.knowledgeSource.createMany({
    data: [
      {
        sourceName: 'RxNorm',
        type: 'Standardized Clinical Drug Vocabulary & Ontology',
        summary: 'Produced by the U.S. National Library of Medicine (NLM); provides normalized names and identifiers for clinical drugs and links to international drug information systems.',
        url: 'https://www.nlm.nih.gov/research/umls/rxnorm/',
        version: '2026-08 Monthly Full Release',
        lastUpdated: new Date(),
        status: 'ACTIVE',
      },
      {
        sourceName: 'DailyMed (NIH/NLM)',
        type: 'Official FDA Approved Drug Labeling (SPL)',
        summary: 'Trustworthy repository of structured product labels (SPL) submitted to the FDA, containing black box warnings, contraindications, adverse reactions, and clinical pharmacology.',
        url: 'https://dailymed.nlm.nih.gov/',
        version: 'API v2.4 Live Sync',
        lastUpdated: new Date(),
        status: 'ACTIVE',
      },
      {
        sourceName: 'openFDA Drug Adverse Events & Recalls',
        type: 'FDA Post-Market Surveillance & Enforcement Index',
        summary: 'Direct programmatic access to FDA drug adverse events, recalls, NDC directory, and labeling data for real-world pharmacovigilance.',
        url: 'https://open.fda.gov/apis/drug/',
        version: 'Quarterly Aggregated v2',
        lastUpdated: new Date(),
        status: 'ACTIVE',
      },
    ],
  });

  console.log('✔ Seeded verified clinical knowledge sources and evidence documents');
  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

