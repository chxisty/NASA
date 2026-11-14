'use client';

import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { FireObservation } from '@/types';

interface FireLeafletMapProps {
  observations: FireObservation[];
  selectedObservation: FireObservation | null;
  onSelectObservation: (obs: FireObservation) => void;
  center?: [number, number];
  zoom?: number;
}

export const FireLeafletMap: React.FC<FireLeafletMapProps> = ({
  observations,
  selectedObservation,
  onSelectObservation,
  center = [22.5937, 78.9629], // Center of India
  zoom = 5
}) => {
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
        {/* CartoDB Dark Matter tiles for scientific night/dark mode */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {observations.map((obs) => {
          const color = getMarkerColor(obs);
          const radius = getMarkerRadius(obs);
          const isSelected = selectedObservation?.id === obs.id;

          return (
            <CircleMarker
              key={obs.id}
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
                    <span>{obs.acq_date} at {obs.acq_time} UTC</span>
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
