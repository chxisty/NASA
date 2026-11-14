'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  error?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Telemetry ingestion error',
  error = 'Unable to establish real-time connection with FIRMS satellite telemetry stream.',
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-red-950/20 border border-red-900/40 backdrop-blur-sm min-h-[220px]">
      <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center mb-3 text-red-400">
        <AlertTriangle className="w-5 h-5 text-red-400" />
      </div>
      <h4 className="text-red-200 font-medium text-sm mb-1">{title}</h4>
      <p className="text-red-300/80 text-xs max-w-md mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-200 transition-colors border border-red-800/60"
        >
          <RefreshCw className="w-3.5 h-3.5 text-red-300" />
          Retry Connection
        </button>
      )}
    </div>
  );
};
