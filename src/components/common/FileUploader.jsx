import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, AlertCircle, ShieldCheck } from 'lucide-react';

export default function FileUploader({
  onFileSelect,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxSizeMB = 10,
  isProcessing = false,
  className = '',
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateAndHandleFile = (file) => {
    setError(null);
    if (!file) return;

    if (!acceptedFormats.includes(file.type)) {
      setError(`Unsupported format (${file.type || 'unknown'}). Please upload a PDF, PNG, JPG, or WEBP document.`);
      return;
    }

    if (file.size > maxSizeBytes) {
      setError(`File exceeds ${maxSizeMB}MB limit. Please upload a smaller document.`);
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndHandleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleInputChange}
        className="hidden"
        id="prescription-file-upload"
        disabled={isProcessing}
      />

      {!selectedFile ? (
        <label
          htmlFor="prescription-file-upload"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            isDragOver
              ? 'border-teal-600 bg-teal-50/50'
              : 'border-slate-300 hover:border-teal-500 bg-white hover:bg-slate-50/60'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h4 className="text-sm font-semibold text-slate-800 mb-1">
            Upload Prescription Document
          </h4>
          <p className="text-xs text-slate-500 mb-3 text-center">
            Drag & drop an image or PDF here, or <span className="text-teal-700 font-semibold underline">browse files</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-2xs text-slate-400">
            <span className="px-2 py-0.5 bg-slate-100 rounded">JPG, PNG, PDF</span>
            <span>•</span>
            <span>Max {maxSizeMB} MB</span>
            <span>•</span>
            <span>Encrypted in transit</span>
          </div>
        </label>
      ) : (
        <div className="border border-teal-200 bg-teal-50/40 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              {selectedFile.type === 'application/pdf' ? (
                <FileText className="w-5 h-5" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-2xs text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
              </p>
            </div>
          </div>

          {!isProcessing && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove uploaded file"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Privacy Notice Requirement */}
      <div className="mt-3 flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-2xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <span>
          <strong>Healthcare Privacy & Compliance Notice:</strong> Uploaded medical documents are processed securely in accordance with HIPAA standards. OCR text extraction is restricted to medication identification and safety reconciliation.
        </span>
      </div>
    </div>
  );
}
