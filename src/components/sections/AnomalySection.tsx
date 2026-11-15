'use client';

import React, { useState } from 'react';
import {
  BrainCircuit,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Cpu,
  Compass,
  Grid,
  MapPin,
  ShieldAlert,
  Info,
  Maximize2
} from 'lucide-react';
import { MetricCard } from '@/components/common/MetricCard';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  MLAnomaliesResponse,
  MLClustersResponse,
  MLSummaryResponse,
  GridCellActivity,
  KMeansCluster
} from '@/types';

interface AnomalySectionProps {
  anomaliesData: MLAnomaliesResponse | null;
  clustersData: MLClustersResponse | null;
  summaryData: MLSummaryResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const AnomalySection: React.FC<AnomalySectionProps> = ({
  anomaliesData,
  clustersData,
  summaryData,
  isLoading,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'grids' | 'clusters' | 'explanation'>('grids');
  const [gridFilter, setGridFilter] = useState<'ANOMALIES_ONLY' | 'ALL'>('ANOMALIES_ONLY');
  const [selectedGrid, setSelectedGrid] = useState<GridCellActivity | null>(null);

  if (isLoading) {
    return (
      <LoadingState
        message="Running Scikit-Learn Machine Learning Pipeline..."
        subtext="Executing Isolation Forest grid outlier scoring & K-Means spatial clustering"
      />
    );
  }

  if (!anomaliesData || !clustersData || !summaryData) {
    return (
      <EmptyState
        title="Machine Learning Models Uninitialized"
        description="Unable to compute Isolation Forest anomaly scores or K-Means clusters. Try refreshing the stream."
        onReset={onRefresh}
      />
    );
  }

  const displayedGrids = gridFilter === 'ANOMALIES_ONLY'
    ? anomaliesData.anomalous_grids
    : anomaliesData.all_grids;

  const peakClusterFRP = Math.max(...clustersData.clusters.map(c => c.total_frp_mw), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Scientific Disclaimer */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/20 border border-red-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Machine Learning Wildfire Intelligence</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Scikit-Learn Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Combines <strong>Isolation Forest</strong> (evaluating 0.5° spatial grids against historical regional baselines) 
              with <strong>K-Means Clustering</strong> (grouping nearby active fire observations into cohesive complexes).
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab('grids')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'grids'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Isolation Forest Grids</span>
          </button>
          <button
            onClick={() => setActiveTab('clusters')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'clusters'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>K-Means Clusters</span>
          </button>
          <button
            onClick={() => setActiveTab('explanation')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'explanation'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>ML Architecture</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Evaluated Grid Cells"
          value={anomaliesData.total_grids_evaluated}
          unit="cells"
          subtitle="0.5° (~55 km) spatial aggregation bins"
          icon={Grid}
          accent="blue"
          badge={{ text: 'Spatial Bins', variant: 'blue' }}
        />

        <MetricCard
          title="Anomalous Grids Flagged"
          value={anomaliesData.anomalous_grids_count}
          unit="grids"
          subtitle={`${((anomaliesData.anomalous_grids_count / (anomaliesData.total_grids_evaluated || 1)) * 100).toFixed(0)}% elevated vs baseline`}
          icon={AlertTriangle}
          accent={anomaliesData.anomalous_grids_count > 0 ? 'red' : 'emerald'}
          badge={{
            text: anomaliesData.anomalous_grids_count > 0 ? 'Unusual Activity' : 'Nominal',
            variant: anomaliesData.anomalous_grids_count > 0 ? 'red' : 'emerald'
          }}
        />

        <MetricCard
          title="K-Means Clusters Formed"
          value={clustersData.total_clusters}
          unit="complexes"
          subtitle={`K = ${clustersData.k_used} geographic partitions`}
          icon={Activity}
          accent="amber"
          badge={{ text: 'Proximity Groups', variant: 'amber' }}
        />

        <MetricCard
          title="Peak Cluster Radiative Power"
          value={peakClusterFRP.toFixed(1)}
          unit="MW"
          subtitle="Highest energy cluster emission"
          icon={Zap}
          accent="orange"
          badge={{ text: 'Max Thermal Energy', variant: 'orange' }}
        />
      </div>

      {/* Tab 1: Isolation Forest Grid Analysis */}
      {activeTab === 'grids' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Grid className="w-4 h-4 text-orange-400" />
                  Isolation Forest Geographic Grid Anomaly Analysis
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluates active fire count, cumulative FRP, and seasonal baseline ratio per 0.5° cell
                </p>
              </div>

              {/* Grid filter buttons */}
              <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs font-medium">
                <button
                  onClick={() => setGridFilter('ANOMALIES_ONLY')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    gridFilter === 'ANOMALIES_ONLY'
                      ? 'bg-red-500/20 text-red-400 font-semibold border border-red-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Anomalies Only ({anomaliesData.anomalous_grids_count})
                </button>
                <button
                  onClick={() => setGridFilter('ALL')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    gridFilter === 'ALL'
                      ? 'bg-slate-800 text-slate-200 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Grids ({anomaliesData.total_grids_evaluated})
                </button>
              </div>
            </div>

            {displayedGrids.length === 0 ? (
              <EmptyState
                title="No anomalous grids detected"
                description="All geographic cells fall within expected seasonal background fire counts and radiative energy levels."
                onReset={onRefresh}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Grid Cell ID</th>
                      <th className="py-2.5 px-3">Center Coordinates</th>
                      <th className="py-2.5 px-3">Fire Count</th>
                      <th className="py-2.5 px-3">Total FRP (MW)</th>
                      <th className="py-2.5 px-3">Baseline Ratio</th>
                      <th className="py-2.5 px-3">Anomaly Score</th>
                      <th className="py-2.5 px-3">Land Use Context</th>
                      <th className="py-2.5 px-3">Diagnostic Reasons</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {displayedGrids.map((g) => (
                      <tr key={g.grid_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          {g.grid_id}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {g.center_lat.toFixed(2)}°N, {g.center_lon.toFixed(2)}°E
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-white">{g.fire_count}</span>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            {g.observation_count_viirs} VIIRS / {g.observation_count_modis} MODIS
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-orange-400 font-bold">
                          {g.total_frp_mw.toFixed(1)} MW
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            g.activity_ratio_vs_baseline >= 1.5
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {g.activity_ratio_vs_baseline.toFixed(1)}x
                          </span>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            norm: {g.baseline_fire_count.toFixed(0)} fires
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {g.is_anomaly ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                              {(g.anomaly_score * 100).toFixed(0)}% Anomaly
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Nominal
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-xs text-slate-200">
                          {g.land_use_context}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-xs text-slate-300 max-w-xs">
                          {g.flag_reasons.length > 0 ? (
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-300/90">
                              {g.flag_reasons.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-400">Within baseline envelope</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: K-Means Spatial Clusters */}
      {activeTab === 'clusters' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  K-Means Spatial Fire Clusters & Geographic Distribution
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Partitions active fire observations into cohesive spatial complexes based on coordinate proximity
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                {clustersData.total_clusters} Clusters Identified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clustersData.clusters.map((cluster) => (
                <div
                  key={cluster.cluster_id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        Cluster #{cluster.cluster_id + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {cluster.observation_count} Hotspots
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-white mt-2 leading-snug">
                      {cluster.cluster_label}
                    </h5>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Centroid: {cluster.centroid_lat.toFixed(4)}°N, {cluster.centroid_lon.toFixed(4)}°E
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Total FRP</span>
                      <div className="font-mono font-bold text-orange-400">{cluster.total_frp_mw.toFixed(1)} MW</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Avg FRP</span>
                      <div className="font-mono font-bold text-amber-300">{cluster.avg_frp_mw.toFixed(1)} MW</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Spread Radius</span>
                      <div className="font-mono font-semibold text-slate-200">{cluster.spread_radius_km.toFixed(1)} km</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Max Temp</span>
                      <div className="font-mono font-semibold text-slate-200">{cluster.max_brightness_k.toFixed(1)} K</div>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                    <div><strong>Bounding Box:</strong></div>
                    <div className="font-mono text-[10px]">
                      Lat: {cluster.bounding_box.min_lat}° to {cluster.bounding_box.max_lat}°
                    </div>
                    <div className="font-mono text-[10px]">
                      Lon: {cluster.bounding_box.min_lon}° to {cluster.bounding_box.max_lon}°
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Model Architecture, Plain Explanations & Disclaimers */}
      {activeTab === 'explanation' && (
        <div className="space-y-6">
          {/* Plain Explanations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Isolation Forest Card */}
            <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                <BrainCircuit className="w-5 h-5" />
                How Isolation Forest Works
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {summaryData.explanations.isolation_forest}
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="text-slate-200 font-bold">Key Architectural Properties:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensemble of 100 Isolation Trees trained on regional baselines</li>
                  <li>Features: Fire Count, Total FRP, Mean FRP, and Baseline Ratio</li>
                  <li>Shallow partition depths indicate high anomaly severity</li>
                </ul>
              </div>
            </div>

            {/* K-Means Card */}
            <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Compass className="w-5 h-5" />
                How K-Means Clustering Works
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {summaryData.explanations.kmeans_clustering}
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="text-slate-200 font-bold">Key Architectural Properties:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Dynamically partitions observations into cohesive spatial clusters</li>
                  <li>Computes centroids, bounding boxes, and geographic spread radii</li>
                  <li>Distinguishes localized points from large wildfire fronts</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Scientific Limitations & Safety Disclaimers */}
          <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 backdrop-blur-md space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Scientific Limitations & Operational Safeguards
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {summaryData.limitations.map((lim, idx) => {
                const [title, desc] = lim.split(': ');
                return (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-300 font-mono">{idx + 1}. {title}</span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Operational Disclaimer: </strong>
                {summaryData.disclaimer}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
