'use client';

import React from 'react';
import {
  Flame,
  Shield,
  Key,
  Database,
  Cpu,
  Layers,
  Globe2,
  Users,
  ExternalLink,
  BookOpen,
  Code
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hero Mission Card */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/30 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-mono">FirePulse</h3>
            <p className="text-xs text-orange-400 font-medium">
              AI-Powered Wildfire Intelligence & Environmental Monitoring
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          FirePulse is an open-science environmental monitoring platform designed to transform raw satellite 
          observations into actionable wildfire intelligence. By synthesizing active fire detections from NASA&apos;s 
          MODIS and VIIRS sensor constellations, harmonizing heterogeneous data formats, and applying unsupervised 
          machine learning (Isolation Forest), FirePulse empowers researchers, disaster response authorities, and 
          conservationists with early warning indicators and deep environmental analytics.
        </p>
      </div>

      {/* Target Audiences & Use Cases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="p-2 w-fit rounded-lg bg-orange-500/10 text-orange-400">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Disaster Monitoring Teams</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time thermal hotspot alerts, extreme FRP localization, and geographic boundaries for rapid incident response.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="p-2 w-fit rounded-lg bg-amber-500/10 text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Environmental Researchers</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standardized multi-spectral datasets, seasonal fire return intervals, and radiative combustion energy profiles.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400">
            <Globe2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Educators & Communities</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Accessible public dashboard tracking local agricultural burning, forest fire risk, and air quality impacts.
          </p>
        </div>
      </div>

      {/* Architecture & Stack */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-orange-400" />
          Technical Stack & Security Architecture
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-slate-200">Frontend Layer</div>
            <ul className="text-slate-400 space-y-1 list-disc list-inside">
              <li>Next.js 16 (App Router) & React 19</li>
              <li>TypeScript for type safety and data integrity</li>
              <li>Tailwind CSS with dark navy (#0B1220) theme</li>
              <li>Leaflet & React Leaflet for interactive maps</li>
              <li>Recharts for dynamic temporal analytics</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-slate-200">Backend & ML Engine</div>
            <ul className="text-slate-400 space-y-1 list-disc list-inside">
              <li>Python 3.12 & FastAPI asynchronous framework</li>
              <li>Scikit-Learn Isolation Forest for outlier scoring</li>
              <li>Pandas & NumPy for sensor data harmonization</li>
              <li>Zero-trust API key encapsulation (backend only)</li>
              <li>Pydantic schemas for validated JSON contracts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* NASA FIRMS Key Guide */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Connecting Your NASA FIRMS MAP Key
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              NASA FIRMS provides free near-real-time active fire feeds through their REST API. 
              To connect your personal key without exposing it to the client:
            </p>
            <ol className="text-xs text-slate-400 mt-2 space-y-1.5 list-decimal list-inside font-mono">
              <li>
                Request your free NASA map key at{' '}
                <a
                  href="https://firms.modaps.eosdis.nasa.gov/api/map_key/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-400 underline"
                >
                  firms.modaps.eosdis.nasa.gov/api/map_key/
                </a>
              </li>
              <li>Open <code className="text-slate-200">backend/.env</code> in your project</li>
              <li>Set <code className="text-slate-200">NASA_FIRMS_MAP_KEY=your_key_here</code></li>
              <li>Restart the FastAPI backend server</li>
            </ol>
            <p className="text-[11px] text-slate-400 mt-3">
              Note: FirePulse comes pre-loaded with authentic calibrated NASA satellite observations across India so you can test all features immediately without requiring an API key.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
