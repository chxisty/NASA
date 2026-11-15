'use client';

import React from 'react';
import {
  Flame,
  Radio,
  Zap,
  TrendingUp,
  ShieldCheck,
  AlertOctagon,
  Layers,
  Thermometer,
  MapPin,
  Calendar,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { MetricCard } from '@/components/common/MetricCard';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { FireObservation, FireSummaryStats, TrendDataPoint, MLAnomaliesResponse } from '@/types';

interface OverviewSectionProps {
  summary: FireSummaryStats | null;
  observations: FireObservation[];
  trends?: TrendDataPoint[];
  anomaliesData?: MLAnomaliesResponse | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onViewMap: () => void;
  onViewAnomalies: () => void;
  onViewHarmonization?: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  summary,
  observations,
  trends = [],
  anomaliesData,
  isLoading,
  error,
  onRefresh,
  onViewMap,
  onViewAnomalies,
  onViewHarmonization
}) => {
  if (isLoading) {
    return <LoadingState message="Aggregating satellite telemetry and KPI metrics..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRefresh} />;
  }

  if (!summary || observations.length === 0) {
    return (
      <EmptyState
        title="No fire observations available"
        description="Unable to compile fire activity summary for the selected region. Try refreshing the stream."
        onReset={onRefresh}
        resetLabel="Fetch Observations"
      />
    );
  }

  // Derive regional summary aggregation
  const regionalAggregation: Record<
    string,
    { count: number; totalFrp: number; maxFrp: number; anomalies: number }
  > = {};

  observations.forEach((obs) => {
    const reg = obs.region || 'India (General)';
    if (!regionalAggregation[reg]) {
      regionalAggregation[reg] = { count: 0, totalFrp: 0, maxFrp: 0, anomalies: 0 };
    }
    regionalAggregation[reg].count += 1;
    regionalAggregation[reg].totalFrp += obs.frp || 0;
    regionalAggregation[reg].maxFrp = Math.max(regionalAggregation[reg].maxFrp, obs.frp || 0);
    if (obs.is_anomaly) regionalAggregation[reg].anomalies += 1;
  });

  const regionsList = Object.entries(regionalAggregation).map(([name, data]) => ({
    name,
    count: data.count,
    avgFrp: data.count > 0 ? (data.totalFrp / data.count).toFixed(1) : '0.0',
    maxFrp: data.maxFrp.toFixed(1),
    anomalies: data.anomalies
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Status */}
      <div className="p-4 rounded-xl bg-[#172235] border border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Active Earth Observation Telemetry</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Region: <span className="text-slate-200 font-medium">{summary.geographic_focus}</span> • Synchronized:{' '}
              <span className="text-slate-200 font-mono">{summary.last_updated}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onViewMap}
            className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors shadow-sm shadow-orange-500/20 cursor-pointer"
          >
            Open Live Map
          </button>
          {onViewHarmonization && (
            <button
              onClick={onViewHarmonization}
              className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-slate-800 text-orange-400 text-xs font-medium transition-colors border border-orange-500/30 cursor-pointer"
            >
              MODIS vs VIIRS
            </button>
          )}
          <button
            onClick={onViewAnomalies}
            className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
          >
            Review Anomalies ({anomaliesData?.anomalous_grids_count ?? summary.anomalous_fire_count})
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Fire Observations"
          value={summary.total_detections}
          unit="hotspots"
          subtitle={`${summary.viirs_count} VIIRS + ${summary.modis_count} MODIS`}
          icon={Flame}
          accent="orange"
          badge={{ text: 'Multi-Sensor', variant: 'orange' }}
        />

        <MetricCard
          title="VIIRS 375m Detections"
          value={summary.viirs_count}
          unit="points"
          subtitle="Suomi NPP, NOAA-20 & NOAA-21"
          icon={Zap}
          accent="amber"
          badge={{ text: 'High Resolution', variant: 'amber' }}
        />

        <MetricCard
          title="MODIS 1km Detections"
          value={summary.modis_count}
          unit="points"
          subtitle="Terra (10:30) & Aqua (13:30)"
          icon={Layers}
          accent="emerald"
          badge={{ text: 'Long-term Baseline', variant: 'emerald' }}
        />

        <MetricCard
          title="Unusual Activity Alerts"
          value={anomaliesData?.anomalous_grids_count ?? summary.anomalous_fire_count}
          unit="anomalies"
          subtitle="Isolation Forest Outlier Grids"
          icon={AlertOctagon}
          accent={summary.anomalous_fire_count > 0 ? 'red' : 'emerald'}
          badge={{
            text: summary.anomalous_fire_count > 0 ? 'Action Recommended' : 'Nominal',
            variant: summary.anomalous_fire_count > 0 ? 'red' : 'emerald'
          }}
        />
      </div>

      {/* Charts & Sensor Fusion Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Daily Fire Activity Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#172235] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-orange-400" />
                Daily Fire Activity Trends
              </h4>
              <p className="text-sm font-bold text-white mt-0.5">MODIS 1km vs VIIRS 375m Detections</p>
            </div>
            <span className="text-xs font-mono text-orange-400 font-medium">Daily Counts</span>
          </div>

          <div className="h-64 w-full">
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

        {/* Sensor Fusion Balance Card */}
        <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                Sensor Observation Ratio
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">Resolution Split</span>
            </div>

            <div className="space-y-4">
              {/* VIIRS Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">VIIRS 375m (SNPP / NOAA)</span>
                  <span className="text-orange-400 font-mono">{summary.viirs_count} detections</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${summary.total_detections ? (summary.viirs_count / summary.total_detections) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* MODIS Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">MODIS 1km (Terra / Aqua)</span>
                  <span className="text-amber-400 font-mono">{summary.modis_count} detections</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${summary.total_detections ? (summary.modis_count / summary.total_detections) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Mean FRP:</span>
                <span className="text-orange-400 font-mono font-bold">{summary.avg_frp_mw.toFixed(1)} MW</span>
              </div>
              <div className="flex justify-between">
                <span>Peak Fire Front:</span>
                <span className="text-red-400 font-mono font-bold">{summary.max_frp_mw.toFixed(1)} MW</span>
              </div>
              <div className="flex justify-between">
                <span>Peak Brightness:</span>
                <span className="text-amber-300 font-mono font-semibold">{summary.max_brightness_k.toFixed(1)} K</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Sensor footprint ratio: ~7 VIIRS pixels per 1 MODIS pixel.
          </div>
        </div>
      </div>

      {/* Regional Activity Summary & Recent Observations Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Regional Activity Summary */}
        <div className="p-5 rounded-xl bg-[#172235] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              Regional Activity Summary
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">{regionsList.length} Zones</span>
          </div>

          <div className="space-y-3">
            {regionsList.map((region) => (
              <div
                key={region.name}
                className="p-3 rounded-lg bg-[#111827] border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="font-semibold text-xs text-white">{region.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Mean FRP: <span className="font-mono text-orange-400 font-semibold">{region.avgFrp} MW</span> • Max:{' '}
                    <span className="font-mono text-amber-300">{region.maxFrp} MW</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-slate-100">{region.count} fires</div>
                  {region.anomalies > 0 ? (
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                      {region.anomalies} Anomaly
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-medium">Nominal</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Fire Observations Table */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#172235] border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Recent Fire Observations
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              Showing {Math.min(6, observations.length)} of {observations.length}
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111827] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Satellite / ID</th>
                  <th className="py-2.5 px-3">Coordinates</th>
                  <th className="py-2.5 px-3">Brightness (K)</th>
                  <th className="py-2.5 px-3">FRP (MW)</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {observations.slice(0, 6).map((obs) => (
                  <tr key={obs.id || `${obs.latitude}-${obs.longitude}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">{obs.satellite}</div>
                      <div className="text-[10px] text-slate-400">
                        {obs.instrument} • {obs.id}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {obs.latitude.toFixed(3)}°N, {obs.longitude.toFixed(3)}°E
                    </td>
                    <td className="py-2.5 px-3 text-amber-300 font-semibold">{obs.brightness.toFixed(1)} K</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          (obs.frp || 0) > 100
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-orange-500/10 text-orange-400'
                        }`}
                      >
                        {obs.frp ? `${obs.frp.toFixed(1)} MW` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans text-xs">{obs.region || 'India'}</td>
                    <td className="py-2.5 px-3">
                      {obs.is_anomaly ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                          Anomaly
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Nominal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
