import React from 'react';

export default function ProgressBar({
  progress = 0,
  label,
  showPercentage = true,
  statusText,
  color = 'teal',
  className = '',
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const colorMap = {
    teal: 'bg-teal-600',
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    red: 'bg-red-600',
  };

  const barColor = colorMap[color] || colorMap.teal;

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage || statusText) && (
        <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5">
          <span className="font-medium text-slate-700">{label || statusText}</span>
          {showPercentage && <span className="font-semibold text-slate-900">{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300 rounded-full`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
}
