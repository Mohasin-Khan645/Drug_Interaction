import React from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { getSeverityConfig, SEVERITY_LEVELS } from '../../utils/severityUtils';

const iconMap = {
  [SEVERITY_LEVELS.CRITICAL]: AlertOctagon,
  [SEVERITY_LEVELS.MAJOR]: AlertTriangle,
  [SEVERITY_LEVELS.MODERATE]: AlertCircle,
  [SEVERITY_LEVELS.MINOR]: Info,
  [SEVERITY_LEVELS.INFORMATIONAL]: Info,
};

export default function SeverityBadge({
  severity,
  showIcon = true,
  size = 'md',
  className = '',
}) {
  const config = getSeverityConfig(severity);
  const IconComponent = iconMap[config.badgeText.toUpperCase()] || AlertCircle;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  };

  return (
    <span
      role="status"
      aria-label={`Severity Level: ${config.label}`}
      className={`inline-flex items-center rounded-full border shadow-2xs uppercase tracking-wider ${
        config.badgeClass
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      <span>{config.badgeText}</span>
    </span>
  );
}
