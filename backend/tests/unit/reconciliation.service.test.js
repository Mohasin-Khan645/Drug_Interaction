import { describe, it, expect } from 'vitest';
import { MedicationReconciliationService } from '../../src/services/reconciliation.service.js';

describe('MedicationReconciliationService Unit Tests', () => {
  it('should detect duplicate therapy between existing medications and incoming items', async () => {
    const existing = [
      { medicationName: 'Tylenol Extra Strength', activeIngredient: 'Acetaminophen', strength: '500 mg' },
    ];
    const incoming = [
      { medicationName: 'Vicodin', activeIngredient: 'Acetaminophen', strength: '300 mg' },
    ];

    const result = await MedicationReconciliationService.reconcile({
      existingMedications: existing,
      newPrescriptionItems: incoming,
    });

    expect(result.status).toBe('ACTION_REQUIRED');
    expect(result.discrepancies.length).toBeGreaterThan(0);
    expect(result.discrepancies[0].title).toContain('Duplicate Therapy');
  });

  it('should detect conflicting dosage instructions', async () => {
    const existing = [
      { medicationName: 'Lisinopril', genericName: 'Lisinopril', strength: '20 mg' },
    ];
    const incoming = [
      { medicationName: 'Lisinopril', genericName: 'Lisinopril', strength: '10 mg' },
    ];

    const result = await MedicationReconciliationService.reconcile({
      existingMedications: existing,
      newPrescriptionItems: incoming,
    });

    expect(result.discrepancies.some((d) => d.type === 'DOSAGE_CONFLICT')).toBe(true);
  });

  it('should return clean status when there are no conflicts', async () => {
    const existing = [
      { medicationName: 'Metformin', genericName: 'Metformin', strength: '500 mg' },
    ];
    const incoming = [
      { medicationName: 'Atorvastatin', genericName: 'Atorvastatin', strength: '20 mg' },
    ];

    const result = await MedicationReconciliationService.reconcile({
      existingMedications: existing,
      newPrescriptionItems: incoming,
    });

    expect(result.status).toBe('RECONCILED_CLEAN');
    expect(result.discrepancies).toHaveLength(0);
  });
});

