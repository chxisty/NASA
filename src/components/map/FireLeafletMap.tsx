'use client';

import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Rectangle,
  Popup,
  Tooltip,
  useMap
} from 'react-leaflet';
import { FireObservation, KMeansCluster, GridCellActivity } from '@/types';

// Component to dynamically update center & zoom when user switches regions
function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export type BaseMapTileLayer = 'dark' | 'satellite' | 'street';

interface FireLeafletMapProps {
  observations: FireObservation[];
  selectedObservation: FireObservation | null;
  onSelectObservation: (obs: FireObservation) => void;
  clusters?: KMeansCluster[];
  anomalyGrids?: GridCellActivity[];
  baseLayer?: BaseMapTileLayer;
  showHotspots?: boolean;
  showClusters?: boolean;
  showAnomalyGrids?: boolean;
  center?: [number, number];
  zoom?: number;
  onSelectCluster?: (cluster: KMeansCluster) => void;
  onSelectGrid?: (grid: GridCellActivity) => void;
}

export const FireLeafletMap: React.FC<FireLeafletMapProps> = ({
  observations,
  selectedObservation,
  onSelectObservation,
  clusters = [],
  anomalyGrids = [],
  baseLayer = 'dark',
  showHotspots = true,
  showClusters = true,
  showAnomalyGrids = true,
  center = [22.5937, 78.9629], // Center of India
  zoom = 5,
  onSelectCluster,
  onSelectGrid
}) => {
  // Tile layer configuration
  const tileConfig: Record<
    BaseMapTileLayer,
    { url: string; subdomains?: string; attribution?: string; maxZoom: number }
  > = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      subdomains: 'abcd',
      attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
      maxZoom: 19
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar, Earthstar Geographics, USDA, USGS',
      maxZoom: 18
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      subdomains: 'abc',
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }
  };

  const currentTile = tileConfig[baseLayer];

  // Helper to color-code circle markers based on FRP and anomaly status
  const getMarkerColor = (obs: FireObservation) => {
    if (obs.is_anomaly) return '#ef4444'; // Red for Anomaly
    if ((obs.frp || 0) > 80) return '#f97316'; // Orange-red for high FRP
    if ((obs.frp || 0) > 30) return '#f59e0b'; // Amber for moderate FRP
    return '#10b981'; // Emerald for lower intensity/baseline
  };

  const getMarkerRadius = (obs: FireObservation) => {
    if (obs.is_anomaly) return 10;
    const frp = obs.frp || 20;
    return Math.min(14, Math.max(6, Math.sqrt(frp) * 1.2));
  };

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-slate-800">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px]"
        attributionControl={false}
      >
        <MapViewUpdater center={center} zoom={zoom} />

        {/* Selected Tile Layer */}
        <TileLayer
          key={baseLayer}
          url={currentTile.url}
          subdomains={currentTile.subdomains}
          maxZoom={currentTile.maxZoom}
        />

        {/* LAYER 1: Isolation Forest 0.5-deg Grid Anomalies */}
        {showAnomalyGrids &&
          anomalyGrids.map((grid) => {
            const halfDeg = 0.25;
            const bounds: [[number, number], [number, number]] = [
              [grid.center_lat - halfDeg, grid.center_lon - halfDeg],
              [grid.center_lat + halfDeg, grid.center_lon + halfDeg]
            ];

            return (
              <Rectangle
                key={grid.grid_id}
                bounds={bounds}
                pathOptions={{
                  color: '#ef4444',
                  weight: 2,
                  dashArray: '4, 4',
                  fillColor: '#ef4444',
                  fillOpacity: 0.15
                }}
                eventHandlers={{
                  click: () => onSelectGrid && onSelectGrid(grid)
                }}
              >
                <Tooltip direction="top" opacity={0.9}>
                  <div className="font-mono text-xs">
                    <strong className="text-red-400">ML Anomaly Grid: {grid.grid_id}</strong><br />
                    Fires: {grid.fire_count} | FRP: {grid.total_frp_mw.toFixed(1)} MW<br />
                    Score: {grid.anomaly_score.toFixed(2)}
                  </div>
                </Tooltip>
                <Popup>
                  <div className="p-1 space-y-1 text-xs text-slate-100 min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-red-800 pb-1 font-bold text-red-400">
                      <span>Grid {grid.grid_id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-300">
                        Isolation Forest Outlier
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Center: </span>
                      <span className="font-mono">{grid.center_lat}°N, {grid.center_lon}°E</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Active Hotspots: </span>
                      <span className="font-mono font-bold text-white">{grid.fire_count}</span>
                      <span className="text-slate-400"> (MODIS: {grid.observation_count_modis}, VIIRS: {grid.observation_count_viirs})</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Total FRP: </span>
                      <span className="font-mono font-bold text-orange-400">{grid.total_frp_mw.toFixed(1)} MW</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Historical Ratio: </span>
                      <span className="font-mono text-amber-300 font-semibold">{grid.activity_ratio_vs_baseline.toFixed(1)}x baseline</span>
                    </div>
                    {grid.flag_reasons.length > 0 && (
                      <div className="pt-1 text-[11px] text-red-300">
                        <strong>Flags:</strong> {grid.flag_reasons.join(' • ')}
                      </div>
                    )}
                  </div>
                </Popup>
              </Rectangle>
            );
          })}

        {/* LAYER 2: K-Means Spatial Clusters */}
        {showClusters &&
          clusters.map((cluster) => {
            const radiusMeters = Math.max(3000, cluster.spread_radius_km * 1000);
            return (
              <React.Fragment key={`cluster-${cluster.cluster_id}`}>
                {/* Cluster Geographic Spread Circle */}
                <Circle
                  center={[cluster.centroid_lat, cluster.centroid_lon]}
                  radius={radiusMeters}
                  pathOptions={{
                    color: '#3b82f6',
                    weight: 1.5,
                    dashArray: '3, 6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.12
                  }}
                  eventHandlers={{
                    click: () => onSelectCluster && onSelectCluster(cluster)
                  }}
                >
                  <Tooltip direction="bottom" opacity={0.9}>
                    <div className="font-mono text-xs">
                      <strong className="text-blue-400">{cluster.cluster_label}</strong><br />
                      Hotspots: {cluster.observation_count} | Radius: {cluster.spread_radius_km.toFixed(1)} km
                    </div>
                  </Tooltip>
                </Circle>

                {/* Cluster Centroid Marker */}
                <CircleMarker
                  center={[cluster.centroid_lat, cluster.centroid_lon]}
                  radius={7}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2,
                    fillColor: '#2563eb',
                    fillOpacity: 0.95
                  }}
                  eventHandlers={{
                    click: () => onSelectCluster && onSelectCluster(cluster)
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs text-slate-100 min-w-[210px]">
                      <div className="flex items-center justify-between border-b border-blue-800 pb-1 font-bold text-blue-400">
                        <span>{cluster.cluster_label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
                          K-Means Centroid
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Centroid: </span>
                        <span className="font-mono">{cluster.centroid_lat.toFixed(4)}°N, {cluster.centroid_lon.toFixed(4)}°E</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Observations: </span>
                        <span className="font-mono font-bold text-white">{cluster.observation_count}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Total FRP: </span>
                        <span className="font-mono font-bold text-orange-400">{cluster.total_frp_mw.toFixed(1)} MW</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Mean FRP: </span>
                        <span className="font-mono text-amber-300">{cluster.avg_frp_mw.toFixed(1)} MW</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Dispersion Radius: </span>
                        <span className="font-mono">{cluster.spread_radius_km.toFixed(1)} km</span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}

        {/* LAYER 3: Hotspot Observations */}
        {showHotspots &&
          observations.map((obs) => {
            const color = getMarkerColor(obs);
            const radius = getMarkerRadius(obs);
            const isSelected = selectedObservation?.id === obs.id;

            return (
              <CircleMarker
                key={obs.id || `${obs.latitude}-${obs.longitude}-${obs.satellite}-${obs.acquisition_time}`}
                center={[obs.latitude, obs.longitude]}
                radius={isSelected ? radius + 4 : radius}
                pathOptions={{
                  color: isSelected ? '#ffffff' : color,
                  weight: isSelected ? 3 : 1.5,
                  fillColor: color,
                  fillOpacity: obs.is_anomaly ? 0.9 : 0.75
                }}
                eventHandlers={{
                  click: () => onSelectObservation(obs)
                }}
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={0.9}>
                  <div className="font-mono text-xs">
                    <strong>{obs.satellite}</strong> ({obs.instrument})<br />
                    FRP: {obs.frp ? `${obs.frp.toFixed(1)} MW` : 'N/A'} | Temp: {obs.brightness.toFixed(1)} K
                  </div>
                </Tooltip>

                <Popup>
                  <div className="p-1 space-y-1.5 text-xs text-slate-100 min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                      <span className="font-bold text-orange-400">{obs.satellite} ({obs.instrument})</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        {obs.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Location: </span>
                      <span className="font-mono">{obs.latitude.toFixed(4)}°N, {obs.longitude.toFixed(4)}°E</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Radiative Power: </span>
                      <span className="font-mono font-bold text-orange-400">{obs.frp ? `${obs.frp.toFixed(1)} MW` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Brightness Temp: </span>
                      <span className="font-mono">{obs.brightness.toFixed(1)} K</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Acquisition: </span>
                      <span>{obs.acq_date || obs.acquisition_date} at {obs.acq_time || obs.acquisition_time} UTC</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Confidence: </span>
                      <span className="capitalize">{obs.confidence}</span>
                    </div>
                    {obs.is_anomaly && (
                      <div className="mt-2 p-1.5 rounded bg-red-950/80 border border-red-800 text-red-200 text-[11px] font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        ML Anomaly Detected (Score: {obs.anomaly_score})
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default FireLeafletMap;
