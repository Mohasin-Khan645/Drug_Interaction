import React from 'react';

export default function Card({
  children,
  title,
  subtitle,
  action,
  headerIcon: HeaderIcon,
  className = '',
  bodyClassName = 'p-5',
  headerClassName = 'px-5 py-4 border-b border-slate-100',
  footer,
  footerClassName = 'px-5 py-3.5 bg-slate-50 border-t border-slate-100 rounded-b-xl',
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow ${className}`}
      {...props}
    >
      {(title || subtitle || action || HeaderIcon) && (
        <div className={`flex items-center justify-between gap-3 ${headerClassName}`}>
          <div className="flex items-center gap-2.5">
            {HeaderIcon && (
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                <HeaderIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className={bodyClassName}>{children}</div>

      {footer && <div className={footerClassName}>{footer}</div>}
    </div>
  );
}
