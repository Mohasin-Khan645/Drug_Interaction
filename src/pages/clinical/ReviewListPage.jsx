import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckSquare,
  AlertOctagon,
  AlertTriangle,
  User,
  Pill,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { reviewApi } from '../../api/reviewApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SeverityBadge from '../../components/common/SeverityBadge';
import ClinicianReviewModal from '../../components/clinical/ClinicianReviewModal';
import { formatDateTime } from '../../utils/formatters';

export default function ReviewListPage() {
  const { currentUser } = useAuth();
  const { addToast } = useNotifications();
  const queryClient = useQueryClient();

  const [activeFinding, setActiveFinding] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const initialPendingReviews = [
    {
      id: 'rev-item-1',
      severity: 'CRITICAL',
      title: 'High Bleeding Risk: Warfarin Sodium 5mg + Aspirin 81mg',
      patientName: 'Sarah Jenkins',
      patientId: 'pt-101',
      mrn: 'MRN-84920',
      clinicalEffect: 'Additive anticoagulation and platelet inhibition increases major hemorrhage hazard by up to 4-fold without PPI gastroprotection.',
      evidence: 'FDA Package Insert & CHEST 2024 Antithrombotic Guidelines.',
      source: 'DailyMed / openFDA',
      timestamp: '2026-09-09T07:15:00Z',
    },
    {
      id: 'rev-item-2',
      severity: 'MAJOR',
      title: 'Renal Clearance Precaution: Metformin in CKD Stage 3a',
      patientName: 'Sarah Jenkins',
      patientId: 'pt-101',
      mrn: 'MRN-84920',
      clinicalEffect: 'Patient eGFR is 48 mL/min. Close monitoring required; maximum recommended dose is 1,000 mg/day.',
      evidence: 'FDA CDER Revised Metformin Drug Safety Announcement.',
      source: 'FDA Safety Alert',
      timestamp: '2026-09-08T14:30:00Z',
    },
  ];

  const [reviewsList, setReviewsList] = useState(initialPendingReviews);
  const [completedReviews, setCompletedReviews] = useState([]);

  const handleOpenReview = (item) => {
    setActiveFinding(item);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (reviewData) => {
    await reviewApi.submitClinicianReview(reviewData);
    setReviewsList((prev) => prev.filter((r) => r.id !== activeFinding.id));
    setCompletedReviews((prev) => [
      ...prev,
      {
        ...activeFinding,
        ...reviewData,
      },
    ]);
    addToast({
      title: 'Decision Recorded',
      message: `Formal clinical decision signed by ${currentUser?.name}.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
          Clinician Attestation & Override Queue
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Pending Clinical Decision Reviews
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review, annotate, and formally sign clinical safety findings flagged across patient regimens.
        </p>
      </div>

      {/* Pending Items List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Awaiting Clinician Action ({reviewsList.length})
        </h2>

        {reviewsList.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-800">Review Queue Cleared</h4>
            <p>All flagged medication safety findings have been reviewed and signed off.</p>
          </div>
        ) : (
          reviewsList.map((item) => (
            <Card key={item.id} className="p-5 border-slate-200 shadow-subtle space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={item.severity} size="sm" />
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {item.clinicalEffect}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-2xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5 text-teal-700" />
                      Patient: {item.patientName} ({item.mrn})
                    </span>
                    <span>•</span>
                    <span>Source: {item.source}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Flagged: {formatDateTime(item.timestamp)}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleOpenReview(item)}
                  icon={CheckSquare}
                  className="text-xs whitespace-nowrap self-end sm:self-center"
                >
                  Review & Sign Decision
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Completed Reviews in this session */}
      {completedReviews.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Signed Clinical Reviews ({completedReviews.length})</span>
          </h2>

          {completedReviews.map((item, idx) => (
            <Card key={idx} className="p-4 border-emerald-200 bg-emerald-50/20 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{item.title}</span>
                <span className="px-2 py-0.5 rounded text-2xs font-bold uppercase bg-emerald-100 text-emerald-800">
                  Decision: {item.decision}
                </span>
              </div>
              <p className="text-2xs text-slate-600 italic">
                Clinical Note: &quot;{item.clinicalNote}&quot;
              </p>
              <div className="flex items-center justify-between text-3xs text-slate-400 pt-1 border-t border-emerald-100">
                <span>Signed by {item.reviewerName} ({item.reviewerRole})</span>
                <span>{formatDateTime(item.reviewedAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Decision Modal */}
      <ClinicianReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        finding={activeFinding}
        patient={{ name: activeFinding?.patientName, mrn: activeFinding?.mrn }}
        currentUser={currentUser}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
}
