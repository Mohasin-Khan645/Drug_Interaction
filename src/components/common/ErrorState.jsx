import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Service Unavailable',
  message = 'An error occurred while communicating with the clinical safety services. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-200 bg-red-50/50 p-6 text-center max-w-md mx-auto my-6 ${className}`}
    >
      <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-red-900 mb-1">{title}</h4>
      <p className="text-xs text-red-700 mb-4">{message}</p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          icon={RefreshCw}
          className="bg-white border-red-200 text-red-800 hover:bg-red-50"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
