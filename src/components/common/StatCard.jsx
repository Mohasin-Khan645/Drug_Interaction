import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'neutral', // 'up' | 'down' | 'neutral'
  variant = 'default', // 'default' | 'critical' | 'teal' | 'amber'
  className = '',
}) {
  const variantStyles = {
    default: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white',
    critical: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-950 dark:text-rose-200',
    teal: 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/40 text-teal-950 dark:text-teal-200',
    amber: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-200',
  }[variant] || 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white';

  const iconStyles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    critical: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300',
    teal: 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300',
    amber: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
  }[variant] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

  return (
    <div className={`p-5 rounded-2xl border shadow-sm transition-all duration-150 ${variantStyles} ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconStyles}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <p className="text-2xl sm:text-3xl font-black tracking-tight">{value}</p>

        {trend && (
          <div
            className={`flex items-center gap-0.5 text-2xs font-bold ${
              trendDirection === 'up'
                ? 'text-emerald-600 dark:text-emerald-400'
                : trendDirection === 'down'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-500'
            }`}
          >
            {trendDirection === 'up' && <ArrowUpRight className="w-3 h-3" />}
            {trendDirection === 'down' && <ArrowDownRight className="w-3 h-3" />}
            {trendDirection === 'neutral' && <Minus className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-3xs text-slate-500 dark:text-slate-400 mt-1 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}

