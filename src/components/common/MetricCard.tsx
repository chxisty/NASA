'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'orange' | 'amber' | 'emerald' | 'blue' | 'red' | 'slate';
  };
  accent?: 'orange' | 'amber' | 'emerald' | 'blue' | 'red';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  badge,
  accent = 'orange'
}) => {
  const accentStyles = {
    orange: {
      border: 'hover:border-orange-500/50',
      iconBg: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.15)]'
    },
    amber: {
      border: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)]'
    },
    emerald: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]'
    },
    blue: {
      border: 'hover:border-blue-500/50',
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)]'
    },
    red: {
      border: 'hover:border-red-500/50',
      iconBg: 'bg-red-500/10 text-red-400 border border-red-500/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.15)]'
    }
  }[accent];

  const badgeStyles = {
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <div
      className={`group relative rounded-xl bg-slate-900/70 border border-slate-800 p-5 transition-all duration-300 ${accentStyles.border} ${accentStyles.glow} backdrop-blur-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              {value}
            </span>
            {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${accentStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
          {badge && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${
                badgeStyles[badge.variant]
              }`}
            >
              {badge.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
