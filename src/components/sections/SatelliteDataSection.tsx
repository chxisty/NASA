'use client';

import React, { useState } from 'react';
import {
  Satellite,
  Compass,
  Radio,
  Layers,
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Download,
  Search,
  Filter,
  Flame,
  Zap
} from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { SatelliteInfo, FireObservation } from '@/types';

interface SatelliteDataSectionProps {
  satellites: SatelliteInfo[];
  observations?: FireObservation[];
  constellationName: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export const SatelliteDataSection: React.FC<SatelliteDataSectionProps> = ({
  satellites,
  observations = [],
  constellationName,
  isLoading,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState<'ALL' | 'MODIS' | 'VIIRS'>('ALL');
  const [selectedConfidence, setSelectedConfidence] = useState<'ALL' | 'high' | 'nominal'>('ALL');

  if (isLoading) {
    return <LoadingState message="Connecting to NASA EOS telemetry network..." />;
  }

  // Filter observations based on search & dropdowns
  const filteredObservations = observations.filter((obs) => {
    if (instrumentFilter !== 'ALL' && obs.instrument !== instrumentFilter) return false;
    if (selectedConfidence !== 'ALL' && !obs.confidence.toLowerCase().includes(selectedConfidence)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchSat = obs.satellite.toLowerCase().includes(term);
      const matchInst = obs.instrument.toLowerCase().includes(term);
      const matchSource = obs.source.toLowerCase().includes(term);
      const matchRegion = (obs.region || '').toLowerCase().includes(term);
      const matchId = (obs.id || '').toLowerCase().includes(term);
      if (!matchSat && !matchInst && !matchSource && !matchRegion && !matchId) return false;
    }
    return true;
  });

  // Export filtered telemetry table as CSV
  const handleExportCSV = () => {
    const headers = [
      'satellite_name',
      'instrument',
      'observation_date',
      'acquisition_time_utc',
      'latitude',
      'longitude',
      'confidence',
      'frp_mw',
      'brightness_k',
      'data_source',
      'pass_type',
      'region'
    ];

    const rows = filteredObservations.map((obs) => [
      `"${obs.satellite}"`,
      obs.instrument,
      obs.acq_date || obs.acquisition_date,
      obs.acq_time || obs.acquisition_time,
      obs.latitude,
      obs.longitude,
      `"${obs.confidence}"`,
      obs.frp ?? '',
      obs.brightness,
      `"${obs.source}"`,
      obs.daynight === 'D' ? 'Day' : 'Night',
      `"${obs.region || 'India'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nasa_satellite_telemetry_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-semibold">
            Constellation Architecture & Telemetry
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">{constellationName}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Coordinated Sun-synchronous Low Earth Orbit (LEO) satellites providing global multispectral thermal infrared 
            observations for wildfire identification and Fire Radiative Power (FRP) quantification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#111827] border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white transition-all cursor-pointer"
            title="Download active observations as CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export Telemetry
          </button>
          <a
            href="https://firms.modaps.eosdis.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors cursor-pointer"
          >
            NASA FIRMS Portal
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Satellite Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {satellites.map((sat) => (
          <div
            key={sat.name}
            className="p-5 rounded-xl bg-[#172235] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {sat.instrument}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {sat.status}
                </span>
              </div>

              <h4 className="text-base font-bold text-white">{sat.name}</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Crossing: {sat.equator_crossing}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nadir Resolution:</span>
                <span className="text-slate-200 font-mono font-semibold">{sat.resolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Orbit Type:</span>
                <span className="text-slate-300 font-mono text-[11px]">{sat.orbit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Raw Satellite Observation Telemetry Data Explorer */}
      <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-400" />
              Satellite Observation Telemetry Records
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Live and calibrated NASA FIRMS observation records across MODIS and VIIRS passes
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search satellite, region, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#111827] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-orange-500 w-48 sm:w-60"
              />
            </div>

            {/* Instrument Filter */}
            <div className="flex items-center rounded-lg bg-[#111827] border border-slate-800 p-0.5 font-medium">
              {(['ALL', 'VIIRS', 'MODIS'] as const).map((inst) => (
                <button
                  key={inst}
                  onClick={() => setInstrumentFilter(inst)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    instrumentFilter === inst
                      ? 'bg-orange-500 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>

            {/* Confidence Filter */}
            <select
              value={selectedConfidence}
              onChange={(e) => setSelectedConfidence(e.target.value as any)}
              className="bg-[#111827] text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Confidence</option>
              <option value="high">High Confidence</option>
              <option value="nominal">Nominal</option>
            </select>
          </div>
        </div>

        {/* Observations Table */}
        {filteredObservations.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No satellite observations match current filters"
              description="Try clearing your search term or selecting 'All' for satellite instruments."
              onReset={() => {
                setSearchTerm('');
                setInstrumentFilter('ALL');
                setSelectedConfidence('ALL');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111827] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Satellite Name</th>
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3">Observation Date</th>
                  <th className="py-2.5 px-3">UTC Time</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">FRP (MW)</th>
                  <th className="py-2.5 px-3">Brightness (K)</th>
                  <th className="py-2.5 px-3">Data Source</th>
                  <th className="py-2.5 px-3">Pass Type</th>
                  <th className="py-2.5 px-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {filteredObservations.map((obs) => (
                  <tr key={obs.id || `${obs.latitude}-${obs.longitude}-${obs.satellite}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{obs.satellite}</div>
                      <div className="text-[10px] text-slate-400">{obs.id}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        obs.instrument === 'VIIRS'
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {obs.instrument}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {obs.acq_date || obs.acquisition_date}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {obs.acq_time || obs.acquisition_time}Z
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="capitalize text-slate-200 font-medium">
                        {obs.confidence}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        (obs.frp || 0) > 80
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {obs.frp ? `${obs.frp.toFixed(1)} MW` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-amber-300 font-semibold">
                      {obs.brightness.toFixed(1)} K
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-400">
                      {obs.source}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">
                      {obs.daynight === 'D' ? (
                        <span className="text-amber-300">Daytime</span>
                      ) : (
                        <span className="text-blue-300">Night</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                      {obs.latitude.toFixed(3)}°N, {obs.longitude.toFixed(3)}°E
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {filteredObservations.length} of {observations.length} observations</span>
          <span className="font-mono text-slate-500">NASA EOSDIS FIRMS Active Fire System</span>
        </div>
      </div>
    </div>
  );
};
