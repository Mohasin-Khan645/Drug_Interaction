import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, UserCheck, AlertTriangle, Clock } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SeverityBadge from '../common/SeverityBadge';
import { clinicianReviewSchema } from '../../schemas/reviewSchemas';
import { formatDateTime } from '../../utils/formatters';

export default function ClinicianReviewModal({
  isOpen,
  onClose,
  finding,
  patient,
  currentUser,
  onSubmitReview,
  isLoading = false,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clinicianReviewSchema),
    defaultValues: {
      decision: 'ACKNOWLEDGED',
      clinicalNote: '',
      recommendationOverride: false,
      rationale: '',
      notifyPrescriber: false,
    },
  });

  const selectedDecision = watch('decision');

  const onPreSubmit = (values) => {
    setPendingValues(values);
    setShowConfirm(true);
  };

  const handleFinalConfirm = async () => {
    if (!pendingValues) return;
    await onSubmitReview({
      findingId: finding.id,
      patientId: patient?.id,
      reviewerId: currentUser?.id,
      reviewerName: currentUser?.name,
      reviewerRole: currentUser?.role,
      reviewedAt: new Date().toISOString(),
      ...pendingValues,
    });
    setShowConfirm(false);
    reset();
    onClose();
  };

  if (!finding) return null;

  return (
    <>
      <Modal
        isOpen={isOpen && !showConfirm}
        onClose={onClose}
        size="lg"
        title="Clinician Safety Finding Review"
        subtitle="Formal physician/pharmacist decision recording and clinical override"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit(onPreSubmit)}
              isLoading={isLoading}
            >
              Review & Sign Decision
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onPreSubmit)}>
          {/* Finding Overview */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                Safety Concern
              </span>
              <SeverityBadge severity={finding.severity} size="sm" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {finding.title || finding.interactionTitle}
            </h4>
            <p className="text-xs text-slate-700">
              {finding.clinicalEffect}
            </p>
            {patient && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-2xs text-slate-600">
                <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Patient: <strong>{patient.name}</strong> (MRN: {patient.mrn || 'PT-98241'})</span>
              </div>
            )}
          </div>

          {/* Decision Radio Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Clinical Decision <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedDecision === 'ACCEPTED'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  value="ACCEPTED"
                  {...register('decision')}
                  className="sr-only"
                />
                <span className="text-xs font-bold text-emerald-900">Accept Finding</span>
                <span className="text-2xs text-emerald-700 mt-1">
                  Endorse recommendation and adjust therapy.
                </span>
              </label>

              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedDecision === 'ACKNOWLEDGED'
                    ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  value="ACKNOWLEDGED"
                  {...register('decision')}
                  className="sr-only"
                />
                <span className="text-xs font-bold text-amber-900">Acknowledge</span>
                <span className="text-2xs text-amber-700 mt-1">
                  Acknowledge risk with planned patient monitoring.
                </span>
              </label>

              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedDecision === 'REQUIRES_INVESTIGATION'
                    ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  value="REQUIRES_INVESTIGATION"
                  {...register('decision')}
                  className="sr-only"
                />
                <span className="text-xs font-bold text-red-900">Investigate</span>
                <span className="text-2xs text-red-700 mt-1">
                  Requires additional lab tests or specialist consult.
                </span>
              </label>
            </div>
            {errors.decision && (
              <p className="mt-1 text-xs text-red-600">{errors.decision.message}</p>
            )}
          </div>

          {/* Clinical Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Clinical Review Note <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              {...register('clinicalNote')}
              placeholder="Enter rationale, patient counseling notes, or monitoring plan (e.g. check PT/INR in 3 days)..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
            {errors.clinicalNote && (
              <p className="mt-1 text-xs text-red-600">{errors.clinicalNote.message}</p>
            )}
          </div>

          {/* Notifications / Actions */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="notifyPrescriber"
              {...register('notifyPrescriber')}
              className="rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            <label htmlFor="notifyPrescriber" className="text-xs text-slate-700">
              Send priority notification to attending prescriber
            </label>
          </div>
        </form>
      </Modal>

      {/* Confirmation Step Before Permanent Sign-off */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        size="sm"
        title="Confirm Clinical Sign-off"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
              Back to Edit
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleFinalConfirm}
              isLoading={isLoading}
              icon={ShieldCheck}
            >
              Sign & Record in Audit Log
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              You are about to record a clinical review decision into the permanent patient safety record and system audit trail.
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div>
              <span className="text-slate-400">Reviewer: </span>
              <strong className="text-slate-800">{currentUser?.name}</strong> ({currentUser?.role})
            </div>
            <div>
              <span className="text-slate-400">Decision: </span>
              <strong className="text-teal-800">{pendingValues?.decision}</strong>
            </div>
            <div>
              <span className="text-slate-400">Timestamp: </span>
              <span className="text-slate-700">{formatDateTime(new Date().toISOString())}</span>
            </div>
            <div>
              <span className="text-slate-400">Note: </span>
              <p className="text-slate-700 italic mt-0.5">&quot;{pendingValues?.clinicalNote}&quot;</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
