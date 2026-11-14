'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Filter,
  Flame,
  AlertTriangle,
  Info,
  Layers,
  Crosshair,
  Compass,
  Thermometer,
  Zap,
  RotateCcw
} from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { FireObservation } from '@/types';

// Dynamic import with ssr: false for Leaflet compatibility
const DynamicFireMap = dynamic(
  () => import('@/components/map/FireLeafletMap'),
  {
    ssr: false,
    loading: () => <LoadingState message="Initializing geospatial WebGL canvas..." />
  }
);

interface LiveMapSectionProps {
  observations: FireObservation[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const LiveMapSection: React.FC<LiveMapSectionProps> = ({
  observations,
  isLoading,
  onRefresh
}) => {
  const [selectedObs, setSelectedObs] = useState<FireObservation | null>(null);
  const [filterSensor, setFilterSensor] = useState<'ALL' | 'MODIS' | 'VIIRS'>('ALL');
  const [anomaliesOnly, setAnomaliesOnly] = useState(false);
  const [minFRP, setMinFRP] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredObservations = observations.filter((obs) => {
    if (filterSensor !== 'ALL' && obs.instrument !== filterSensor) return false;
    if (anomaliesOnly && !obs.is_anomaly) return false;
    if (obs.frp && obs.frp < minFRP) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <span>Filters:</span>
          </div>

          {/* Sensor Filter */}
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs font-medium">
            {(['ALL', 'VIIRS', 'MODIS'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSensor(s)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterSensor === s
                    ? 'bg-orange-500 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Anomalies Toggle */}
          <button
            onClick={() => setAnomaliesOnly(!anomaliesOnly)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              anomaliesOnly
                ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${anomaliesOnly ? 'text-red-400' : 'text-slate-400'}`} />
            <span>Anomalies Only</span>
          </button>

          {/* FRP Slider */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Min FRP:</span>
            <input
              type="range"
              min="0"
              max="150"
              step="10"
              value={minFRP}
              onChange={(e) => setMinFRP(Number(e.target.value))}
              className="w-20 accent-orange-500 cursor-pointer"
            />
            <span className="font-mono text-orange-400 font-semibold">{minFRP} MW</span>
          </div>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">
            Plotting <strong className="text-slate-100 font-mono">{filteredObservations.length}</strong> of {observations.length} hotspots
          </span>

          {(filterSensor !== 'ALL' || anomaliesOnly || minFRP > 0) && (
            <button
              onClick={() => {
                setFilterSensor('ALL');
                setAnomaliesOnly(false);
                setMinFRP(0);
              }}
              className="text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Map + Inspector Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map View Area */}
        <div className="lg:col-span-3 h-[580px] relative rounded-xl overflow-hidden border border-slate-800 bg-[#0B1220]">
          {!isClient || isLoading ? (
            <LoadingState message="Loading interactive geospatial layer..." />
          ) : filteredObservations.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="No observations match current filters"
                description="Try lowering the minimum FRP slider or including both MODIS and VIIRS satellite sensors."
                onReset={() => {
                  setFilterSensor('ALL');
                  setAnomaliesOnly(false);
                  setMinFRP(0);
                }}
              />
            </div>
          ) : (
            <DynamicFireMap
              observations={filteredObservations}
              selectedObservation={selectedObs}
              onSelectObservation={(obs) => setSelectedObs(obs)}
            />
          )}

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/90 border border-slate-800/90 backdrop-blur-md px-3.5 py-2.5 rounded-lg text-xs space-y-1.5 shadow-xl">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Observation Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-slate-300">AI Anomaly / Outlier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-slate-300">High Intensity (&gt;80 MW)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-300">Moderate (&gt;30 MW)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Baseline Active Hotspot</span>
            </div>
          </div>
        </div>

        {/* Hotspot Inspector Sidebar */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-orange-400" />
                Hotspot Inspector
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                {selectedObs ? 'Inspecting' : 'Click a marker'}
              </span>
            </div>

            {selectedObs ? (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Satellite Sensor</div>
                  <div className="text-sm font-bold text-white flex items-center justify-between mt-0.5">
                    <span>{selectedObs.satellite}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500/20 text-orange-400">
                      {selectedObs.instrument}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">{selectedObs.id}</div>
                </div>

                <div className="space-y-2 pt-1 text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Coordinates:</span>
                    <span className="font-mono font-semibold">
                      {selectedObs.latitude.toFixed(4)}°N, {selectedObs.longitude.toFixed(4)}°E
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Fire Radiative Power:</span>
                    <span className="font-mono font-bold text-orange-400">
                      {selectedObs.frp ? `${selectedObs.frp.toFixed(1)} MW` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Brightness Temp:</span>
                    <span className="font-mono text-amber-300 font-semibold">
                      {selectedObs.brightness.toFixed(1)} K
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Acquisition Time:</span>
                    <span className="font-mono">{selectedObs.acq_date} {selectedObs.acq_time}Z</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Spatial Footprint:</span>
                    <span className="font-mono">{selectedObs.scan}km × {selectedObs.track}km</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Pass Type:</span>
                    <span>{selectedObs.daynight === 'D' ? 'Daytime Overpass' : 'Night Overpass'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Region:</span>
                    <span className="font-medium text-slate-200">{selectedObs.region || 'India'}</span>
                  </div>
                </div>

                {selectedObs.is_anomaly && (
                  <div className="mt-3 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-200 text-xs">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      ML Anomaly Severity: {(selectedObs.anomaly_score! * 100).toFixed(0)}%
                    </div>
                    <p className="text-[11px] text-red-300/80">
                      Isolation Forest tagged this observation due to extreme radiative intensity and spatial divergence.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Compass className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">Select any fire circle on the map to inspect raw satellite sensor parameters.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Source: NASA FIRMS Near-Real-Time (NRT)
          </div>
        </div>
      </div>
    </div>
  );
};
