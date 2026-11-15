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
  RotateCcw,
  Download,
  Map as MapIcon,
  Globe,
  Radio,
  Eye,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  FireObservation,
  KMeansCluster,
  GridCellActivity,
  MLClustersResponse,
  MLAnomaliesResponse
} from '@/types';
import { BaseMapTileLayer } from '@/components/map/FireLeafletMap';

// Dynamic import with ssr: false for Leaflet compatibility
const DynamicFireMap = dynamic(
  () => import('@/components/map/FireLeafletMap'),
  {
    ssr: false,
    loading: () => <LoadingState message="Initializing geospatial WebGL canvas..." />
  }
);

interface RegionPreset {
  name: string;
  center: [number, number];
  zoom: number;
}

const REGION_PRESETS: RegionPreset[] = [
  { name: 'All India', center: [22.5937, 78.9629], zoom: 5 },
  { name: 'North (Punjab / Haryana)', center: [30.4, 75.8], zoom: 8 },
  { name: 'Central Forests (MP / CG)', center: [22.2, 81.2], zoom: 7 },
  { name: 'Eastern Ghats (Odisha)', center: [19.8, 83.9], zoom: 7 },
  { name: 'Western Ghats', center: [13.8, 75.2], zoom: 7 }
];

interface LiveMapSectionProps {
  observations: FireObservation[];
  clustersData?: MLClustersResponse | null;
  anomaliesData?: MLAnomaliesResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const LiveMapSection: React.FC<LiveMapSectionProps> = ({
  observations,
  clustersData,
  anomaliesData,
  isLoading,
  onRefresh
}) => {
  const [selectedObs, setSelectedObs] = useState<FireObservation | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<KMeansCluster | null>(null);
  const [selectedGrid, setSelectedGrid] = useState<GridCellActivity | null>(null);

  // Filters
  const [filterSensor, setFilterSensor] = useState<'ALL' | 'MODIS' | 'VIIRS'>('ALL');
  const [anomaliesOnly, setAnomaliesOnly] = useState(false);
  const [minFRP, setMinFRP] = useState<number>(0);

  // Map view controls
  const [baseLayer, setBaseLayer] = useState<BaseMapTileLayer>('dark');
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [selectedRegionName, setSelectedRegionName] = useState<string>('All India');

  // Layer Visibility Toggles
  const [showHotspots, setShowHotspots] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [showAnomalyGrids, setShowAnomalyGrids] = useState(true);

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

  const handleRegionSelect = (preset: RegionPreset) => {
    setSelectedRegionName(preset.name);
    setMapCenter(preset.center);
    setMapZoom(preset.zoom);
  };

  // Export filtered observations as GeoJSON
  const handleExportGeoJSON = () => {
    const featureCollection = {
      type: 'FeatureCollection',
      name: 'FirePulse_Active_Fires',
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
      },
      features: filteredObservations.map((obs) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [obs.longitude, obs.latitude]
        },
        properties: {
          id: obs.id,
          satellite: obs.satellite,
          instrument: obs.instrument,
          confidence: obs.confidence,
          brightness_k: obs.brightness,
          frp_mw: obs.frp,
          acquisition_date: obs.acq_date || obs.acquisition_date,
          acquisition_time: obs.acq_time || obs.acquisition_time,
          daynight: obs.daynight,
          is_anomaly: obs.is_anomaly,
          anomaly_score: obs.anomaly_score
        }
      }))
    };

    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], {
      type: 'application/geo+json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `firepulse_observations_${new Date().toISOString().slice(0, 10)}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export filtered observations as CSV
  const handleExportCSV = () => {
    const headers = [
      'latitude',
      'longitude',
      'satellite',
      'instrument',
      'confidence',
      'brightness_k',
      'frp_mw',
      'acquisition_date',
      'acquisition_time',
      'daynight',
      'is_anomaly',
      'anomaly_score'
    ];

    const rows = filteredObservations.map((obs) => [
      obs.latitude,
      obs.longitude,
      `"${obs.satellite}"`,
      obs.instrument,
      `"${obs.confidence}"`,
      obs.brightness,
      obs.frp ?? '',
      obs.acq_date || obs.acquisition_date,
      obs.acq_time || obs.acquisition_time,
      obs.daynight,
      obs.is_anomaly ? 'TRUE' : 'FALSE',
      obs.anomaly_score ?? ''
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `firepulse_observations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Upper Control Bar: Region Presets & Quick Export */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* Geographic Focus Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mr-1">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Regional Focus:</span>
          </div>
          {REGION_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleRegionSelect(preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedRegionName === preset.name
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Data Export Options */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportGeoJSON}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-1.5 transition-all"
            title="Download GeoJSON FeatureCollection for GIS"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>GeoJSON</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-1.5 transition-all"
            title="Download tabular CSV of observations"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Middle Map Control Bar: Filters, Basemap & Layer Toggles */}
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

        {/* Right: Basemap Selector & Layer Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Basemap Switcher */}
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs">
            {(
              [
                { id: 'dark', label: 'Dark Matter' },
                { id: 'satellite', label: 'Satellite' },
                { id: 'street', label: 'Street' }
              ] as const
            ).map((b) => (
              <button
                key={b.id}
                onClick={() => setBaseLayer(b.id)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  baseLayer === b.id
                    ? 'bg-slate-800 text-slate-100 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Layer Visibility Toggles */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className={`px-2 py-1 rounded-md border flex items-center gap-1 ${
                showHotspots
                  ? 'bg-orange-950/40 border-orange-700/60 text-orange-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
              title="Toggle Hotspot Observations"
            >
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Hotspots</span>
            </button>

            <button
              onClick={() => setShowAnomalyGrids(!showAnomalyGrids)}
              className={`px-2 py-1 rounded-md border flex items-center gap-1 ${
                showAnomalyGrids
                  ? 'bg-red-950/40 border-red-700/60 text-red-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
              title="Toggle ML Isolation Forest Grids"
            >
              <Sparkles className="w-3 h-3 text-red-400" />
              <span>ML Grids</span>
            </button>

            <button
              onClick={() => setShowClusters(!showClusters)}
              className={`px-2 py-1 rounded-md border flex items-center gap-1 ${
                showClusters
                  ? 'bg-blue-950/40 border-blue-700/60 text-blue-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
              title="Toggle K-Means Spatial Clusters"
            >
              <Layers className="w-3 h-3 text-blue-400" />
              <span>Clusters</span>
            </button>
          </div>

          {(filterSensor !== 'ALL' || anomaliesOnly || minFRP > 0) && (
            <button
              onClick={() => {
                setFilterSensor('ALL');
                setAnomaliesOnly(false);
                setMinFRP(0);
              }}
              className="text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors text-xs"
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
        <div className="lg:col-span-3 h-[620px] relative rounded-xl overflow-hidden border border-slate-800 bg-[#0B1220]">
          {!isClient || isLoading ? (
            <LoadingState message="Loading interactive geospatial layer..." />
          ) : filteredObservations.length === 0 && !showClusters && !showAnomalyGrids ? (
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
              onSelectObservation={(obs) => {
                setSelectedObs(obs);
                setSelectedCluster(null);
                setSelectedGrid(null);
              }}
              clusters={clustersData?.clusters || []}
              anomalyGrids={anomaliesData?.anomalous_grids || []}
              baseLayer={baseLayer}
              showHotspots={showHotspots}
              showClusters={showClusters}
              showAnomalyGrids={showAnomalyGrids}
              center={mapCenter}
              zoom={mapZoom}
              onSelectCluster={(c) => {
                setSelectedCluster(c);
                setSelectedObs(null);
                setSelectedGrid(null);
              }}
              onSelectGrid={(g) => {
                setSelectedGrid(g);
                setSelectedObs(null);
                setSelectedCluster(null);
              }}
            />
          )}

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/90 border border-slate-800/90 backdrop-blur-md px-3.5 py-2.5 rounded-lg text-xs space-y-1.5 shadow-xl">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Observation & ML Legend
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
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 border border-dashed border-red-500 bg-red-500/20 rounded-sm" />
              <span className="text-slate-300">0.5° Isolation Forest Grid Outlier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-blue-400 bg-blue-500/20" />
              <span className="text-slate-300">K-Means Spatial Cluster</span>
            </div>
          </div>
        </div>

        {/* Hotspot & ML Feature Inspector Sidebar */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-orange-400" />
                Feature Inspector
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                {selectedObs
                  ? 'Hotspot'
                  : selectedCluster
                  ? 'K-Means Cluster'
                  : selectedGrid
                  ? 'ML Grid'
                  : 'Click on map'}
              </span>
            </div>

            {/* CASE 1: Individual Fire Observation Selected */}
            {selectedObs && (
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
                    <span className="font-mono">{selectedObs.acq_date || selectedObs.acquisition_date} {selectedObs.acq_time || selectedObs.acquisition_time}Z</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="capitalize">{selectedObs.confidence}</span>
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
                      ML Anomaly Severity: {((selectedObs.anomaly_score || 0.8) * 100).toFixed(0)}%
                    </div>
                    <p className="text-[11px] text-red-300/80">
                      Isolation Forest tagged this observation due to extreme radiative intensity and spatial divergence.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CASE 2: K-Means Spatial Cluster Selected */}
            {selectedCluster && !selectedObs && (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-blue-900/60">
                  <div className="text-[10px] text-blue-400 uppercase font-mono">K-Means Cluster Centroid</div>
                  <div className="text-sm font-bold text-white flex items-center justify-between mt-0.5">
                    <span>{selectedCluster.cluster_label}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400">
                      ID #{selectedCluster.cluster_id}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Centroid:</span>
                    <span className="font-mono font-semibold">
                      {selectedCluster.centroid_lat.toFixed(4)}°N, {selectedCluster.centroid_lon.toFixed(4)}°E
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Hotspot Count:</span>
                    <span className="font-mono font-bold text-white">{selectedCluster.observation_count} points</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Radiative Power:</span>
                    <span className="font-mono font-bold text-orange-400">
                      {selectedCluster.total_frp_mw.toFixed(1)} MW
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Average FRP:</span>
                    <span className="font-mono text-amber-300">{selectedCluster.avg_frp_mw.toFixed(1)} MW</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Spatial Dispersion:</span>
                    <span className="font-mono">{selectedCluster.spread_radius_km.toFixed(1)} km radius</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Max Temp:</span>
                    <span className="font-mono">{selectedCluster.max_brightness_k.toFixed(1)} K</span>
                  </div>
                </div>
              </div>
            )}

            {/* CASE 3: Isolation Forest Grid Cell Selected */}
            {selectedGrid && !selectedObs && !selectedCluster && (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-red-900/60">
                  <div className="text-[10px] text-red-400 uppercase font-mono">Isolation Forest Grid Cell</div>
                  <div className="text-sm font-bold text-white flex items-center justify-between mt-0.5">
                    <span>Grid {selectedGrid.grid_id}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-400">
                      Score: {selectedGrid.anomaly_score.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Grid Center:</span>
                    <span className="font-mono font-semibold">
                      {selectedGrid.center_lat.toFixed(2)}°N, {selectedGrid.center_lon.toFixed(2)}°E
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Hotspots:</span>
                    <span className="font-mono font-bold text-white">
                      {selectedGrid.fire_count} (M:{selectedGrid.observation_count_modis}, V:{selectedGrid.observation_count_viirs})
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Aggregated FRP:</span>
                    <span className="font-mono font-bold text-orange-400">
                      {selectedGrid.total_frp_mw.toFixed(1)} MW
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Baseline Comparison:</span>
                    <span className="font-mono text-amber-300 font-semibold">
                      {selectedGrid.activity_ratio_vs_baseline.toFixed(1)}x baseline
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Land Use / Ecozone:</span>
                    <span className="text-slate-200">{selectedGrid.land_use_context}</span>
                  </div>
                </div>

                {selectedGrid.flag_reasons.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-200 text-xs">
                    <div className="font-bold mb-1">Statistical Anomaly Drivers:</div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-red-300/90">
                      {selectedGrid.flag_reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* CASE 4: None Selected */}
            {!selectedObs && !selectedCluster && !selectedGrid && (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Compass className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">
                  Click any hotspot circle, ML grid boundary, or K-Means cluster centroid on the map to inspect telemetry.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>NASA FIRMS & Scikit-Learn</span>
            <span className="font-mono text-slate-500">EPSG:4326</span>
          </div>
        </div>
      </div>
    </div>
  );
};
