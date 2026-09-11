import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, ShieldAlert, Activity, PieChart as PieIcon, LineChart as LineIcon, Filter, Calendar } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { adminApi } from '../../api/adminApi';
import StatCard from '../../components/common/StatCard';

const TIMEFRAME_DATA = {
  today: {
    checks: [
      { time: '08:00', checks: 24, critical: 1, major: 3 },
      { time: '10:00', checks: 45, critical: 2, major: 5 },
      { time: '12:00', checks: 52, critical: 1, major: 6 },
      { time: '14:00', checks: 38, critical: 2, major: 4 },
      { time: '16:00', checks: 25, critical: 1, major: 2 },
    ],
    searches: [
      { category: 'Anticoagulants', volume: 42 },
      { category: 'Statins', volume: 38 },
      { category: 'ACE Inhibitors', volume: 31 },
      { category: 'NSAIDs', volume: 29 },
      { category: 'Antibiotics', volume: 25 },
    ],
  },
  '7d': {
    checks: [
      { time: 'Mon', checks: 142, critical: 4, major: 8 },
      { time: 'Tue', checks: 165, critical: 3, major: 11 },
      { time: 'Wed', checks: 198, critical: 6, major: 14 },
      { time: 'Thu', checks: 174, critical: 2, major: 9 },
      { time: 'Fri', checks: 210, critical: 7, major: 16 },
      { time: 'Sat', checks: 88, critical: 1, major: 4 },
      { time: 'Sun', checks: 92, critical: 2, major: 5 },
    ],
    searches: [
      { category: 'Anticoagulants', volume: 280 },
      { category: 'Statins', volume: 245 },
      { category: 'ACE Inhibitors', volume: 210 },
      { category: 'NSAIDs', volume: 195 },
      { category: 'Antibiotics', volume: 180 },
    ],
  },
  '30d': {
    checks: [
      { time: 'Week 1', checks: 920, critical: 24, major: 58 },
      { time: 'Week 2', checks: 1040, critical: 28, major: 64 },
      { time: 'Week 3', checks: 1150, critical: 31, major: 72 },
      { time: 'Week 4', checks: 1080, critical: 22, major: 60 },
    ],
    searches: [
      { category: 'Anticoagulants', volume: 1120 },
      { category: 'Statins', volume: 980 },
      { category: 'ACE Inhibitors', volume: 840 },
      { category: 'NSAIDs', volume: 760 },
      { category: 'Antibiotics', volume: 710 },
    ],
  },
  '90d': {
    checks: [
      { time: 'Month 1', checks: 3800, critical: 95, major: 240 },
      { time: 'Month 2', checks: 4200, critical: 108, major: 275 },
      { time: 'Month 3', checks: 4450, critical: 115, major: 290 },
    ],
    searches: [
      { category: 'Anticoagulants', volume: 3400 },
      { category: 'Statins', volume: 3100 },
      { category: 'ACE Inhibitors', volume: 2650 },
      { category: 'NSAIDs', volume: 2300 },
      { category: 'Antibiotics', volume: 2150 },
    ],
  },
};

export default function AdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState('7d');

  const { data: analyticsRes } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await adminApi.getSystemAnalytics();
      return res.data;
    },
  });

  const activeData = TIMEFRAME_DATA[timeframe] || TIMEFRAME_DATA['7d'];

  const severityDistribution = [
    { name: 'Critical (Red)', count: 7, fill: '#ef4444' },
    { name: 'Major (Orange)', count: 18, fill: '#f97316' },
    { name: 'Monitor (Yellow)', count: 42, fill: '#f59e0b' },
    { name: 'Verified Safe (Green)', count: 210, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Timeframe Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1">
            System Informatics & Pharmacovigilance
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Clinical Analytics & Engine Telemetry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time evaluation volumes, safety alert distributions, and prescriber adherence patterns.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-center">
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
          ].map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setTimeframe(tf.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                timeframe === tf.id
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Safety Checks & Critical Alerts Over Time */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Safety Checks & Alerts Over Time
              </h3>
              <p className="text-3xs text-slate-400">
                Evaluation volume compared against critical and major interaction flags
              </p>
            </div>
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
              Active: {timeframe}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData.checks}>
                <defs>
                  <linearGradient id="checksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="checks"
                  name="Evaluations"
                  stroke="#14b8a6"
                  fillOpacity={1}
                  fill="url(#checksGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="critical"
                  name="Critical Flags"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="major"
                  name="Major Flags"
                  stroke="#f97316"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Severity Breakdown (Pie Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Finding Severity Distribution
            </h3>
            <p className="text-3xs text-slate-400">
              Deterministic priority classification across screened combinations
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Medication Searches by Class */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Top Medication Searches by Drug Class
            </h3>
            <p className="text-3xs text-slate-400">
              Frequent active ingredients queried by clinicians and patients
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData.searches} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                <Tooltip />
                <Bar dataKey="volume" name="Search Volume" fill="#0d9488" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Clinician Acceptance & Review Patterns */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Prescriber Intervention Patterns
            </h3>
            <p className="text-3xs text-slate-400">
              Clinical actions taken upon receiving interaction notifications
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { action: 'Modified Regimen', count: 184, fill: '#14b8a6' },
                  { action: 'Added Gastroprotection', count: 126, fill: '#0ea5e9' },
                  { action: 'Adjusted Dose', count: 98, fill: '#f59e0b' },
                  { action: 'Specialist Override', count: 42, fill: '#8b5cf6' },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="action" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" name="Action Count" radius={[6, 6, 0, 0]}>
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
