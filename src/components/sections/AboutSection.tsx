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
  Code,
  AlertTriangle,
  Scale,
  BrainCircuit,
  Eye,
  Info
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. PROJECT PURPOSE & MISSION */}
      <div className="p-6 rounded-xl bg-[#172235] border border-orange-500/20 shadow-lg shadow-black/20">
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
          <strong>Project Purpose:</strong> FirePulse is an open-science geospatial intelligence platform engineered to 
          bridge the gap between raw NASA Earth Observation satellite telemetry and actionable environmental decision-making. 
          By ingesting active fire observations from MODIS and VIIRS satellite constellations, harmonizing their disparate 
          spatial footprints into a unified analytical schema, and applying machine learning anomaly detection, FirePulse enables 
          environmental researchers, students, and disaster monitoring teams to detect unprecedented fire fronts, analyze seasonal 
          combustion patterns, and quantify thermal radiative energy.
        </p>

        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span><strong>Primary Focus:</strong> India (National Scale)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span><strong>Secondary Scope:</strong> Global Telemetry</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span><strong>Data Source:</strong> NASA FIRMS (Near-Real-Time)</span>
          </div>
        </div>
      </div>

      {/* 2. NASA DATASETS & SATELLITE CONSTELLATIONS */}
      <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-orange-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            NASA Satellite Datasets & Sensor Systems
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          FirePulse retrieves active fire products directly from the <strong>NASA Fire Information for Resource Management System (FIRMS)</strong>, 
          part of NASA&apos;s Earth Observing System Data and Information System (EOSDIS):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span>MODIS (Terra & Aqua)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">1 km</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Moderate Resolution Imaging Spectroradiometer flying on NASA EOS Terra (descending, ~10:30 local) and Aqua (ascending, ~13:30 local). 
              Provides a continuous 24+ year climate data record using Bands 21/22 (3.96 μm) and Band 31 (11.03 μm).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span>VIIRS (Suomi NPP, NOAA-20 & NOAA-21)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">375 m</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Visible Infrared Imaging Radiometer Suite on the Joint Polar Satellite System (JPSS). Imagery resolution (I-Bands) 
              detects smaller fires, nighttime smoldering, and resolves perimeter details using Channel I-4 (3.74 μm) and Channel I-5 (11.45 μm).
            </p>
          </div>
        </div>
      </div>

      {/* 3. MODIS VS VIIRS: SENSOR DIFFERENCES & RESOLUTION */}
      <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            MODIS vs VIIRS: Key Differences & Detection Physics
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3 text-amber-400">MODIS (1 km)</th>
                <th className="py-2.5 px-3 text-orange-400">VIIRS (375 m)</th>
                <th className="py-2.5 px-3 text-emerald-400">Analytical Implication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">Nadir Pixel Area</td>
                <td className="py-2.5 px-3">~1.00 km²</td>
                <td className="py-2.5 px-3">~0.14 km²</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">VIIRS has 7x smaller pixel area; detects smaller fires</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">Swath Edge Growth</td>
                <td className="py-2.5 px-3">Pixels grow ~5x toward edge</td>
                <td className="py-2.5 px-3">Pixel aggregation limits growth to &lt;2x</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">VIIRS maintains fine spatial sharpness across entire swath</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">Minimum Detectable Fire</td>
                <td className="py-2.5 px-3">~100 m² flaming front</td>
                <td className="py-2.5 px-3">~10–25 m² flaming front</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">VIIRS detects agricultural residues that MODIS misses</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">Confidence Reporting</td>
                <td className="py-2.5 px-3">Continuous: 0% to 100%</td>
                <td className="py-2.5 px-3">Categorical: low, nominal, high</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Confidence cannot be directly averaged numerically</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. DATA HARMONIZATION METHODOLOGY */}
      <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Harmonization Methodology & Cross-Sensor Fusion
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Because MODIS and VIIRS observe Earth with different spatial footprints, simply summing their raw detections 
          leads to double counting. FirePulse implements a rigorous harmonization pipeline in <code className="text-slate-200">harmonization.py</code>:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[#111827] border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">1. Timestamp & Coordinate Standardization</div>
            <p className="text-slate-400">
              Normalizes heterogeneous observation times to ISO 8601 UTC (<code className="text-slate-300">YYYY-MM-DDTHH:MM:00Z</code>) 
              and coordinates to 5-decimal WGS84 precision (~1.1 meter accuracy).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111827] border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">2. Footprint Modeling & FRP Density</div>
            <p className="text-slate-400">
              Computes ground footprint area (Area = scan × track) and normalizes thermal intensity to 
              Fire Radiative Power Density (MW/km²) to enable fair cross-sensor comparison.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111827] border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">3. Spatiotemporal Coincidence Matching</div>
            <p className="text-slate-400">
              Identifies overlapping observations within Δd ≤ 1.5 km and Δt ≤ 90 min, 
              classifying records as <code className="text-amber-400">UNIQUE_MODIS</code>, <code className="text-orange-400">UNIQUE_VIIRS</code>, 
              or <code className="text-emerald-400">COINCIDENT_OVERLAP</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111827] border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">4. Metadata Preservation Without Fabrication</div>
            <p className="text-slate-400">
              Preserves sensor-specific fields without inventing missing values (e.g. MODIS Band 31 remains <code className="text-slate-300">None</code> on VIIRS records).
            </p>
          </div>
        </div>
      </div>

      {/* 5. MACHINE LEARNING METHODOLOGY */}
      <div className="p-5 rounded-xl bg-[#172235] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-orange-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Machine Learning Methodology: Isolation Forest & K-Means
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-[#111827] border border-slate-800 space-y-2">
            <div className="font-bold text-orange-400 text-sm">Model 1: Isolation Forest (Grid Outliers)</div>
            <p className="text-slate-300 leading-relaxed">
              Aggregates fire detections into 0.5° geographic grid cells and dates. Rather than modeling normal distributions, 
              Isolation Forest isolates anomalies by randomly partitioning feature space (hotspot count, total FRP, mean FRP, and baseline activity ratio). 
              Anomalous grids with unexpected thermal spikes produce shorter tree paths and are assigned anomaly scores from 0.0 to 1.0.
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <strong>Train/Test Leakage Prevention:</strong> Fitted against multi-year historical regional baselines across India&apos;s ecozones.
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#111827] border border-slate-800 space-y-2">
            <div className="font-bold text-blue-400 text-sm">Model 2: K-Means Spatial Clustering</div>
            <p className="text-slate-300 leading-relaxed">
              Partitions proximate geographic points into cohesive spatial clusters based on coordinate proximity. Computes the exact 
              centroid latitude/longitude, total observations, cumulative FRP, and dispersion spread radius in kilometers using Haversine distance, 
              differentiating between single isolated flare events and extensive multi-kilometer fire fronts.
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <strong>Spatial Geometry:</strong> Bounding box coordinates and dispersion radii formatted for direct GIS ingestion.
            </div>
          </div>
        </div>
      </div>

      {/* 6. DATA LIMITATIONS & SCIENTIFIC CAVEATS */}
      <div className="p-5 rounded-xl bg-[#172235] border border-red-500/20 space-y-3">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <h4 className="text-sm font-bold uppercase tracking-wider">
            Important Scientific Guidance & Data Limitations
          </h4>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="font-bold text-red-400 shrink-0">1. Hotspots ≠ Wildfires:</span>
            <span>
              Satellites detect thermal anomalies. In India, a large percentage of active hotspots represent agricultural residue management (paddy/wheat stubble), prescribed forest litter burns, or industrial flares, rather than uncontrolled wildfires.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-bold text-red-400 shrink-0">2. Anomaly ≠ Imminent Hazard:</span>
            <span>
              An ML anomaly score denotes statistical deviation from seasonal baselines (e.g. unusually early combustion or unusually high FRP density). It does not automatically imply life-threatening danger.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-bold text-red-400 shrink-0">3. Non-Predictive Modeling:</span>
            <span>
              FirePulse unsupervised models identify past and current activity patterns. Forecasting future fire spread requires integration of numerical weather prediction (wind vectors, relative humidity, fuel moisture) and terrain topography.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-bold text-red-400 shrink-0">4. Cloud & Smoke Obscuration:</span>
            <span>
              Dense monsoon cloud cover or thick smoke plumes can attenuate thermal infrared radiance, preventing sensors from detecting ground combustion beneath.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-bold text-red-400 shrink-0">5. Orbital Revisit Cadence:</span>
            <span>
              LEO satellites provide snapshot passes 2 to 4 times per day. Flash fires ignited and extinguished between overpass intervals will not be recorded in satellite logs.
            </span>
          </div>
        </div>
      </div>

      {/* 7. CONNECTING YOUR NASA FIRMS API KEY */}
      <div className="p-5 rounded-xl bg-[#172235] border border-slate-800">
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
