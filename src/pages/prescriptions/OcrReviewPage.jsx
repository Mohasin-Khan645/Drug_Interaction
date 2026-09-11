import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Pill,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import { medicationApi } from '../../api/medicationApi';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export default function OcrReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  // Fallback initial candidate set if navigated directly
  const initialCandidates = location.state?.candidates || [
    {
      id: 'ocr-cand-1',
      detectedName: 'Amoxicillin 500mg',
      normalizedName: 'Amoxicillin',
      genericName: 'Amoxicillin',
      strength: '500 mg',
      form: 'Capsule',
      frequency: 'Three times daily (TID)',
      route: 'Oral',
      confidence: 'High',
      confidenceScore: 0.96,
      rxNormCode: '723',
      normalizationStatus: 'VERIFIED_MATCH',
      flagWarning: 'Patient profile indicates severe Penicillin allergy. Verify cross-reactivity!',
    },
    {
      id: 'ocr-cand-2',
      detectedName: 'Atorvastatin 20mg tab',
      normalizedName: 'Atorvastatin Calcium',
      genericName: 'Atorvastatin',
      strength: '20 mg',
      form: 'Tablet',
      frequency: 'Once daily at bedtime',
      route: 'Oral',
      confidence: 'Medium',
      confidenceScore: 0.81,
      rxNormCode: '83367',
      normalizationStatus: 'VERIFIED_MATCH',
      flagWarning: null,
    },
    {
      id: 'ocr-cand-3',
      detectedName: 'Lisinoprl 10mg?',
      normalizedName: 'Lisinopril',
      genericName: 'Lisinopril',
      strength: '10 mg',
      form: 'Tablet',
      frequency: 'Once daily',
      route: 'Oral',
      confidence: 'Low',
      confidenceScore: 0.54,
      rxNormCode: '29046',
      normalizationStatus: 'NEEDS_VERIFICATION',
      flagWarning: 'Please verify this medication manually. Low OCR character clarity.',
    },
  ];

  const [candidates, setCandidates] = useState(initialCandidates);
  const [confirmedMeds, setConfirmedMeds] = useState([]);
  const [rejectedMeds, setRejectedMeds] = useState([]);

  const handleConfirm = async (cand) => {
    // Add to patient medication registry
    try {
      await medicationApi.addMedication({
        medicationName: cand.normalizedName,
        genericName: cand.genericName,
        strength: cand.strength,
        form: cand.form,
        route: cand.route,
        frequency: cand.frequency,
        source: 'Prescription',
        rxNormCode: cand.rxNormCode,
        startDate: new Date().toISOString().split('T')[0],
      });

      setConfirmedMeds((prev) => [...prev, cand.id]);
      addToast({
        title: 'Medication Confirmed',
        message: `${cand.normalizedName} has been verified and added to active regimen.`,
        type: 'success',
      });
    } catch {
      addToast({
        title: 'Error',
        message: 'Could not record confirmation.',
        type: 'error',
      });
    }
  };

  const handleReject = (candId) => {
    setRejectedMeds((prev) => [...prev, candId]);
    addToast({
      title: 'Candidate Rejected',
      message: 'Medication candidate excluded from record.',
      type: 'info',
    });
  };

  const handleChooseAnother = (cand) => {
    navigate(`/drugs?search=${encodeURIComponent(cand.normalizedName)}`);
  };

  const allReviewed = candidates.every(
    (c) => confirmedMeds.includes(c.id) || rejectedMeds.includes(c.id)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Human-in-the-Loop Verification
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Possible Medications Detected
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and confirm each extracted medication candidate below before adding to your active safety profile.
          </p>
        </div>

        {allReviewed && (
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            onClick={() => navigate('/medications/reconciliation')}
            className="text-xs font-bold"
          >
            Proceed to Reconciliation
          </Button>
        )}
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {candidates.map((cand) => {
          const isConfirmed = confirmedMeds.includes(cand.id);
          const isRejected = rejectedMeds.includes(cand.id);

          const confidenceColor =
            cand.confidence === 'High'
              ? 'emerald'
              : cand.confidence === 'Medium'
              ? 'amber'
              : 'red';

          return (
            <Card
              key={cand.id}
              className={`p-5 transition-all ${
                isConfirmed
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : isRejected
                  ? 'border-slate-200 bg-slate-50/60 opacity-60'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 border border-teal-200">
                    <Pill className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {cand.normalizedName}
                      </h3>
                      <Badge variant={confidenceColor} size="sm">
                        Confidence: {cand.confidence} ({Math.round(cand.confidenceScore * 100)}%)
                      </Badge>
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        RxNorm: {cand.rxNormCode}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-mono">
                      Raw OCR detected string: &quot;{cand.detectedName}&quot;
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 pt-1">
                      <span><strong>Dose:</strong> {cand.strength}</span>
                      <span>•</span>
                      <span><strong>Form:</strong> {cand.form}</span>
                      <span>•</span>
                      <span><strong>Frequency:</strong> {cand.frequency}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges or Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isConfirmed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Confirmed
                    </span>
                  ) : isRejected ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold">
                      <XCircle className="w-4 h-4" /> Rejected
                    </span>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={CheckCircle2}
                        onClick={() => handleConfirm(cand)}
                        className="text-xs"
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChooseAnother(cand)}
                        className="text-xs bg-white text-slate-700"
                      >
                        Choose Another
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(cand.id)}
                        className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Low Confidence or Clinical Flag Warning Callout */}
              {cand.confidence === 'Low' && !isConfirmed && !isRejected && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Caution:</strong> Please verify this medication manually. Optical confidence is below threshold ({Math.round(cand.confidenceScore * 100)}%).
                  </span>
                </div>
              )}

              {cand.flagWarning && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{cand.flagWarning}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
