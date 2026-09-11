import React from 'react';

/**
 * ClinicalCard - Shared Design System Pure White Card
 * Used across Patient, Doctor, and Pharmacist workspaces for clean clinical display.
 */
export default function ClinicalCard({
  title,
  subtitle,
  badge,
  actions,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm' : ''
      } ${className}`}
    >
      {(title || subtitle || badge || actions) && (
        <div className={`px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 ${headerClassName}`}>
          <div>
            <div className="flex items-center gap-2">
              {title && (
                <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
              )}
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

