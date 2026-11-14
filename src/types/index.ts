/**
 * FirePulse Unified Type Definitions
 * Frontend data contracts mirroring backend normalized NASA schemas.
 */

export type NavigationSection = 
  | 'overview'
  | 'live-map'
  | 'anomalies'
  | 'historical'
  | 'satellite'
  | 'about';

export interface NormalizedFireObservation {
  latitude: number;
  longitude: number;
  acquisition_date: string;
  acquisition_time: string;
  satellite: string;
  instrument: 'MODIS' | 'VIIRS';
  confidence: string;
  brightness: number;
  frp?: number | null;
  daynight: 'D' | 'N';
  source: string;
  
  // Preserved sensor metadata
  scan?: number | null;
  track?: number | null;
  version?: string | null;
  bright_t31?: number | null;
  bright_ti4?: number | null;
  bright_ti5?: number | null;
  
  // Provenance
  is_demo: boolean;
  region?: string | null;

  // Compatibility aliases for UI
  id?: string;
  acq_date?: string;
  acq_time?: string;
  is_anomaly?: boolean;
  anomaly_score?: number;
}

export type FireObservation = NormalizedFireObservation;

export interface FireSummaryStats {
  total_detections: number;
  active_hotspots: number;
  high_confidence_count: number;
  anomalous_fire_count: number;
  avg_frp_mw: number;
  max_frp_mw: number;
  max_brightness_k: number;
  primary_instrument: string;
  modis_count: number;
  viirs_count: number;
  geographic_focus: string;
  last_updated: string;
}

export interface SatelliteInfo {
  name: string;
  instrument: string;
  resolution: string;
  status: string;
  orbit: string;
  equator_crossing: string;
}

export interface FiresResponse {
  count: number;
  is_demo_mode: boolean;
  data_source_mode: string;
  message: string;
  country: string;
  sources_queried: string[];
  day_range: number;
  date?: string | null;
  data: NormalizedFireObservation[];
  timestamp: string;
}

export interface FiresSummaryResponse {
  total_observations: number;
  is_demo_mode: boolean;
  country: string;
  sensor_breakdown: {
    MODIS: number;
    VIIRS: number;
  };
  satellite_breakdown: Record<string, number>;
  day_night_breakdown: {
    Day: number;
    Night: number;
  };
  frp_stats: {
    min?: number | null;
    max?: number | null;
    mean?: number | null;
    valid_count: number;
  };
  brightness_stats: {
    min?: number | null;
    max?: number | null;
    mean?: number | null;
  };
  confidence_breakdown: {
    modis: Record<string, number>;
    viirs: Record<string, number>;
  };
  last_updated: string;
}

export interface SatelliteSourceInfo {
  source_key: string;
  name: string;
  instrument: string;
  satellites: string[];
  resolution: string;
  spectral_channels: string;
  description: string;
  status: string;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  mode: 'live' | 'demo';
  nasa_api_configured: boolean;
  default_country: string;
  supported_sources: string[];
  supported_instruments: string[];
  supported_satellites: string[];
  cache_info: {
    cached_queries: number;
    ttl_seconds: number;
  };
}

export interface AnomalySummary {
  total_anomalies_detected: number;
  anomaly_ratio: number;
  high_frp_outliers: number;
  dense_cluster_anomalies: number;
  model_used: string;
  detection_timestamp: string;
}

export interface TrendDataPoint {
  date: string;
  modis_count: number;
  viirs_count: number;
  total_count: number;
  avg_frp: number;
  max_frp: number;
}
