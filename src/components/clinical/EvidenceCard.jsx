import React from 'react';
import { ExternalLink, Database, CheckCircle2, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export default function EvidenceCard({
  evidence,
  className = '',
}) {
  if (!evidence) return null;

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-subtle hover:border-teal-200 transition-all ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {evidence.sourceName || evidence.source}
            </h4>
            <p className="text-xs text-slate-500">
              Type: {evidence.type || 'Authoritative Clinical Compendium'}
            </p>
          </div>
        </div>

        <Badge
          variant={evidence.status === 'ACTIVE' || evidence.status === 'VERIFIED' ? 'emerald' : 'slate'}
          size="sm"
        >
          {evidence.status || 'VERIFIED'}
        </Badge>
      </div>

      <p className="text-xs text-slate-700 mb-4 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
        {evidence.summary || evidence.description || 'Continuous clinical drug labeling and contraindication database integration.'}
      </p>

      <div className="grid grid-cols-2 gap-2 text-2xs text-slate-500 mb-3 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Last Updated: {formatDate(evidence.lastUpdated)}</span>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Version: {evidence.version || 'v2026.08'}</span>
        </div>
      </div>

      {evidence.url && (
        <a
          href={evidence.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
        >
          <span>View Source Repository / Labeling</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
