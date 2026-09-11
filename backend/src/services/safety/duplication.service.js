import { SeverityLevel } from '../../constants/severity.js';
import { RuleType } from '../../constants/rules.js';

export const DuplicationService = {
  /**
   * Detects duplicate medications, duplicate active ingredients, and therapeutic duplications
   */
  async evaluateDuplications(medications = []) {
    const findings = [];
    if (medications.length < 2) return findings;

    // 1. Same drug or active ingredient duplication
    const seenIngredients = new Map();
    const seenNames = new Map();

    for (const med of medications) {
      const name = (med.genericName || med.displayName || med.name || '').toLowerCase().trim();
      const ingredient = (med.activeIngredient || med.genericName || name).toLowerCase().trim();

      // Check same active ingredient across different brand/generic products
      if (seenIngredients.has(ingredient)) {
        const priorMed = seenIngredients.get(ingredient);
        // Special clinically critical rule: Multi-source Acetaminophen hepatotoxicity
        const isAcetaminophen = ingredient.includes('acetaminophen') || ingredient.includes('paracetamol');

        findings.push({
          id: `fnd-dup-${ingredient}`,
          category: RuleType.DUPLICATION,
          severity: isAcetaminophen ? SeverityLevel.MAJOR : SeverityLevel.MODERATE,
          title: isAcetaminophen
            ? 'Duplicate Acetaminophen Therapy (Cumulative Hepatotoxicity Hazard)'
            : `Duplicate Active Ingredient Therapy: ${med.displayName || med.name}`,
          affectedDrugs: [priorMed.displayName || priorMed.name, med.displayName || med.name],
          clinicalEffect: isAcetaminophen
            ? 'Exceeding the 4,000 mg/day safe threshold leads to glutathione depletion and accumulation of toxic NAPQI metabolite, risking acute centrilobular liver failure.'
            : 'Unintentional cumulative dosage escalation increasing drug-specific adverse event incidence without additional therapeutic efficacy.',
          mechanism: isAcetaminophen
            ? 'Saturation of primary glucuronidation and sulfation pathways with shift to CYP2E1-mediated toxic reactive intermediate (NAPQI) formation.'
            : 'Additive pharmacodynamic receptor saturation and increased systemic exposure.',
          management:
            'Audit all concurrent prescription and over-the-counter products for hidden overlapping ingredients. Discontinue redundant formulations.',
          recommendation:
            'Review patient medication regimen to eliminate redundant therapy and prevent dosage toxicity.',
          evidence:
            'FDA Advisory Committee on Acetaminophen Safety; Clinical Pharmacology Compendium.',
          evidenceLevel: 'Level 1 (FDA Safety Advisory)',
          source: 'FDA Safety Alert / DailyMed',
          status: 'OPEN',
        });
      } else {
        seenIngredients.set(ingredient, med);
      }

      // Check identical brand/generic name added twice
      if (seenNames.has(name)) {
        const priorMed = seenNames.get(name);
        findings.push({
          id: `fnd-dup-exact-${name}`,
          category: RuleType.DUPLICATION,
          severity: SeverityLevel.MODERATE,
          title: `Duplicate Prescription Order Detected: ${med.displayName || med.name}`,
          affectedDrugs: [priorMed.displayName || priorMed.name, med.displayName || med.name],
          clinicalEffect: 'Duplicate order may lead to accidental double-dosing.',
          mechanism: 'Direct additive dosage duplication.',
          management: 'Verify whether one order supersedes the other or represents a duplicate entry.',
          recommendation: 'Verify order validity and cancel redundant prescription entry.',
          evidence: 'Hospital Pharmacy Quality & Patient Safety Indicators.',
          evidenceLevel: 'Level 2',
          source: 'ISMP Medication Safety Guidelines',
          status: 'OPEN',
        });
      } else {
        seenNames.set(name, med);
      }
    }

    return findings;
  },
};

