'use client';

import React from 'react';
import {
  BrainCircuit,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { MetricCard } from '@/components/common/MetricCard';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { FireObservation, AnomalySummary } from '@/types';

interface AnomalySectionProps {
  anomalies: FireObservation[];
  summary: AnomalySummary | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const AnomalySection: React.FC<AnomalySectionProps> = ({
  anomalies,
  summary,
  isLoading,
  onRefresh
}) => {
  if (isLoading) {
    return <LoadingState message="Running Scikit-learn Isolation Forest ML inference..." subtext="Analyzing high-dimensional thermal and radiative distributions" />;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Detected Anomalies"
          value={summary?.total_anomalies_detected ?? anomalies.length}
          unit="events"
          subtitle={`${((summary?.anomaly_ratio ?? 0) * 100).toFixed(1)}% of total hotspots`}
          icon={AlertTriangle}
          accent="red"
          badge={{ text: 'ML Flagged', variant: 'red' }}
        />

        <MetricCard
          title="High FRP Outliers"
          value={summary?.high_frp_outliers ?? anomalies.filter(a => (a.frp || 0) > 100).length}
          unit="hotspots"
          subtitle="Extreme fire radiative power (>100 MW)"
          icon={Zap}
          accent="orange"
          badge={{ text: 'Extreme Radiance', variant: 'orange' }}
        />

        <MetricCard
          title="Cluster Anomalies"
          value={summary?.dense_cluster_anomalies ?? 1}
          unit="clusters"
          subtitle="Atypical spatial fire density"
          icon={Activity}
          accent="amber"
          badge={{ text: 'Spatial Surge', variant: 'amber' }}
        />

        <MetricCard
          title="ML Engine"
          value="IsolationForest"
          subtitle="Scikit-Learn Unsupervised Pipeline"
          icon={Cpu}
          accent="emerald"
          badge={{ text: 'Operational', variant: 'emerald' }}
        />
      </div>

      {/* Scientific Explanation Card */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Isolation Forest Anomaly Architecture & Methodology
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              FirePulse employs an unsupervised <strong>Isolation Forest</strong> algorithm combined with physical thermal thresholding.
              Unlike standard threshold filters, Isolation Forest recursively isolates observation anomalies across a multi-dimensional feature space composed of 
              <span className="text-orange-400 font-mono"> Fire Radiative Power (MW)</span>, 
              <span className="text-amber-400 font-mono"> Brightness Temperature (K)</span>, and 
              <span className="text-emerald-400 font-mono"> Spatial Coordinates (Lat/Lon)</span>.
              Observations that require few partition splits to isolate are scored as statistical outliers, indicating rapidly propagating fire fronts, industrial flaring, or severe crown fires.
            </p>
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Ranked Anomaly Incidents</h4>
            <p className="text-xs text-slate-400">Prioritized by model anomaly severity score</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {anomalies.length} Flagged Events
          </span>
        </div>

        {anomalies.length === 0 ? (
          <EmptyState
            title="No anomalies detected in current acquisition"
            description="All active fire detections fall within normal statistical radiance bounds."
            onReset={onRefresh}
            resetLabel="Re-run ML Evaluation"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anomalies.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-slate-950/70 border border-red-900/30 hover:border-red-500/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    Rank #{idx + 1} • {((item.anomaly_score || 0.8) * 100).toFixed(0)}% Severity
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{item.satellite}</span>
                </div>

                <div>
                  <h5 className="text-sm font-bold text-white">{item.region || 'India Hotspot'}</h5>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {item.latitude.toFixed(4)}°N, {item.longitude.toFixed(4)}°E
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Radiative Power</span>
                    <div className="font-mono font-bold text-orange-400">{item.frp ? `${item.frp.toFixed(1)} MW` : 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Brightness Temp</span>
                    <div className="font-mono font-bold text-amber-300">{item.brightness.toFixed(1)} K</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-red-400 font-semibold">Diagnosis: </span>
                  {(item.frp || 0) > 120
                    ? 'Extreme radiative intensity outlier (>120 MW). Severe wildfire front.'
                    : 'Unusual thermal density outlier detected by Isolation Forest.'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
