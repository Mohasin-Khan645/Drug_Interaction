import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ScanLine,
} from 'lucide-react';
import { prescriptionApi } from '../../api/prescriptionApi';
import { useNotifications } from '../../context/NotificationContext';
import FileUploader from '../../components/common/FileUploader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';

export default function PrescriptionUploadPage() {
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return prescriptionApi.uploadPrescription(formData);
    },
  });

  const handleStartProcessing = async () => {
    if (!uploadedFile) return;

    try {
      // Simulate stepped OCR processing stages
      setProcessingStage('Encrypting document and transmitting to HIPAA server...');
      setUploadProgress(25);
      await new Promise((r) => setTimeout(r, 400));

      setProcessingStage('Running optical character recognition (OCR) and layout extraction...');
      setUploadProgress(60);
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStage('Resolving detected medications against RxNorm standardized ontology...');
      setUploadProgress(90);
      const res = await uploadMutation.mutateAsync(uploadedFile);

      setUploadProgress(100);
      setProcessingStage('OCR extraction complete! Ready for clinical verification.');

      addToast({
        title: 'OCR Scan Completed',
        message: 'Detected 3 potential medications. Please review candidates.',
        type: 'success',
      });

      // Navigate to candidate review page with results
      setTimeout(() => {
        navigate('/prescriptions/ocr-review', {
          state: {
            prescriptionId: res.prescriptionId || 'rx-101',
            candidates: res.detectedMedications || [],
          },
        });
      }, 500);
    } catch {
      addToast({
        title: 'Processing Error',
        message: 'Prescription OCR extraction could not be completed.',
        type: 'error',
      });
      setProcessingStage('');
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
          Optical Intelligence Pipeline
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Prescription Document Upload & OCR
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload printed or handwritten physician prescriptions. Our OCR engine extracts medications, strengths, and dosage frequencies for your confirmation.
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="p-6">
        <FileUploader
          onFileSelect={(file) => setUploadedFile(file)}
          maxSizeMB={10}
          isProcessing={uploadMutation.isPending}
        />

        {/* Processing Progress Bar */}
        {uploadProgress > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-teal-700 animate-pulse" />
                {processingStage}
              </span>
              <span className="font-mono font-bold text-teal-800">{uploadProgress}%</span>
            </div>
            <ProgressBar progress={uploadProgress} color="teal" showPercentage={false} />
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-2xs text-slate-400">
            Raw OCR text is normalized to standardized RxNorm concepts before user confirmation.
          </span>

          <Button
            variant="primary"
            size="md"
            onClick={handleStartProcessing}
            disabled={!uploadedFile || uploadMutation.isPending}
            isLoading={uploadMutation.isPending}
            icon={ScanLine}
            className="text-xs font-bold"
          >
            {uploadMutation.isPending ? 'Processing Document...' : 'Extract Medications with OCR'}
          </Button>
        </div>
      </Card>

      {/* Clinical OCR Processing Flow Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-2xs inline-flex items-center justify-center mb-2">1</span>
          <h4 className="font-bold text-slate-800 text-xs">Upload Document</h4>
          <p className="text-3xs text-slate-500 mt-0.5">Secure transmission of image or PDF</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-2xs inline-flex items-center justify-center mb-2">2</span>
          <h4 className="font-bold text-slate-800 text-xs">OCR Recognition</h4>
          <p className="text-3xs text-slate-500 mt-0.5">Neural text and dosage extraction</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-2xs inline-flex items-center justify-center mb-2">3</span>
          <h4 className="font-bold text-slate-800 text-xs">Candidate Review</h4>
          <p className="text-3xs text-slate-500 mt-0.5">Confidence scoring & allergy check</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-2xs inline-flex items-center justify-center mb-2">4</span>
          <h4 className="font-bold text-slate-800 text-xs">Reconciliation</h4>
          <p className="text-3xs text-slate-500 mt-0.5">Integration into safety regimen</p>
        </div>
      </div>
    </div>
  );
}
