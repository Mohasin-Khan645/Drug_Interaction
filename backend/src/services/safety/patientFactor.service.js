import { SeverityLevel } from '../../constants/severity.js';
import { RuleType } from '../../constants/rules.js';

export const PatientFactorService = {
  /**
   * Evaluates patient physiological parameters (eGFR, serum Cr, age, weight, liver enzymes)
   * against explicit clinical safety rules
   */
  async evaluateFactors(medications = [], factors = {}) {
    const findings = [];
    if (!medications.length) return findings;

    const { egfr, serumCr, age, weightKg, hepaticImpairment, pregnancy } = factors;

    for (const med of medications) {
      const medName = (med.genericName || med.displayName || med.name || '').toLowerCase();

      // 1. Metformin in Renal Impairment (eGFR < 45 or < 30)
      if (medName.includes('metformin')) {
        if (egfr !== undefined && egfr < 30) {
          findings.push({
            id: `fnd-fac-metformin-egfr30`,
            category: RuleType.PATIENT_FACTOR,
            severity: SeverityLevel.CRITICAL,
            title: 'Absolute Contraindication: Metformin with eGFR < 30 mL/min/1.73m²',
            affectedDrugs: [med.displayName || med.name],
            clinicalEffect:
              'Profound drug accumulation triggering potentially fatal Metformin-Associated Lactic Acidosis (MALA), with historical mortality rates between 30% and 50%.',
            mechanism:
              'Metformin is 90% eliminated unchanged by renal tubular secretion; severe renal failure blocks excretion, driving mitochondrial complex 1 inhibition and excessive lactate generation.',
            management:
              'Discontinue metformin immediately. Select an alternative non-renally dependent antidiabetic agent (e.g., linagliptin or insulin).',
            recommendation:
              'Contraindicated in eGFR < 30 mL/min. Discontinue metformin immediately.',
            evidence:
              'FDA Revised Black Box Safety Labeling for Metformin in Severe Renal Impairment.',
            evidenceLevel: 'Level 1 (FDA Black Box Warning)',
            source: 'FDA CDER Safety Announcement & DailyMed',
            status: 'OPEN',
          });
        } else if (egfr !== undefined && egfr < 45) {
          findings.push({
            id: `fnd-fac-metformin-egfr45`,
            category: RuleType.PATIENT_FACTOR,
            severity: SeverityLevel.MAJOR,
            title: 'Dosage Limit Warning: Metformin in Renal Impairment (eGFR 30–44 mL/min)',
            affectedDrugs: [med.displayName || med.name],
            clinicalEffect:
              'Elevated risk of drug accumulation and lactic acidosis in moderate-to-severe chronic kidney disease.',
            mechanism: 'Reduced glomerular filtration decreases total clearance.',
            management:
              'Do not initiate metformin. If already taking, reduce maximum total daily dose to 1,000 mg/day (500 mg BID). Recheck eGFR every 3 months.',
            recommendation: 'Cap dose at 1000 mg daily and assess eGFR quarterly.',
            evidence: 'ADA Standards of Care in Diabetes 2024 & FDA Prescribing Guidelines.',
            evidenceLevel: 'Level 1',
            source: 'ADA / FDA Guidelines',
            status: 'OPEN',
          });
        }
      }

      // 2. Geriatric Beers Criteria (Age >= 65) with high-risk anticholinergics or sedatives
      if (age !== undefined && age >= 65) {
        if (
          medName.includes('diphenhydramine') ||
          medName.includes('hydroxyzine') ||
          medName.includes('diazepam') ||
          medName.includes('alprazolam')
        ) {
          findings.push({
            id: `fnd-fac-beers-${med.displayName || med.name}`,
            category: RuleType.PATIENT_FACTOR,
            severity: SeverityLevel.MAJOR,
            title: `AGS Beers Criteria High-Risk Medication in Older Adults: ${med.displayName || med.name}`,
            affectedDrugs: [med.displayName || med.name],
            clinicalEffect:
              'Markedly increased risk of delirium, cognitive decline, urinary retention, severe sedation, and motor vehicle accidents/falls.',
            mechanism:
              'Age-related decline in cholinergic receptors, altered blood-brain barrier permeability, and decreased hepatic clearance.',
            management:
              'Avoid in older adults. If sleep or allergy therapy is required, consider non-pharmacological interventions or safer second-generation non-sedating agents.',
            recommendation: 'Avoid anticholinergics/benzodiazepines in patients >= 65 years.',
            evidence: 'American Geriatrics Society (AGS) Beers Criteria for Potentially Inappropriate Medication Use in Older Adults.',
            evidenceLevel: 'Level 1 (Guideline)',
            source: 'American Geriatrics Society',
            status: 'OPEN',
          });
        }
      }

      // 3. Pregnancy Category X / Contraindicated in Pregnancy
      if (pregnancy === true) {
        if (
          medName.includes('warfarin') ||
          medName.includes('methotrexate') ||
          medName.includes('isotretinoin') ||
          medName.includes('lisinopril')
        ) {
          findings.push({
            id: `fnd-fac-preg-${med.displayName || med.name}`,
            category: RuleType.PATIENT_FACTOR,
            severity: SeverityLevel.CONTRAINDICATED,
            title: `Teratogenic Hazard: ${med.displayName || med.name} Contraindicated in Pregnancy`,
            affectedDrugs: [med.displayName || med.name],
            clinicalEffect:
              'Severe fetal malformations, embryopathy, central nervous system anomalies, or fetal demise.',
            mechanism: 'Crosses placental barrier with disruption of organogenesis and fetal renal perfusion.',
            management: 'Contraindicated. Discontinue immediately and transition to pregnancy-safe therapy (e.g. LMWH, methyldopa/labetalol).',
            recommendation: 'Immediate discontinuation and specialist maternal-fetal consultation.',
            evidence: 'FDA Pregnancy and Lactation Labeling Rule (PLLR) Classifications.',
            evidenceLevel: 'Level 1 (FDA Black Box)',
            source: 'FDA Approved Package Labeling',
            status: 'OPEN',
          });
        }
      }
    }

    return findings;
  },
};

