import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mb-4 border border-teal-200">
        <Pill className="w-8 h-8 -rotate-45" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
        404 — Clinical Resource Not Found
      </h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The requested medication monograph, safety report, or page could not be located in the DrugSafe intelligence directory.
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
          icon={ArrowLeft}
          className="text-xs"
        >
          Go Back
        </Button>
        <Link to="/dashboard">
          <Button variant="primary" size="sm" icon={Home} className="text-xs">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
