'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No active fire records found',
  description = 'No satellite fire detections matching the specified spatial or radiative power thresholds in this acquisition window.',
  onReset,
  resetLabel = 'Reset Filters'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm min-h-[260px]">
      <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-3 text-slate-400">
        <AlertCircle className="w-6 h-6 text-slate-400" />
      </div>
      <h4 className="text-slate-200 font-medium text-sm mb-1">{title}</h4>
      <p className="text-slate-400 text-xs max-w-md mb-4">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
          {resetLabel}
        </button>
      )}
    </div>
  );
};

