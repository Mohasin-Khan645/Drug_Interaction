import { NormalizationService } from './normalization.service.js';

export const MedicationReconciliationService = {
  /**
   * Performs clinical reconciliation across existing medications, new prescription items, OTCs, and supplements
   */
  async reconcile({
    existingMedications = [],
    newPrescriptionItems = [],
    otcMedicines = [],
    supplements = [],
  }) {
    const discrepancies = [];
    const confirmedCandidates = [];
    const duplicateCandidates = [];
    const reviewRequiredItems = [];

    // Combine all incoming candidate items
    const allCandidates = [
      ...newPrescriptionItems.map((m) => ({ ...m, sourceCategory: 'Prescription' })),
      ...otcMedicines.map((m) => ({ ...m, sourceCategory: 'OTC' })),
      ...supplements.map((m) => ({ ...m, sourceCategory: 'Supplement' })),
    ];

    // Normalize each item
    for (const item of allCandidates) {
      const rawName = item.medicationName || item.detectedName || item.name || '';
      const norm = await NormalizationService.normalize(rawName);

      if (norm.bestMatch && norm.bestMatch.confidence >= 0.8) {
        confirmedCandidates.push({
          ...item,
          normalizedName: norm.bestMatch.displayName,
          genericName: norm.bestMatch.genericName,
          activeIngredient: norm.bestMatch.activeIngredient,
          confidenceScore: norm.bestMatch.confidence,
          rxNormCode: norm.bestMatch.rxNormCode,
        });
      } else {
        reviewRequiredItems.push({
          ...item,
          normalizedName: rawName,
          confidenceScore: norm.bestMatch ? norm.bestMatch.confidence : 0.4,
          reason: 'Low OCR/text match confidence. Manual clinician verification required.',
        });
      }
    }

    // Check for duplicate therapy between existing medications and incoming items
    for (const existing of existingMedications) {
      const exName = (existing.genericName || existing.medicationName || existing.name || '').toLowerCase();
      const exStrength = (existing.strength || '').toLowerCase();

      const targetCandidates = [...confirmedCandidates, ...reviewRequiredItems];
      for (const candidate of targetCandidates) {
        const candName = (candidate.genericName || candidate.normalizedName || candidate.name || candidate.medicationName || '').toLowerCase();
        const candStrength = (candidate.strength || '').toLowerCase();
        const candIngredient = (candidate.activeIngredient || '').toLowerCase();
        const exIngredient = (existing.activeIngredient || '').toLowerCase();

        // 1. Same active ingredient or matching medication name (Duplicate Therapy)
        const isNameOverlap = (candName && exName && (exName.includes(candName) || candName.includes(exName)));
        const isIngredientMatch = (candIngredient && exIngredient && (candIngredient === exIngredient || candIngredient.includes(exIngredient) || exIngredient.includes(candIngredient)));

        if (isNameOverlap || isIngredientMatch) {
          // If identical drug name has differing strengths: Dosage Conflict
          if (isNameOverlap && exStrength && candStrength && exStrength !== candStrength) {
            discrepancies.push({
              id: `rec-disc-dose-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              type: 'DOSAGE_CONFLICT',
              title: 'Conflicting Medication Dosage Instructions',
              primaryMedication: `${existing.medicationName || existing.name} ${existing.strength || ''}`.trim(),
              conflictingMedication: `${candidate.normalizedName || candidate.name} ${candidate.strength || ''}`.trim(),
              reason: `Existing clinical record lists '${existing.strength}', while new prescription specifies '${candidate.strength}'.`,
              recommendation: 'Confirm target therapeutic dose with prescribing physician prior to dispensing.',
            });
          } else {
            duplicateCandidates.push(candidate);
            discrepancies.push({
              id: `rec-disc-dup-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              type: 'DUPLICATE_THERAPY',
              title: 'Active Duplicate Therapy Detected',
              primaryMedication: existing.medicationName || existing.name,
              conflictingMedication: candidate.normalizedName || candidate.name,
              reason: `Both products contain identical active substance (${candidate.activeIngredient || candidate.normalizedName}). Co-administration risks dose-dependent toxicity.`,
              recommendation: 'Reconcile whether new order replaces existing prescription or represents duplicate ingestion.',
            });
          }
        }
      }
    }

    const status = discrepancies.length > 0 ? 'ACTION_REQUIRED' : 'RECONCILED_CLEAN';

    return {
      reconciliationId: `recon-${Date.now()}`,
      status,
      discrepancies,
      confirmedCandidates,
      duplicateCandidates,
      reviewRequiredItems,
      reconciledAt: new Date().toISOString(),
    };
  },
};

