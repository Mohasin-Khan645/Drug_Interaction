import { SeverityLevel } from '../../constants/severity.js';
import { RuleType } from '../../constants/rules.js';

export const DrugAllergyService = {
  /**
   * Checks medications against documented patient allergies and cross-reactivities
   */
  async evaluateAllergies(medications = [], allergies = []) {
    const findings = [];
    if (!medications.length || !allergies.length) return findings;

    const patientAllergies = allergies.map((a) => {
      if (typeof a === 'string') return { allergen: a.toLowerCase(), severity: 'Severe' };
      return {
        allergen: (a.allergen || '').toLowerCase(),
        reaction: a.reaction || 'Hypersensitivity',
        severity: a.severity || 'Severe',
      };
    });

    for (const med of medications) {
      const medName = (med.genericName || med.displayName || med.name || '').toLowerCase();
      const activeIng = (med.activeIngredient || '').toLowerCase();
      const drugClass = (med.drugClass || '').toLowerCase();

      for (const allergy of patientAllergies) {
        // Direct Penicillin / Beta-lactam Allergy vs Amoxicillin / Ampicillin
        if (
          allergy.allergen.includes('penicillin') ||
          allergy.allergen.includes('beta-lactam')
        ) {
          if (
            medName.includes('amoxicillin') ||
            medName.includes('ampicillin') ||
            medName.includes('penicillin') ||
            activeIng.includes('amoxicillin') ||
            drugClass.includes('aminopenicillin') ||
            drugClass.includes('penicillin')
          ) {
            findings.push({
              id: `fnd-all-penicillin-amox`,
              category: RuleType.DRUG_ALLERGY,
              severity: SeverityLevel.CRITICAL,
              title: 'Severe Beta-Lactam Anaphylaxis Cross-Reactivity',
              affectedDrugs: [med.displayName || med.name],
              clinicalEffect: `Documented patient allergy to ${allergy.allergen}. High risk of IgE-mediated anaphylaxis, urticaria, bronchospasm, or angioedema.`,
              mechanism:
                'Shared core beta-lactam bicyclic ring structure recognized by pre-existing drug-specific IgE antibodies.',
              management:
                'Strictly avoid all penicillins and aminopenicillins. Select a non-beta-lactam alternative antibiotic (e.g. macrolide, fluoroquinolone, or doxycycline).',
              recommendation:
                'Avoid aminopenicillins. Choose a structurally distinct non-cross-reacting antimicrobial class.',
              evidence:
                'Clinical Allergy and Immunology Compendium; AAAAI Practice Parameters 2024.',
              evidenceLevel: 'Level 1 (Clinical Guidelines)',
              source: 'AAAAI / FDA Package Warning',
              status: 'REVIEW_REQUIRED',
            });
          }
        }

        // Direct Aspirin / NSAID allergy
        if (allergy.allergen.includes('aspirin') || allergy.allergen.includes('nsaid')) {
          if (
            medName.includes('aspirin') ||
            medName.includes('ibuprofen') ||
            medName.includes('naproxen') ||
            medName.includes('ketorolac')
          ) {
            findings.push({
              id: `fnd-all-aspirin-nsaid`,
              category: RuleType.DRUG_ALLERGY,
              severity: SeverityLevel.CRITICAL,
              title: 'Cross-Reactive NSAID / Aspirin Hypersensitivity',
              affectedDrugs: [med.displayName || med.name],
              clinicalEffect:
                'Risk of severe pseudo-allergic or IgE reaction: bronchospasm (Aspirin-Exacerbated Respiratory Disease), profound urticaria, or anaphylactoid shock.',
              mechanism:
                'Cyclooxygenase-1 (COX-1) inhibition shunting arachidonic acid metabolism into the 5-lipoxygenase pathway, driving massive cysteinyl leukotriene overproduction.',
              management:
                'Avoid all systemic COX-1 inhibiting NSAIDs and salicylates. Use acetaminophen (with caution) or selective COX-2 inhibitor under supervision if verified.',
              recommendation: 'Discontinue NSAID/Aspirin. Verify patient tolerance.',
              evidence: 'AAAAI Guidelines on Nonsteroidal Anti-Inflammatory Drug Reactions.',
              evidenceLevel: 'Level 1',
              source: 'AAAAI Clinical Practice Guidelines',
              status: 'REVIEW_REQUIRED',
            });
          }
        }

        // Sulfa cross-reactivity check
        if (allergy.allergen.includes('sulfa')) {
          if (
            medName.includes('bactrim') ||
            medName.includes('sulfamethoxazole') ||
            medName.includes('spironolactone')
          ) {
            const isDefinite = medName.includes('sulfamethoxazole') || medName.includes('bactrim');
            findings.push({
              id: `fnd-all-sulfa-${med.displayName || med.name}`,
              category: RuleType.DRUG_ALLERGY,
              severity: isDefinite ? SeverityLevel.CRITICAL : SeverityLevel.MODERATE,
              title: isDefinite
                ? 'Direct Sulfonamide Antimicrobial Allergy Conflict'
                : 'Potential Sulfonamide Non-Arylamine Cross-Reactivity Question',
              affectedDrugs: [med.displayName || med.name],
              clinicalEffect: isDefinite
                ? 'Severe delayed cutaneous hypersensitivity (SJS/TEN) or acute urticaria.'
                : 'Low to ambiguous cross-reactivity between sulfonamide antibiotics and non-antibiotic sulfonamides.',
              mechanism: isDefinite
                ? 'Arylamine metabolite haptenation.'
                : 'Structural sulfonamide moiety without arylamine radical.',
              management: isDefinite
                ? 'Contraindicated. Discontinue drug immediately.'
                : 'Clinical review advised to verify specific history of previous reaction.',
              recommendation: 'Evaluate allergy record and verify safety before dispensing.',
              evidence: 'American Academy of Dermatology Sulfonamide Cross-Reactivity Compendium.',
              evidenceLevel: 'Level 2',
              source: 'AAD / FDA MedWatch',
              status: 'REVIEW_REQUIRED',
            });
          }
        }
      }
    }

    return findings;
  },
};

