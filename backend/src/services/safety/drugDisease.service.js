import { SeverityLevel } from '../../constants/severity.js';
import { RuleType } from '../../constants/rules.js';

export const DrugDiseaseService = {
  /**
   * Checks active patient conditions against medications
   */
  async evaluateDiseases(medications = [], conditions = []) {
    const findings = [];
    if (!medications.length || !conditions.length) return findings;

    const condNames = conditions.map((c) =>
      (typeof c === 'string' ? c : c.conditionName || '').toLowerCase()
    );

    for (const med of medications) {
      const medName = (med.genericName || med.displayName || med.name || '').toLowerCase();

      // NSAID / Ibuprofen in Chronic Kidney Disease
      if (
        (medName.includes('ibuprofen') || medName.includes('naproxen') || medName.includes('advil')) &&
        condNames.some((c) => c.includes('kidney') || c.includes('renal') || c.includes('ckd'))
      ) {
        findings.push({
          id: `fnd-dis-nsaid-ckd`,
          category: RuleType.DRUG_DISEASE,
          severity: SeverityLevel.MAJOR,
          title: 'Acute Hemodynamic Renal Decompensation (NSAID in CKD)',
          affectedDrugs: [med.displayName || med.name],
          clinicalEffect:
            'Precipitation of acute on chronic kidney injury, abrupt reduction in glomerular filtration rate, sodium retention, and exacerbation of hypertension.',
          mechanism:
            'NSAID inhibition of vasodilatory renal prostaglandins (PGE2, PGI2) leads to unantagonized renal vasoconstriction and hypoperfusion.',
          management:
            'Avoid systemic NSAIDs in patients with Stage 3+ CKD. Consider acetaminophen or topical agents for analgesia.',
          recommendation:
            'Avoid systemic NSAIDs in patients with Stage 3+ CKD. Consider acetaminophen or topical agents for analgesia.',
          evidence:
            'Kidney Disease: Improving Global Outcomes (KDIGO) Clinical Practice Guidelines.',
          evidenceLevel: 'Level 2 (Clinical Practice Guidelines)',
          source: 'KDIGO / American Journal of Kidney Diseases',
          status: 'OPEN',
        });
      }

      // Beta-blocker in severe asthma (Precaution/Contraindication)
      if (
        (medName.includes('propranolol') || medName.includes('atenolol') || medName.includes('carvedilol')) &&
        condNames.some((c) => c.includes('asthma') || c.includes('copd') || c.includes('bronchospasm'))
      ) {
        findings.push({
          id: `fnd-dis-bb-asthma`,
          category: RuleType.DRUG_DISEASE,
          severity: SeverityLevel.CRITICAL,
          title: 'Bronchospasm Risk with Beta-Blocker in Reactive Airway Disease',
          affectedDrugs: [med.displayName || med.name],
          clinicalEffect: 'Severe acute bronchoconstriction and blunting of beta-agonist bronchodilator rescue therapy.',
          mechanism: 'Inhibition of pulmonary beta-2 adrenoceptors causing bronchial smooth muscle contraction.',
          management: 'Contraindicated in severe asthma; use cardioselective beta-1 blocker with extreme caution if mandatory.',
          recommendation: 'Use cardioselective alternative or alternative antihypertensive agent.',
          evidence: 'Global Initiative for Asthma (GINA) Guidelines.',
          evidenceLevel: 'Level 1',
          source: 'GINA / FDA Labeling',
          status: 'OPEN',
        });
      }
    }

    return findings;
  },
};

