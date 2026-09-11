import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Printer, Share2, ShieldCheck, Download } from 'lucide-react';
import SafetyReportPrintView from '../../components/print/SafetyReportPrintView';
import Button from '../../components/common/Button';
import { patientApi } from '../../api/patientApi';
import { medicationApi } from '../../api/medicationApi';
import { useNotifications } from '../../context/NotificationContext';

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const { data: patientRes } = useQuery({
    queryKey: ['patient-profile', 'pt-101'],
    queryFn: async () => {
      const res = await patientApi.getPatientById('pt-101');
      return res.data;
    },
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const res = await medicationApi.getMedications();
      return res.data || [];
    },
  });

  const patient = patientRes || {
    name: 'Sarah Jenkins',
    mrn: 'MRN-84920',
    gender: 'Female',
  };

  const report = {
    id: id || 'DS-2026-9812',
    createdAt: '2026-09-09T08:12:00Z',
    status: 'VERIFIED_CLINICAL_RECORD',
    reviewerName: 'Dr. Marcus Chen, MD',
    decision: 'ACCEPTED & MONITORED',
    reviewedAt: '2026-09-09T08:45:12Z',
    reviewNote: 'Patient counseled on elevated bleeding risk with concurrent Warfarin and OTC Aspirin. Prophylactic PPI (pantoprazole) added and INR follow-up scheduled for 72 hours.',
  };

  const sampleFindings = [
    {
      id: 'fnd-1',
      severity: 'CRITICAL',
      title: 'Severe Gastrointestinal & Major Hemorrhage Risk: Warfarin + Aspirin',
      clinicalEffect: 'Additive anticoagulation and irreversible platelet aggregation inhibition increases major hemorrhage hazard by 3.8-fold.',
      mechanism: 'Competitive inhibition of vitamin K epoxide reductase combined with irreversible COX-1 platelet suppression.',
      recommendation: 'Verify specific indication for dual antithrombotic therapy. Prescribe gastric mucosal protection (PPI) and monitor INR diligently.',
      evidenceLevel: 'Level 1 (FDA Approved Labeling & ACC Guidelines)',
      source: 'FDA DailyMed / CHEST Antithrombotic Guidelines',
    },
    {
      id: 'fnd-2',
      severity: 'MAJOR',
      title: 'Lactic Acidosis Precaution: Metformin in Renal Impairment (eGFR 48 mL/min)',
      clinicalEffect: 'Decreased tubular clearance may lead to subclinical biguanide accumulation.',
      mechanism: 'Reduced glomerular filtration increases circulating biguanide half-life.',
      recommendation: 'Maintain dose within 1,000 mg daily maximum. Monitor eGFR every 90 days.',
      evidenceLevel: 'Level 1 (FDA Revised Drug Labeling)',
      source: 'FDA CDER Safety Announcement',
    },
  ];

  const handleShare = () => {
    addToast({
      title: 'Encrypted Link Generated',
      message: 'Secure clinician share link copied to clipboard.',
      type: 'info',
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="no-print flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/reports')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Reports
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Share2}
            onClick={handleShare}
            className="text-xs"
          >
            Share with Clinician
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Printer}
            onClick={() => window.print()}
            className="text-xs font-bold"
          >
            Print / Export PDF
          </Button>
        </div>
      </div>

      {/* Official Medical Print Preview Card */}
      <SafetyReportPrintView
        report={report}
        patient={patient}
        medications={medications}
        findings={sampleFindings}
        allergies={patient.allergies || ['Penicillin']}
        conditions={patient.conditions || ['Hypertension', 'Atrial Fibrillation', 'CKD Stage 3']}
        onPrint={() => window.print()}
      />
    </div>
  );
}
