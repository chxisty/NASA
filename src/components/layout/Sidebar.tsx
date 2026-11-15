'use client';

import React from 'react';
import {
  Flame,
  LayoutDashboard,
  MapPin,
  Scale,
  BrainCircuit,
  BarChart3,
  Satellite,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { NavigationSection } from '@/types';

interface SidebarProps {
  currentSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'live-map', label: 'Live Fire Map', icon: MapPin, badge: 'Live' },
  { id: 'harmonization', label: 'Data Harmonization', icon: Scale, badge: 'Cross-Sensor' },
  { id: 'anomalies', label: 'AI Anomaly Detection', icon: BrainCircuit, badge: 'ML' },
  { id: 'historical', label: 'Historical Analysis', icon: BarChart3 },
  { id: 'satellite', label: 'Satellite Data', icon: Satellite },
  { id: 'about', label: 'About & NASA Mission', icon: Info },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#111827] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-orange-400/30">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-white font-mono">
                FirePulse
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">NASA FIRMS Intelligence</p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Monitoring Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        isActive
                          ? 'bg-orange-500/30 text-orange-300'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-orange-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Regional default scope indicator */}
        <div className="p-3 mx-3 mb-3 rounded-lg bg-slate-900/90 border border-slate-800/90 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-semibold tracking-wider">Default Scope</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="font-semibold text-slate-200">India (IND) Focus</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Multi-sensor fusion across MODIS & VIIRS active fire passes.
          </p>
        </div>

        {/* Footer telemetry status */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              NASA EOS Active
            </span>
            <a
              href="https://firms.modaps.eosdis.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-1"
            >
              FIRMS <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

