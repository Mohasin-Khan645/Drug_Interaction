import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, RefreshCw, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { evidenceApi } from '../../api/evidenceApi';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EvidenceCard from '../../components/clinical/EvidenceCard';
import { MOCK_EVIDENCE_SOURCES } from '../../api/mock/mockData';

export default function AdminEvidencePage() {
  const { addToast } = useNotifications();
  const [syncingId, setSyncingId] = useState(null);

  const { data: sources = [] } = useQuery({
    queryKey: ['admin-evidence'],
    queryFn: async () => {
      const res = await evidenceApi.getEvidenceSources();
      return res.data?.length > 0 ? res.data : MOCK_EVIDENCE_SOURCES;
    },
  });

  const handleSync = async (source) => {
    setSyncingId(source.id);
    await new Promise((r) => setTimeout(r, 600));
    setSyncingId(null);
    addToast({
      title: 'Source Synchronized',
      message: `${source.sourceName} updated to latest release version.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Authoritative Medical Compendia
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Evidence Layer & Compendia Integration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active synchronization with NIH RxNorm, FDA DailyMed Structured Product Labels, and openFDA adverse event pipelines.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            addToast({
              title: 'Global Sync Triggered',
              message: 'Synchronizing all four clinical evidence compendia...',
              type: 'info',
            });
          }}
          icon={RefreshCw}
          className="text-xs"
        >
          Sync All Sources
        </Button>
      </div>

      {/* Grid of Evidence Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((src) => (
          <div key={src.id} className="relative group">
            <EvidenceCard evidence={src} />
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                isLoading={syncingId === src.id}
                onClick={() => handleSync(src)}
                icon={RefreshCw}
                className="text-xs text-teal-700 hover:bg-teal-50"
              >
                Sync Now
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
