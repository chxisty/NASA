'use client';

import React from 'react';

interface StatusBadgeProps {
  status: 'nominal' | 'active' | 'anomaly' | 'high' | 'offline';
  label?: string;
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  pulse = false
}) => {
  const configs = {
    nominal: {
      dot: 'bg-emerald-500',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      defaultLabel: 'Nominal'
    },
    active: {
      dot: 'bg-orange-500',
      text: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      defaultLabel: 'Active'
    },
    anomaly: {
      dot: 'bg-red-500',
      text: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
      defaultLabel: 'Anomaly'
    },
    high: {
      dot: 'bg-amber-500',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      defaultLabel: 'Elevated'
    },
    offline: {
      dot: 'bg-slate-500',
      text: 'text-slate-400',
      bg: 'bg-slate-500/10 border-slate-500/20',
      defaultLabel: 'Offline'
    }
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${configs.bg} ${configs.text}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${configs.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${configs.dot}`} />
      </span>
      {label || configs.defaultLabel}
    </span>
  );
};
