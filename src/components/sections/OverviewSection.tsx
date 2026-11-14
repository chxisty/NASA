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
  Thermometer
} from 'lucide-react';
import { MetricCard } from '@/components/common/MetricCard';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { FireObservation, FireSummaryStats } from '@/types';

interface OverviewSectionProps {
  summary: FireSummaryStats | null;
  observations: FireObservation[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onViewMap: () => void;
  onViewAnomalies: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  summary,
  observations,
  isLoading,
  error,
  onRefresh,
  onViewMap,
  onViewAnomalies
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

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Status */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-950/30 via-slate-900 to-slate-900 border border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Active Earth Observation Telemetry</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Region: <span className="text-slate-200 font-medium">{summary.geographic_focus}</span> • Synchronized: <span className="text-slate-200 font-mono">{summary.last_updated}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewMap}
            className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors shadow-sm shadow-orange-500/20"
          >
            Open Live Map
          </button>
          <button
            onClick={onViewAnomalies}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
          >
            Review Anomalies
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Active Hotspots"
          value={summary.total_detections}
          unit="points"
          subtitle={`${summary.viirs_count} VIIRS + ${summary.modis_count} MODIS`}
          icon={Flame}
          accent="orange"
          badge={{ text: 'Real-time', variant: 'orange' }}
        />

        <MetricCard
          title="Mean Fire Radiative Power"
          value={summary.avg_frp_mw}
          unit="MW"
          subtitle={`Peak Front: ${summary.max_frp_mw} MW`}
          icon={Zap}
          accent="amber"
          badge={{ text: 'Thermal Output', variant: 'amber' }}
        />

        <MetricCard
          title="Peak Brightness Temperature"
          value={summary.max_brightness_k}
          unit="K"
          subtitle="Sensor Radiance saturation index"
          icon={Thermometer}
          accent="emerald"
          badge={{ text: 'Calibrated', variant: 'emerald' }}
        />

        <MetricCard
          title="Flagged AI Anomalies"
          value={summary.anomalous_fire_count}
          unit="clusters"
          subtitle="Extreme FRP & dense flare patterns"
          icon={AlertOctagon}
          accent={summary.anomalous_fire_count > 0 ? 'red' : 'emerald'}
          badge={{
            text: summary.anomalous_fire_count > 0 ? 'Action Recommended' : 'Normal',
            variant: summary.anomalous_fire_count > 0 ? 'red' : 'emerald'
          }}
        />
      </div>

      {/* Harmonization Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sensor Fusion Card */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" />
              Sensor Fusion Balance
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">MODIS vs VIIRS</span>
          </div>

          <div className="space-y-4">
            {/* VIIRS Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">VIIRS 375m (SNPP / NOAA)</span>
                <span className="text-orange-400 font-mono">{summary.viirs_count} detections</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
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
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${summary.total_detections ? (summary.modis_count / summary.total_detections) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex justify-between">
              <span>Primary Instrument:</span>
              <span className="text-slate-200 font-semibold">{summary.primary_instrument}</span>
            </div>
            <div className="flex justify-between">
              <span>High Confidence Hits:</span>
              <span className="text-emerald-400 font-semibold font-mono">{summary.high_confidence_count}</span>
            </div>
          </div>
        </div>

        {/* Live Observations Harmonized Table */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Latest Harmonized Fire Records
            </h4>
            <span className="text-xs text-slate-400 font-mono">Showing {Math.min(6, observations.length)} of {observations.length}</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Satellite / ID</th>
                  <th className="py-2.5 px-3">Coordinates</th>
                  <th className="py-2.5 px-3">Brightness (K)</th>
                  <th className="py-2.5 px-3">FRP (MW)</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {observations.slice(0, 6).map((obs) => (
                  <tr key={obs.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">{obs.satellite}</div>
                      <div className="text-[10px] text-slate-400">{obs.instrument} • {obs.id}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {obs.latitude.toFixed(3)}°N, {obs.longitude.toFixed(3)}°E
                    </td>
                    <td className="py-2.5 px-3 text-amber-300 font-semibold">
                      {obs.brightness.toFixed(1)} K
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        (obs.frp || 0) > 100
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {obs.frp ? `${obs.frp.toFixed(1)} MW` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans text-xs">
                      {obs.region || 'India'}
                    </td>
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
