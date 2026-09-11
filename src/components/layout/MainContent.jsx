import React from 'react';

export default function MainContent({ children, className = '' }) {
  return (
    <main className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70 focus:outline-none ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {children}
      </div>
    </main>
  );
}
