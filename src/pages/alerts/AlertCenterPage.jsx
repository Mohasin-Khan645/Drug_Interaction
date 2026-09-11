import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Search,
  CheckCheck,
  Archive,
  Filter,
  AlertOctagon,
  AlertTriangle,
  Info,
  Calendar,
} from 'lucide-react';
import { alertApi } from '../../api/alertApi';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SeverityBadge from '../../components/common/SeverityBadge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { formatTimeAgo, formatDate } from '../../utils/formatters';

export default function AlertCenterPage() {
  const queryClient = useQueryClient();
  const { addToast } = useNotifications();

  const [activeSeverityFilter, setActiveSeverityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await alertApi.getAlerts();
      return res.data || [];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => alertApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      addToast({ title: 'Alert Updated', message: 'Marked as read.', type: 'info' });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => alertApi.archiveAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      addToast({ title: 'Alert Archived', message: 'Moved to archived storage.', type: 'info' });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => alertApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      addToast({ title: 'All Read', message: 'All alerts marked as read.', type: 'success' });
    },
  });

  const filteredAlerts = alerts.filter((a) => {
    if (activeSeverityFilter !== 'ALL' && a.severity !== activeSeverityFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.medication && a.medication.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const unreadCount = alerts.filter((a) => a.status === 'UNREAD').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Real-Time Pharmacovigilance
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Safety Alert & Notification Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {unreadCount} unread prioritized clinical alerts requiring patient or physician attention.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllMutation.mutate()}
          disabled={unreadCount === 0 || markAllMutation.isPending}
          icon={CheckCheck}
          className="text-xs"
        >
          Mark All as Read
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts by drug or concern..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        </div>

        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'CRITICAL', 'MAJOR', 'MODERATE', 'INFORMATIONAL'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setActiveSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeSeverityFilter === sev
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <LoadingSkeleton variant="finding" count={4} />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts matching criteria"
          description="There are currently no active safety notifications in this severity category."
        />
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-5 transition-all ${
                alert.status === 'UNREAD'
                  ? 'border-teal-300 bg-teal-50/20 ring-1 ring-teal-200/60'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={alert.severity} size="sm" />
                    <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                    {alert.status === 'UNREAD' && (
                      <span className="px-1.5 py-0.2 rounded-full text-3xs font-bold uppercase bg-red-100 text-red-700">
                        New
                      </span>
                    )}
                  </div>

                  {alert.medication && (
                    <p className="text-xs font-semibold text-teal-800">
                      Medication / Interaction: {alert.medication}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-3 text-2xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(alert.date)} ({formatTimeAgo(alert.date)})
                    </span>
                    <span>•</span>
                    <span>Patient: {alert.patientName || 'Sarah Jenkins'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {alert.status === 'UNREAD' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markReadMutation.mutate(alert.id)}
                      icon={CheckCheck}
                      className="text-xs bg-white"
                    >
                      Mark Read
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => archiveMutation.mutate(alert.id)}
                    title="Archive alert"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
