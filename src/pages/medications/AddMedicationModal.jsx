import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pill, Search, X } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { medicationFormSchema } from '../../schemas/medicationSchemas';
import { drugApi } from '../../api/drugApi';

export default function AddMedicationModal({
  isOpen,
  onClose,
  onSubmitMedication,
  initialData = null,
  isLoading = false,
}) {
  const [drugSearch, setDrugSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      medicationName: '',
      genericName: '',
      strength: '500 mg',
      form: 'Tablet',
      route: 'Oral',
      frequency: 'Once daily',
      source: 'Prescription',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
    },
  });

  // Reset or populate if editing
  useEffect(() => {
    if (initialData) {
      reset({
        medicationName: initialData.medicationName || '',
        genericName: initialData.genericName || '',
        strength: initialData.strength || '500 mg',
        form: initialData.form || 'Tablet',
        route: initialData.route || 'Oral',
        frequency: initialData.frequency || 'Once daily',
        source: initialData.source || 'Prescription',
        startDate: initialData.startDate || new Date().toISOString().split('T')[0],
        endDate: initialData.endDate || '',
        notes: initialData.notes || '',
      });
      setDrugSearch(initialData.medicationName || '');
    } else {
      reset({
        medicationName: '',
        genericName: '',
        strength: '500 mg',
        form: 'Tablet',
        route: 'Oral',
        frequency: 'Once daily',
        source: 'Prescription',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
      });
      setDrugSearch('');
    }
  }, [initialData, isOpen, reset]);

  // Autocomplete drug lookup
  useEffect(() => {
    let active = true;
    if (!drugSearch || drugSearch.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await drugApi.searchDrugs({ search: drugSearch, limit: 4 });
        if (active) setSuggestions(res.data || []);
      } catch {
        // ignore
      }
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [drugSearch]);

  const handleSelectSuggestion = (drug) => {
    setValue('medicationName', drug.name);
    setValue('genericName', drug.genericName);
    if (drug.strength) setValue('strength', drug.strength);
    if (drug.dosageForms?.[0]) setValue('form', drug.dosageForms[0]);
    if (drug.route) setValue('route', drug.route);
    setDrugSearch(drug.name);
    setSuggestions([]);
  };

  const onFormSubmit = async (values) => {
    await onSubmitMedication(values);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={initialData ? 'Edit Medication Entry' : 'Add Medication to Regimen'}
      subtitle="Enter medication information for automated safety and interaction surveillance"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(onFormSubmit)}
            isLoading={isLoading}
          >
            {initialData ? 'Save Changes' : 'Add Medication'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>
        {/* Medication Name Search / Autocomplete */}
        <div className="relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Medication Name / Search <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={drugSearch}
            onChange={(e) => {
              setDrugSearch(e.target.value);
              setValue('medicationName', e.target.value);
            }}
            placeholder="Search or enter medication name (e.g. Coumadin, Warfarin, Glucophage)..."
            className="w-full rounded-lg border border-slate-300 py-2.5 px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />

          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-20 py-1">
              {suggestions.map((drug) => (
                <button
                  key={drug.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(drug)}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-teal-50 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-800">{drug.name}</span>
                  <span className="text-2xs text-slate-500">{drug.genericName}</span>
                </button>
              ))}
            </div>
          )}

          {errors.medicationName && (
            <p className="mt-1 text-xs text-red-600">{errors.medicationName.message}</p>
          )}
        </div>

        {/* Generic Name */}
        <Input
          label="Generic Name (Optional)"
          placeholder="e.g. Warfarin Sodium"
          error={errors.genericName?.message}
          {...register('genericName')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Strength */}
          <Input
            label="Strength"
            placeholder="e.g. 5 mg, 500 mg, 10 mg/mL"
            required
            error={errors.strength?.message}
            {...register('strength')}
          />

          {/* Dosage Form */}
          <Select
            label="Dosage Form"
            options={[
              'Tablet',
              'Capsule',
              'Liquid / Solution',
              'Suspension',
              'Injection',
              'Inhaler',
              'Topical Cream',
              'Transdermal Patch',
              'Eye Drops',
              'Other',
            ]}
            required
            error={errors.form?.message}
            {...register('form')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Route */}
          <Select
            label="Route"
            options={[
              'Oral',
              'Sublingual',
              'Intravenous',
              'Subcutaneous',
              'Intramuscular',
              'Topical',
              'Inhalation',
              'Ophthalmic',
              'Nasal',
              'Rectal',
            ]}
            required
            error={errors.route?.message}
            {...register('route')}
          />

          {/* Frequency */}
          <Select
            label="Frequency"
            options={[
              'Once daily',
              'Twice daily (BID)',
              'Three times daily (TID)',
              'Four times daily (QID)',
              'Every 4 hours',
              'Every 6 hours',
              'Every 8 hours',
              'Every 12 hours',
              'Every morning',
              'At bedtime (QHS)',
              'As needed (PRN)',
              'Weekly',
            ]}
            required
            error={errors.frequency?.message}
            {...register('frequency')}
          />

          {/* Source */}
          <Select
            label="Source"
            options={['Prescription', 'OTC', 'Supplement', 'Manual']}
            required
            error={errors.source?.message}
            {...register('source')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <Input
            label="Start Date"
            type="date"
            required
            error={errors.startDate?.message}
            {...register('startDate')}
          />

          {/* End Date */}
          <Input
            label="End Date (Optional)"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate')}
          />
        </div>

        {/* Clinical Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Clinical Notes / Instructions
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Take with food. Monitor INR target 2.0-3.0..."
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            {...register('notes')}
          />
          {errors.notes && (
            <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}
