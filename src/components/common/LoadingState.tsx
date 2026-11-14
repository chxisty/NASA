'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Retrieving NASA Earth Observation feeds...',
  subtext = 'Harmonizing MODIS & VIIRS telemetry across regional grids'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm min-h-[280px]">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
        <Loader2 className="w-5 h-5 text-orange-400 absolute inset-0 m-auto animate-pulse" />
      </div>
      <p className="text-slate-200 font-medium text-sm">{message}</p>
      {subtext && <p className="text-slate-400 text-xs mt-1 max-w-sm">{subtext}</p>}
    </div>
  );
};
