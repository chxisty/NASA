'use client';

import React from 'react';
import { Menu, Globe, RefreshCw, Satellite, Info, Calendar } from 'lucide-react';
import { NavigationSection } from '@/types';

interface HeaderProps {
  currentSection: NavigationSection;
  onOpenMobileMenu: () => void;
  selectedScope: 'IND' | 'GLOBAL';
  onScopeChange: (scope: 'IND' | 'GLOBAL') => void;
  selectedSource: string;
  onSourceChange: (source: string) => void;
  selectedDays: number;
  onDaysChange: (days: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  nasaConnected: boolean;
  isDemoMode: boolean;
}

const sectionTitles: Record<NavigationSection, { title: string; subtitle: string }> = {
  overview: {
    title: 'Environmental Fire Intelligence Overview',
    subtitle: 'Unified observation telemetry across MODIS and VIIRS sensor constellations'
  },
  'live-map': {
    title: 'Interactive Live Fire Map',
    subtitle: 'Geospatial visualization of active hotspots and radiative power clusters'
  },
  anomalies: {
    title: 'AI Anomaly Detection & Intensity Outliers',
    subtitle: 'Isolation Forest clustering of extreme FRP and unexpected thermal spikes'
  },
  historical: {
    title: 'Historical Trends & Temporal Analysis',
    subtitle: 'Multi-day seasonal fire frequencies and radiative power distributions'
  },
  satellite: {
    title: 'NASA Satellite Constellation & Sensors',
    subtitle: 'Orbital status, calibration parameters, and swath resolution specifications'
  },
  about: {
    title: 'About FirePulse & NASA Earth Science',
    subtitle: 'Open science wildfire intelligence for researchers, disaster teams, and communities'
  }
};

const sourceOptions = [
  { id: 'ALL', label: 'All Sources' },
  { id: 'MODIS_NRT', label: 'MODIS (Terra/Aqua)' },
  { id: 'VIIRS_SNPP_NRT', label: 'VIIRS (Suomi NPP)' },
  { id: 'VIIRS_NOAA20_NRT', label: 'VIIRS (NOAA-20)' },
  { id: 'VIIRS_NOAA21_NRT', label: 'VIIRS (NOAA-21)' }
];

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onOpenMobileMenu,
  selectedScope,
  onScopeChange,
  selectedSource,
  onSourceChange,
  selectedDays,
  onDaysChange,
  onRefresh,
  isRefreshing,
  nasaConnected,
  isDemoMode
}) => {
  const current = sectionTitles[currentSection];

  return (
    <header className="sticky top-0 z-30 bg-[#0B1220]/95 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="h-16 px-4 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-sm lg:text-base font-semibold text-slate-100 flex items-center gap-2">
              {current.title}
            </h2>
            <p className="hidden md:block text-[11px] text-slate-400">{current.subtitle}</p>
          </div>
        </div>

        {/* Right controls: Scope selector, source filter, day range, refresh */}
        <div className="flex items-center gap-2.5">
          {/* Scope selector */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-medium">
            <button
              onClick={() => onScopeChange('IND')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                selectedScope === 'IND'
                  ? 'bg-orange-500 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇮🇳</span>
              <span>India</span>
            </button>
            <button
              onClick={() => onScopeChange('GLOBAL')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                selectedScope === 'GLOBAL'
                  ? 'bg-orange-500 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Global</span>
            </button>
          </div>

          {/* Satellite Source Dropdown / Selector */}
          <div className="hidden md:flex items-center">
            <select
              value={selectedSource}
              onChange={(e) => onSourceChange(e.target.value)}
              className="bg-slate-900 text-slate-200 text-xs rounded-lg border border-slate-800 px-2.5 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              {sourceOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Days range selector */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDays}
              onChange={(e) => onDaysChange(Number(e.target.value))}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value={1} className="bg-slate-900">1 Day</option>
              <option value={2} className="bg-slate-900">2 Days</option>
              <option value={3} className="bg-slate-900">3 Days</option>
              <option value={5} className="bg-slate-900">5 Days</option>
              <option value={7} className="bg-slate-900">7 Days</option>
              <option value={10} className="bg-slate-900">10 Days</option>
            </select>
          </div>

          {/* NASA status badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Satellite className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-400 font-mono text-[11px]">NASA FIRMS:</span>
            <span className="flex items-center gap-1 font-semibold text-slate-200 text-[11px]">
              <span className={`w-1.5 h-1.5 rounded-full ${nasaConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {nasaConnected ? 'Live API Stream' : 'Demo Sample Mode'}
            </span>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-orange-400 hover:border-slate-700 transition-colors disabled:opacity-50"
            title="Refresh NASA telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Prominent Demo Mode Notice Banner (Visible when API key is unavailable) */}
      {isDemoMode && (
        <div className="bg-amber-500/10 border-t border-b border-amber-500/20 px-4 lg:px-8 py-2 text-xs flex items-center justify-between text-amber-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>DEMO MODE:</strong> Displaying authentic historical NASA FIRMS sample observation records for India. These are labelled benchmark samples and not presented as live feeds.
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[11px] text-amber-400/80">
            Set NASA_FIRMS_MAP_KEY in backend/.env for live streams
          </span>
        </div>
      )}
    </header>
  );
};
