import React from 'react';
import { Pill, ShieldCheck, Edit3, Trash2, Calendar, FileText } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters';

const sourceBadgeVariants = {
  Prescription: 'teal',
  OTC: 'blue',
  Supplement: 'emerald',
  Manual: 'slate',
};

export default function MedicationCard({
  medication,
  onView,
  onEdit,
  onRemove,
  onCheckSafety,
  className = '',
}) {
  if (!medication) return null;

  const sourceVariant = sourceBadgeVariants[medication.source] || 'slate';

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {medication.medicationName}
              </h4>
              {medication.genericName && (
                <p className="text-xs text-slate-500 italic">
                  Generic: {medication.genericName}
                </p>
              )}
            </div>
          </div>

          <Badge variant={sourceVariant} size="sm">
            {medication.source}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-2xs uppercase tracking-wider">Strength / Form</span>
            <span className="font-semibold text-slate-700">
              {medication.strength} {medication.form ? `• ${medication.form}` : ''}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-2xs uppercase tracking-wider">Frequency</span>
            <span className="font-semibold text-slate-700">{medication.frequency || 'Once daily'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-2xs uppercase tracking-wider">Status</span>
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {medication.status || 'Active'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-2xs uppercase tracking-wider">Added Date</span>
            <span className="text-slate-600 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatDate(medication.addedDate || medication.startDate)}
            </span>
          </div>
        </div>

        {medication.notes && (
          <p className="text-2xs text-slate-500 line-clamp-2 italic mb-3">
            Note: {medication.notes}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {onView && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(medication)}
              className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1"
            >
              Details
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(medication)}
              icon={Edit3}
              className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1"
            >
              Edit
            </Button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(medication)}
              aria-label={`Remove ${medication.medicationName}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {onCheckSafety && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCheckSafety(medication)}
            icon={ShieldCheck}
            className="text-xs text-teal-800 border-teal-200 hover:bg-teal-50 px-2.5 py-1"
          >
            Check Safety
          </Button>
        )}
      </div>
    </div>
  );
}
