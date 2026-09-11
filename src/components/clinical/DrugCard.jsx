import React from 'react';
import { Pill, Plus, ArrowRight, ShieldAlert } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function DrugCard({
  drug,
  onViewDetails,
  onAddMedication,
  onCheckInteraction,
  isAdded = false,
  className = '',
}) {
  if (!drug) return null;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle hover:shadow-card hover:border-teal-300 transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {drug.name}
              </h3>
              <p className="text-xs text-slate-500 italic">
                Generic: {drug.genericName}
              </p>
            </div>
          </div>

          {drug.drugClass && (
            <Badge variant="teal" size="sm" pill>
              {drug.drugClass}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
          <div className="flex justify-between">
            <span className="text-slate-400">Active Ingredient:</span>
            <span className="font-medium text-slate-700">{drug.activeIngredient || drug.genericName}</span>
          </div>
          {drug.brandNames && drug.brandNames.length > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">Brand Names:</span>
              <span className="font-medium text-slate-700 truncate max-w-[180px]">
                {Array.isArray(drug.brandNames) ? drug.brandNames.join(', ') : drug.brandNames}
              </span>
            </div>
          )}
          {drug.rxNormCode && (
            <div className="flex justify-between">
              <span className="text-slate-400">RxNorm ID:</span>
              <span className="font-mono text-slate-600 font-semibold">{drug.rxNormCode}</span>
            </div>
          )}
        </div>

        {drug.blackBoxWarning && (
          <div className="mb-4 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Black Box Warning on Label</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {onViewDetails && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails(drug)}
            className="text-xs text-teal-800 hover:text-teal-900 p-0"
          >
            Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {onCheckInteraction && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCheckInteraction(drug)}
              className="text-xs px-2.5 py-1"
            >
              Check Safety
            </Button>
          )}
          {onAddMedication && (
            <Button
              size="sm"
              variant={isAdded ? 'secondary' : 'primary'}
              disabled={isAdded}
              onClick={() => onAddMedication(drug)}
              icon={!isAdded ? Plus : undefined}
              className="text-xs px-2.5 py-1"
            >
              {isAdded ? 'Added' : 'Add'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
