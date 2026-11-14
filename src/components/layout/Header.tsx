'use client';

import React from 'react';
import { Menu, Globe, RefreshCw, Satellite, ShieldCheck } from 'lucide-react';
import { NavigationSection } from '@/types';

interface HeaderProps {
  currentSection: NavigationSection;
  onOpenMobileMenu: () => void;
  selectedScope: 'IND' | 'GLOBAL';
  onScopeChange: (scope: 'IND' | 'GLOBAL') => void;
  selectedSensor: 'ALL' | 'MODIS' | 'VIIRS';
  onSensorChange: (sensor: 'ALL' | 'MODIS' | 'VIIRS') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  nasaConnected: boolean;
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

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onOpenMobileMenu,
  selectedScope,
  onScopeChange,
  selectedSensor,
  onSensorChange,
  onRefresh,
  isRefreshing,
  nasaConnected
}) => {
  const current = sectionTitles[currentSection];

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B1220]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between transition-colors">
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

      {/* Right controls: Scope selector, sensor filter, refresh */}
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

        {/* Sensor selector */}
        <div className="hidden sm:flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-medium">
          {(['ALL', 'VIIRS', 'MODIS'] as const).map((sensor) => (
            <button
              key={sensor}
              onClick={() => onSensorChange(sensor)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedSensor === sensor
                  ? 'bg-slate-800 text-orange-400 font-semibold border border-orange-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sensor}
            </button>
          ))}
        </div>

        {/* NASA status badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <Satellite className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-slate-400 font-mono text-[11px]">NASA FIRMS:</span>
          <span className="flex items-center gap-1 font-semibold text-slate-200 text-[11px]">
            <span className={`w-1.5 h-1.5 rounded-full ${nasaConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {nasaConnected ? 'API Synced' : 'Calibrated Feed'}
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
    </header>
  );
};
