import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Archive, Filter, Search, X, AlertCircle } from 'lucide-react';
import Drawer from '../common/Drawer';
import SeverityBadge from '../common/SeverityBadge';
import Button from '../common/Button';
import LoadingSkeleton from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';
import { alertApi } from '../../api/alertApi';
import { useNotifications } from '../../context/NotificationContext';
import { formatTimeAgo } from '../../utils/formatters';

export default function NotificationPanel() {
  const { isNotificationPanelOpen, setIsNotificationPanelOpen } = useNotifications();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, CRITICAL, MAJOR, MODERATE, INFORMATIONAL
  const [searchTerm, setSearchTerm] = useState('');

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await alertApi.getAlerts();
      return res.data || [];
    },
    enabled: isNotificationPanelOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => alertApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => alertApi.archiveAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => alertApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const filteredAlerts = alerts
    .filter((a) => {
      if (activeFilter !== 'ALL' && a.severity !== activeFilter) return false;
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
    <Drawer
      isOpen={isNotificationPanelOpen}
      onClose={() => setIsNotificationPanelOpen(false)}
      title="Medication Safety Alerts"
      subtitle={`${unreadCount} unread prioritized clinical notification${unreadCount === 1 ? '' : 's'}`}
      width="max-w-md"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => markAllMutation.mutate()}
            disabled={unreadCount === 0 || markAllMutation.isPending}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 disabled:opacity-50 flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsNotificationPanelOpen(false)}
            className="text-xs text-slate-500"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter alerts by medication or keyword..."
            className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-2xs font-semibold">
          {['ALL', 'CRITICAL', 'MAJOR', 'MODERATE', 'INFORMATIONAL'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setActiveFilter(sev)}
              className={`px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors ${
                activeFilter === sev
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Alert Cards List */}
        <div className="space-y-2.5 pt-1">
          {isLoading ? (
            <LoadingSkeleton variant="finding" count={3} />
          ) : filteredAlerts.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No alerts found"
              description="No safety notifications meet the active search or severity filter criteria."
            />
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border text-xs transition-all relative ${
                  alert.status === 'UNREAD'
                    ? 'border-teal-300 bg-teal-50/30 ring-1 ring-teal-100 shadow-xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <SeverityBadge severity={alert.severity} size="sm" />
                    <span className="text-3xs text-slate-400">
                      {formatTimeAgo(alert.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {alert.status === 'UNREAD' && (
                      <button
                        type="button"
                        onClick={() => markReadMutation.mutate(alert.id)}
                        title="Mark as read"
                        className="p-1 rounded text-teal-700 hover:bg-teal-100/60"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => archiveMutation.mutate(alert.id)}
                      title="Archive alert"
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h5 className="font-bold text-slate-900 mb-0.5 leading-snug">
                  {alert.title}
                </h5>

                {alert.medication && (
                  <p className="text-2xs font-semibold text-teal-800 mb-1">
                    Medication: {alert.medication}
                  </p>
                )}

                <p className="text-2xs text-slate-600 leading-relaxed">
                  {alert.description}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Drawer>
  );
}
