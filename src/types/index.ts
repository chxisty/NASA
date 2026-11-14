/**
 * FirePulse Unified Type Definitions
 * Frontend data contracts mirroring backend harmonized schemas.
 */

export type NavigationSection = 
  | 'overview'
  | 'live-map'
  | 'anomalies'
  | 'historical'
  | 'satellite'
  | 'about';

export interface FireObservation {
  id: string;
  latitude: number;
  longitude: number;
  brightness: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  instrument: 'MODIS' | 'VIIRS';
  confidence: string;
  version: string;
  bright_t31?: number | null;
  frp?: number | null;
  daynight: string;
  region?: string;
  is_anomaly?: boolean;
  anomaly_score?: number;
}

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

export interface SatelliteInfo {
  name: string;
  instrument: string;
  resolution: string;
  status: string;
  orbit: string;
  equator_crossing: string;
}

export interface SystemHealthResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  nasa_api_configured: bool;
  default_country: string;
  supported_instruments: string[];
  supported_satellites: string[];
}
