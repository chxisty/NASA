'use client';

import React from 'react';
import {
  Satellite,
  Compass,
  Radio,
  Layers,
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { SatelliteInfo } from '@/types';

interface SatelliteDataSectionProps {
  satellites: SatelliteInfo[];
  constellationName: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export const SatelliteDataSection: React.FC<SatelliteDataSectionProps> = ({
  satellites,
  constellationName,
  isLoading,
  onRefresh
}) => {
  if (isLoading) {
    return <LoadingState message="Connecting to NASA EOS telemetry network..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-semibold">
            Constellation Architecture
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">{constellationName}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Coordinated low Earth orbit (LEO) satellites providing global multispectral and thermal infrared imaging 
            for active fire detection and biomass combustion assessment.
          </p>
        </div>

        <a
          href="https://firms.modaps.eosdis.nasa.gov/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
        >
          NASA FIRMS Portal
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Satellite Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {satellites.map((sat) => (
          <div
            key={sat.name}
            className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {sat.instrument}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {sat.status}
                </span>
              </div>

              <h4 className="text-base font-bold text-white">{sat.name}</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Equator Crossing: {sat.equator_crossing}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nadir Resolution:</span>
                <span className="text-slate-200 font-mono font-semibold">{sat.resolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Orbit Parameters:</span>
                <span className="text-slate-300 font-mono text-[11px]">{sat.orbit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sensor Comparison Table */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <h4 className="text-sm font-semibold text-white mb-1">
          Sensor Harmonization Matrix: VIIRS vs MODIS
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          How FirePulse normalizes structural differences across Earth Observation sensors into a unified intelligence schema.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Feature / Property</th>
                <th className="py-2.5 px-4 text-orange-400">VIIRS 375m (SNPP, NOAA-20/21)</th>
                <th className="py-2.5 px-4 text-amber-400">MODIS 1km (Terra & Aqua)</th>
                <th className="py-2.5 px-4 text-emerald-400">FirePulse Harmonized Schema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-white">Spatial Resolution</td>
                <td className="py-3 px-4">375m (I-Bands nadir)</td>
                <td className="py-3 px-4">1000m (Bands 21, 22, 31)</td>
                <td className="py-3 px-4 text-emerald-300 font-sans">Preserved as scan/track attributes</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-white">Primary Fire Channel</td>
                <td className="py-3 px-4">Channel I-4 (3.74 μm)</td>
                <td className="py-3 px-4">Channel 21/22 (3.96 μm)</td>
                <td className="py-3 px-4 text-emerald-300">brightness (Kelvin)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-white">Background Thermal Channel</td>
                <td className="py-3 px-4">Channel I-5 (11.45 μm)</td>
                <td className="py-3 px-4">Channel 31 (11.03 μm)</td>
                <td className="py-3 px-4 text-emerald-300">bright_t31 (Kelvin)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-white">Confidence Metric</td>
                <td className="py-3 px-4">Categorical: low, nominal, high</td>
                <td className="py-3 px-4">Continuous: 0% to 100%</td>
                <td className="py-3 px-4 text-emerald-300 font-sans">Normalized confidence string</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-white">Combustion Energy (FRP)</td>
                <td className="py-3 px-4">FRP in Megawatts (MW)</td>
                <td className="py-3 px-4">FRP in Megawatts (MW)</td>
                <td className="py-3 px-4 text-emerald-300">frp (Megawatts)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

