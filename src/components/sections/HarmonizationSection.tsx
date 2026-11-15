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
  Legend
} from 'recharts';
import {
  Layers,
  Scale,
  Zap,
  Flame,
  AlertCircle,
  HelpCircle,
  GitMerge,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';
import { MetricCard } from '@/components/common/MetricCard';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { HarmonizationSummaryResponse, HarmonizedFireRecord } from '@/types';

interface HarmonizationSectionProps {
  summary: HarmonizationSummaryResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const HarmonizationSection: React.FC<HarmonizationSectionProps> = ({
  summary,
  isLoading,
  onRefresh
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNIQUE_MODIS' | 'UNIQUE_VIIRS' | 'COINCIDENT_OVERLAP'>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<HarmonizedFireRecord | null>(null);

  if (isLoading) {
    return (
      <LoadingState
        message="Harmonizing multi-sensor MODIS and VIIRS telemetry..."
        subtext="Matching spatiotemporal coincidences, computing pixel footprints, and executing de-duplication"
      />
    );
  }

  if (!summary) {
    return (
      <EmptyState
        title="Harmonization Data Unavailable"
        description="Unable to compute cross-sensor harmonization metrics. Try refreshing the telemetry stream."
        onReset={onRefresh}
      />
    );
  }

  const filteredRecords = summary.harmonized_records.filter((rec) => {
    if (activeFilter === 'ALL') return true;
    return rec.coincidence_status === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Scientific Principle Alert Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/20 border border-orange-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Multi-Sensor Harmonization & De-Duplication</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Scientific Standard
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              MODIS (1 km) and VIIRS (375 m) have fundamentally different spatial resolutions. 
              <strong> Raw counts are never simply added together</strong>. Concurrent passes over the same fire front are linked via 
              spatiotemporal coincidence analysis (<span className="text-orange-400 font-mono">Δd ≤ 1.5 km, Δt ≤ 90 min</span>) to prevent double counting.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Distinct Physical Complexes</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {summary.distinct_fire_complexes_count} <span className="text-xs font-normal text-slate-400">from {summary.total_raw_observations} raw</span>
          </div>
        </div>
      </div>

      {/* Top Comparative KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="VIIRS Detections (375m)"
          value={summary.viirs_metrics.raw_detections}
          unit="points"
          subtitle={`Mean Footprint: ${summary.viirs_metrics.mean_footprint_km2} km²`}
          icon={Flame}
          accent="orange"
          badge={{ text: 'High Resolution', variant: 'orange' }}
        />

        <MetricCard
          title="MODIS Detections (1km)"
          value={summary.modis_metrics.raw_detections}
          unit="points"
          subtitle={`Mean Footprint: ${summary.modis_metrics.mean_footprint_km2} km²`}
          icon={Flame}
          accent="amber"
          badge={{ text: 'Legacy Benchmark', variant: 'amber' }}
        />

        <MetricCard
          title="Resolution Multiplier"
          value={`${summary.viirs_to_modis_detection_ratio}x`}
          subtitle="VIIRS to MODIS detection density ratio"
          icon={Scale}
          accent="blue"
          badge={{ text: 'Spatial Scale', variant: 'blue' }}
        />

        <MetricCard
          title="Combined Distinct Fires"
          value={summary.distinct_fire_complexes_count}
          unit="events"
          subtitle={`${summary.coincident_overlaps_count} coincident overlapping pixels`}
          icon={GitMerge}
          accent="emerald"
          badge={{ text: 'De-duplicated', variant: 'emerald' }}
        />
      </div>

      {/* Visual Resolution Disparity Diagram & Sensor Side-by-Side Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Pixel Comparison Card */}
        <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-orange-400" />
                Footprint Comparison
              </h4>
              <span className="text-[10px] font-mono text-slate-400">1 km vs 375 m</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              A single 1 km MODIS pixel covers ~7 times the surface area of a 375m VIIRS pixel at nadir.
              The diagram below illustrates how multiple VIIRS pixels fit inside a single MODIS footprint:
            </p>

            {/* Visual Diagram */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
              {/* Outer MODIS Pixel Box (1km x 1km) */}
              <div className="relative w-48 h-48 border-2 border-dashed border-amber-500/80 rounded-lg p-2 bg-amber-500/5 flex flex-col justify-between">
                <span className="absolute -top-3 left-3 px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[10px] font-bold font-mono">
                  MODIS Pixel (1.0 km²)
                </span>

                {/* Sub-grid of VIIRS 375m Pixels */}
                <div className="grid grid-cols-3 gap-1.5 h-full pt-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="border border-orange-500/60 bg-orange-500/20 rounded flex items-center justify-center text-[10px] font-mono text-orange-300 font-bold"
                    >
                      375m
                    </div>
                  ))}
                  <div className="col-span-3 text-center text-[10px] text-slate-400 font-mono mt-1">
                    ~7 VIIRS Pixels per 1 MODIS Pixel
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>MODIS Nadir Area: <strong className="text-slate-200">1.0 km²</strong></span>
            <span>VIIRS Nadir Area: <strong className="text-slate-200">0.14 km²</strong></span>
          </div>
        </div>

        {/* Side-by-Side Sensor Specification Table */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#172235] border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Sensor Detection Metrics: MODIS vs VIIRS
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Instrument Comparison</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Metric / Property</th>
                  <th className="py-2.5 px-3 text-amber-400">MODIS (Aqua & Terra)</th>
                  <th className="py-2.5 px-3 text-orange-400">VIIRS (SNPP & NOAA-20/21)</th>
                  <th className="py-2.5 px-3 text-emerald-400">Harmonized Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-white">Active Detections</td>
                  <td className="py-2.5 px-3 text-amber-300 font-bold">{summary.modis_metrics.raw_detections} hotspots</td>
                  <td className="py-2.5 px-3 text-orange-400 font-bold">{summary.viirs_metrics.raw_detections} hotspots</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-sans">
                    {summary.distinct_fire_complexes_count} distinct complexes
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-white">Mean Ground Footprint</td>
                  <td className="py-2.5 px-3">{summary.modis_metrics.mean_footprint_km2} km²</td>
                  <td className="py-2.5 px-3">{summary.viirs_metrics.mean_footprint_km2} km²</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-sans">
                    VIIRS has 8x finer pixel resolution
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-white">Total Radiative Power</td>
                  <td className="py-2.5 px-3">{summary.modis_metrics.total_frp_mw} MW</td>
                  <td className="py-2.5 px-3">{summary.viirs_metrics.total_frp_mw} MW</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-sans">
                    VIIRS captures lower FRP micro-fires
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-white">Mean FRP per Hotspot</td>
                  <td className="py-2.5 px-3">{summary.modis_metrics.mean_frp_mw} MW</td>
                  <td className="py-2.5 px-3">{summary.viirs_metrics.mean_frp_mw} MW</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-sans">
                    MODIS requires higher thermal threshold
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-white">Peak Registered FRP</td>
                  <td className="py-2.5 px-3">{summary.modis_metrics.max_frp_mw} MW</td>
                  <td className="py-2.5 px-3">{summary.viirs_metrics.max_frp_mw} MW</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-sans">
                    Peak front radiation output
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-white">Day / Night Detections</td>
                  <td className="py-2.5 px-3">{summary.modis_metrics.day_detections}D / {summary.modis_metrics.night_detections}N</td>
                  <td className="py-2.5 px-3">{summary.viirs_metrics.day_detections}D / {summary.viirs_metrics.night_detections}N</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-sans">
                    Diurnal solar heating correlation
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cross-Sensor Comparison Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Detections: MODIS vs VIIRS vs Distinct */}
        <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Daily Detection Frequency Comparison
              </h4>
              <p className="text-sm font-bold text-white mt-0.5">MODIS vs VIIRS vs Distinct Physical Complexes</p>
            </div>
            <span className="text-xs font-mono text-orange-400">Detections</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.daily_comparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="viirs_detections" name="VIIRS (375m)" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="modis_detections" name="MODIS (1km)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="estimated_distinct_fires" name="Distinct De-duplicated" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Fire Radiative Power (FRP) Comparison */}
        <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Radiative Output Comparison
              </h4>
              <p className="text-sm font-bold text-white mt-0.5">MODIS vs VIIRS Total FRP (MW)</p>
            </div>
            <span className="text-xs font-mono text-amber-400">Megawatts</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.daily_comparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="viirs_frp_total" name="VIIRS FRP (MW)" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="modis_frp_total" name="MODIS FRP (MW)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive De-duplication Coincidence Table */}
      <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white">
              Harmonized Observations & Coincidence Classification
            </h4>
            <p className="text-xs text-slate-400">
              Normalized UTC timestamps, standardized coordinates, and cross-sensor overlap classification
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs font-medium">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-orange-500 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({summary.harmonized_records.length})
            </button>
            <button
              onClick={() => setActiveFilter('COINCIDENT_OVERLAP')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === 'COINCIDENT_OVERLAP'
                  ? 'bg-emerald-500 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Coincident ({summary.coincident_overlaps_count})
            </button>
            <button
              onClick={() => setActiveFilter('UNIQUE_VIIRS')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === 'UNIQUE_VIIRS'
                  ? 'bg-orange-500 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VIIRS Unique
            </button>
            <button
              onClick={() => setActiveFilter('UNIQUE_MODIS')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === 'UNIQUE_MODIS'
                  ? 'bg-amber-500 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MODIS Unique
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Harmonized ID</th>
                <th className="py-2.5 px-3">Sensor / Satellite</th>
                <th className="py-2.5 px-3">UTC Timestamp</th>
                <th className="py-2.5 px-3">Standardized Coordinates</th>
                <th className="py-2.5 px-3">Brightness (K)</th>
                <th className="py-2.5 px-3">FRP (MW)</th>
                <th className="py-2.5 px-3">Footprint (km²)</th>
                <th className="py-2.5 px-3">Coincidence Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                    {r.id}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      r.instrument === 'VIIRS' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {r.instrument}
                    </span>{' '}
                    <span className="text-slate-300 font-sans">{r.satellite}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {r.timestamp_utc}
                  </td>
                  <td className="py-2.5 px-3">
                    {r.latitude.toFixed(5)}°N, {r.longitude.toFixed(5)}°E
                  </td>
                  <td className="py-2.5 px-3 text-amber-300">
                    {r.brightness_k ? `${r.brightness_k.toFixed(1)} K` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-orange-400 font-bold">
                    {r.frp_mw !== null && r.frp_mw !== undefined ? `${r.frp_mw.toFixed(1)} MW` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {r.footprint_area_km2 ? `${r.footprint_area_km2.toFixed(3)} km²` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3">
                    {r.coincidence_status === 'COINCIDENT_OVERLAP' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Coincident Overlap
                      </span>
                    ) : r.coincidence_status === 'UNIQUE_VIIRS' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        Unique VIIRS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Unique MODIS
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal Scientific Caveats & Limitations */}
      <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 backdrop-blur-md">
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-400" />
          Formal Scientific Limitations of Cross-Sensor Fusion
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          Researchers and disaster monitoring personnel should consider the following physical and sensor constraints:
        </p>

        <div className="space-y-3">
          {summary.scientific_limitations.map((limitation, idx) => {
            const [title, desc] = limitation.split(': ');
            return (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                <span className="font-bold text-orange-300 font-mono">{idx + 1}. {title}: </span>
                <span className="text-slate-300 leading-relaxed">{desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

