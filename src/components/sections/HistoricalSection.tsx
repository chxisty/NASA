'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  BarChart3,
  Flame,
  Zap,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { MetricCard } from '@/components/common/MetricCard';
import { TrendDataPoint } from '@/types';

interface HistoricalSectionProps {
  trends: TrendDataPoint[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const HistoricalSection: React.FC<HistoricalSectionProps> = ({
  trends,
  isLoading,
  onRefresh
}) => {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);

  if (isLoading) {
    return <LoadingState message="Aggregating historical sensor trends..." />;
  }

  const totalDetections = trends.reduce((acc, curr) => acc + curr.total_count, 0);
  const maxFRP = Math.max(...trends.map((t) => t.max_frp), 0);
  const avgFRP = (trends.reduce((acc, curr) => acc + curr.avg_frp, 0) / (trends.length || 1)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Controls & Summary Cards */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            Seasonal Fire Frequency & Radiative Energy Trends
          </h3>
          <p className="text-xs text-slate-400">
            Temporal patterns across MODIS and VIIRS satellite orbits in India
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-medium">
          {([7, 14, 30] as const).map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-3 py-1 rounded-md transition-all ${
                timeRange === days
                  ? 'bg-orange-500 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Period Cumulative Hotspots"
          value={totalDetections}
          unit="events"
          subtitle={`Across ${timeRange} observed acquisition days`}
          icon={Flame}
          accent="orange"
          badge={{ text: 'Multi-Sensor', variant: 'orange' }}
        />

        <MetricCard
          title="Period Peak Radiative Power"
          value={maxFRP}
          unit="MW"
          subtitle="Highest thermal emission registered"
          icon={Zap}
          accent="red"
          badge={{ text: 'Peak Front', variant: 'red' }}
        />

        <MetricCard
          title="Average Radiative Output"
          value={avgFRP}
          unit="MW"
          subtitle="Baseline steady-state combustion"
          icon={TrendingUp}
          accent="amber"
          badge={{ text: 'Energy Mean', variant: 'amber' }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Volume Chart */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Daily Detection Frequency
              </h4>
              <p className="text-sm font-bold text-white mt-0.5">MODIS vs VIIRS Sensor Volume</p>
            </div>
            <span className="text-xs font-mono text-orange-400">Detections / Day</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => <span className="text-slate-300">{value}</span>}
                />
                <Bar dataKey="viirs_count" name="VIIRS (375m)" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="modis_count" name="MODIS (1km)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fire Radiative Power (FRP) Chart */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Radiative Intensity Profile
              </h4>
              <p className="text-sm font-bold text-white mt-0.5">Average vs Peak FRP (MW)</p>
            </div>
            <span className="text-xs font-mono text-amber-400">Megawatts</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMaxFrp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAvgFrp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => <span className="text-slate-300">{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="max_frp"
                  name="Peak FRP (MW)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMaxFrp)"
                />
                <Area
                  type="monotone"
                  dataKey="avg_frp"
                  name="Avg FRP (MW)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAvgFrp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

