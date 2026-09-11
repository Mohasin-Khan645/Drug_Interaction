import React from 'react';

export default function LoadingSkeleton({
  variant = 'card',
  count = 1,
  className = '',
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => {
        if (variant === 'text') {
          return (
            <div key={idx} className="animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            </div>
          );
        }

        if (variant === 'avatar') {
          return (
            <div key={idx} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          );
        }

        if (variant === 'finding') {
          return (
            <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-white animate-pulse space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-full"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          );
        }

        // Default 'card'
        return (
          <div
            key={idx}
            className="p-5 border border-slate-200/80 rounded-xl bg-white shadow-subtle animate-pulse space-y-3"
          >
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            <div className="h-8 bg-slate-100 rounded w-full mt-4"></div>
          </div>
        );
      })}
    </div>
  );
}
