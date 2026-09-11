import { ruleRepository } from '../../repositories/rule.repository.js';
import { SeverityLevel } from '../../constants/severity.js';
import { RuleType } from '../../constants/rules.js';

export const DrugInteractionService = {
  /**
   * Generates all canonical unique unordered pairs N*(N-1)/2
   * Guaranteed: Pair order normalized so (A, B) === (B, A)
   */
  generatePairs(items = []) {
    const pairs = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        // Canonical deterministic ordering by name/id
        const aKey = (a.genericName || a.name || a.id || '').toLowerCase();
        const bKey = (b.genericName || b.name || b.id || '').toLowerCase();

        if (aKey <= bKey) {
          pairs.push({ drugA: a, drugB: b });
        } else {
          pairs.push({ drugA: b, drugB: a });
        }
      }
    }
    return pairs;
  },

  /**
   * Evaluates all pairs of medications against curated drug-drug interaction rules
   */
  async evaluateInteractions(normalizedMedications = []) {
    const findings = [];
    const pairs = this.generatePairs(normalizedMedications);

    for (const { drugA, drugB } of pairs) {
      // Check database rules if drug IDs exist
      if (drugA.candidateDrugId && drugB.candidateDrugId) {
        const rule = await ruleRepository.findInteractionPair(
          drugA.candidateDrugId,
          drugB.candidateDrugId
        );

        if (rule) {
          findings.push({
            id: `fnd-dd-${rule.id}`,
            category: RuleType.DRUG_DRUG,
            severity: rule.severity,
            title: rule.title,
            affectedDrugs: [drugA.displayName || drugA.name, drugB.displayName || drugB.name],
            clinicalEffect: rule.clinicalEffect,
            mechanism: rule.mechanism,
            management: rule.management,
            recommendation: rule.management,
            evidence: `Documented clinical interaction (Ref ID: ${rule.id}). ${rule.clinicalEffect}`,
            evidenceLevel: rule.evidenceLevel,
            source: rule.sourceId || 'FDA Package Labeling & DailyMed',
            status: 'OPEN',
          });
          continue;
        }
      }

      // Fallback deterministic rule check for verified clinical pairs
      const nameA = (drugA.genericName || drugA.displayName || drugA.name || '').toLowerCase();
      const nameB = (drugB.genericName || drugB.displayName || drugB.name || '').toLowerCase();

      // Warfarin + Aspirin
      if (
        (nameA.includes('warfarin') && nameB.includes('aspirin')) ||
        (nameB.includes('warfarin') && nameA.includes('aspirin'))
      ) {
        findings.push({
          id: `fnd-dd-warfarin-aspirin`,
          category: RuleType.DRUG_DRUG,
          severity: SeverityLevel.CRITICAL,
          title: 'Severe Gastrointestinal & Major Hemorrhage Risk',
          affectedDrugs: [drugA.displayName || drugA.name, drugB.displayName || drugB.name],
          clinicalEffect:
            'Concurrent administration markedly potentiates systemic hypoprothrombinemic effect and suppresses platelet aggregation, yielding up to a 4-fold increase in major gastrointestinal hemorrhage.',
          mechanism:
            'Additive pharmacodynamic anticoagulant and antiplatelet inhibition; aspirin also displaces warfarin from albumin binding sites and exerts direct topical gastric mucosal erosion.',
          management:
            'Avoid combination unless specifically indicated (e.g. mechanical heart valve). If co-prescribed, add gastric protection (PPI) and monitor INR diligently.',
          recommendation:
            'Avoid combination unless specifically indicated (e.g. mechanical heart valve). If co-prescribed, add gastric protection (PPI) and monitor INR diligently.',
          evidence:
            'Multiple randomized controlled trials and American College of Cardiology guidelines demonstrate elevated bleeding hazard with combined VKA + antiplatelet therapy.',
          evidenceLevel: 'Level 1 (RCT / Meta-analysis)',
          source: 'FDA Approved Package Labeling & CHEST Guidelines 2024',
          status: 'OPEN',
        });
      }

      // Simvastatin + Clarithromycin
      if (
        (nameA.includes('simvastatin') && nameB.includes('clarithromycin')) ||
        (nameB.includes('simvastatin') && nameA.includes('clarithromycin'))
      ) {
        findings.push({
          id: `fnd-dd-simvastatin-clarithromycin`,
          category: RuleType.DRUG_DRUG,
          severity: SeverityLevel.CRITICAL,
          title: 'Severe Rhabdomyolysis & Acute Myopathy Contraindication',
          affectedDrugs: [drugA.displayName || drugA.name, drugB.displayName || drugB.name],
          clinicalEffect:
            'Marked increase in simvastatin plasma AUC (up to 10-fold), causing extreme risk of severe skeletal muscle breakdown (rhabdomyolysis), myoglobinuria, and fatal acute renal failure.',
          mechanism:
            'Potent irreversible time-dependent inhibition of cytochrome P450 3A4 (CYP3A4) enzyme system responsible for extensive first-pass hepatic metabolism of simvastatin.',
          management:
            'Co-administration is contraindicated. Temporarily suspend simvastatin therapy throughout clarithromycin course, or select an alternative antibiotic (e.g. azithromycin) or non-CYP3A4 statin (rosuvastatin).',
          recommendation:
            'Co-administration is contraindicated. Temporarily suspend simvastatin therapy throughout clarithromycin course, or select an alternative antibiotic.',
          evidence:
            'FDA Drug Safety Communication (Ref: FDA-2011-N-0144). Post-marketing surveillance reports multiple documented deaths from acute myopathy.',
          evidenceLevel: 'Level 1 (FDA Approved Labeling & Warning)',
          source: 'DailyMed / FDA MedWatch Alerts',
          status: 'OPEN',
        });
      }

      // Lisinopril + Spironolactone
      if (
        (nameA.includes('lisinopril') && nameB.includes('spironolactone')) ||
        (nameB.includes('lisinopril') && nameA.includes('spironolactone'))
      ) {
        findings.push({
          id: `fnd-dd-lisinopril-spironolactone`,
          category: RuleType.DRUG_DRUG,
          severity: SeverityLevel.MAJOR,
          title: 'Severe Hyperkalemia Risk',
          affectedDrugs: [drugA.displayName || drugA.name, drugB.displayName || drugB.name],
          clinicalEffect:
            'Additive potassium retention producing life-threatening cardiac arrhythmias, muscle weakness, and cardiac arrest.',
          mechanism:
            'Concurrent inhibition of aldosterone synthesis (via ACE inhibition) and competitive blockade of mineralocorticoid receptors in the distal renal tubules prevents normal kaliuresis.',
          management:
            'Check baseline serum potassium and renal function before starting. Re-check potassium at 3 days, 1 week, and monthly. Discontinue potassium supplements.',
          recommendation:
            'Check baseline serum potassium and renal function before starting. Re-check potassium regularly. Discontinue potassium supplements.',
          evidence:
            'RALES clinical trial safety monitoring sub-analysis and AHA Heart Failure Guidelines.',
          evidenceLevel: 'Level 1 (RCT / Meta-analysis)',
          source: 'AHA/ACC Heart Failure Guidelines',
          status: 'OPEN',
        });
      }
    }

    return findings;
  },
};

