/**
 * FirePulse Unified Type Definitions
 * Frontend data contracts mirroring backend normalized NASA, Harmonization,
 * and Machine Learning (Isolation Forest & K-Means) schemas.
 */

export type NavigationSection = 
  | 'overview'
  | 'live-map'
  | 'harmonization'
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

export interface HarmonizedFireRecord {
  id: string;
  latitude: number;
  longitude: number;
  timestamp_utc: string;
  date: string;
  time_utc: string;
  instrument: 'MODIS' | 'VIIRS';
  satellite: string;
  source: string;
  brightness_k?: number | null;
  frp_mw?: number | null;
  confidence_normalized: 'low' | 'nominal' | 'high';
  confidence_original: string;
  daynight: 'D' | 'N';
  scan_km?: number | null;
  track_km?: number | null;
  footprint_area_km2?: number | null;
  frp_density_mw_per_km2?: number | null;
  coincidence_status: 'UNIQUE_MODIS' | 'UNIQUE_VIIRS' | 'COINCIDENT_OVERLAP';
  matched_sensor_record_ids: string[];
  region?: string | null;
  is_demo: boolean;
  original_record_snapshot?: Record<string, any>;
}

export interface SensorMetricsComparison {
  raw_detections: number;
  total_frp_mw: number;
  mean_frp_mw: number;
  max_frp_mw: number;
  min_frp_mw: number;
  spatial_resolution_nadir: string;
  mean_footprint_km2: number;
  day_detections: number;
  night_detections: number;
  high_confidence_count: number;
}

export interface DailyHarmonizationDataPoint {
  date: string;
  modis_detections: number;
  viirs_detections: number;
  coincident_detections: number;
  estimated_distinct_fires: number;
  modis_frp_total: number;
  viirs_frp_total: number;
}

export interface HarmonizationSummaryResponse {
  total_raw_observations: number;
  distinct_fire_complexes_count: number;
  coincident_overlaps_count: number;
  coincident_modis_hotspots: number;
  coincident_viirs_hotspots: number;
  viirs_to_modis_detection_ratio: number;
  modis_metrics: SensorMetricsComparison;
  viirs_metrics: SensorMetricsComparison;
  daily_comparison: DailyHarmonizationDataPoint[];
  regional_comparison: Record<string, Record<string, any>>;
  scientific_limitations: string[];
  harmonized_records: HarmonizedFireRecord[];
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

// ==============================================================================
// Machine Learning Response Models
// ==============================================================================

export interface GridCellActivity {
  grid_id: string;
  center_lat: number;
  center_lon: number;
  date: string;
  fire_count: number;
  total_frp_mw: number;
  mean_frp_mw: number;
  max_frp_mw: number;
  mean_brightness_k: number;
  baseline_fire_count: number;
  baseline_mean_frp_mw: number;
  activity_ratio_vs_baseline: number;
  is_anomaly: bool | boolean;
  anomaly_score: number;
  flag_reasons: string[];
  land_use_context: string;
  observation_count_modis: number;
  observation_count_viirs: number;
}

export interface KMeansCluster {
  cluster_id: number;
  centroid_lat: number;
  centroid_lon: number;
  observation_count: number;
  total_frp_mw: number;
  avg_frp_mw: number;
  max_brightness_k: number;
  spread_radius_km: number;
  bounding_box: {
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
  };
  observation_ids: string[];
  cluster_label: string;
}

export interface MLAnomaliesResponse {
  total_grids_evaluated: number;
  anomalous_grids_count: number;
  anomalous_grids: GridCellActivity[];
  all_grids: GridCellActivity[];
  model_metadata: Record<string, any>;
  model_explanation: string;
  scientific_disclaimer: string;
}

export interface MLClustersResponse {
  total_clusters: number;
  k_used: number;
  clusters: KMeansCluster[];
  model_metadata: Record<string, any>;
  model_explanation: string;
  scientific_disclaimer: string;
}

export interface MLSummaryResponse {
  total_observations_analyzed: number;
  total_grids_evaluated: number;
  anomalous_grids_count: number;
  clusters_count: number;
  models_used: string[];
  confidence_assessment: string;
  limitations: string[];
  explanations: Record<string, string>;
  disclaimer: string;
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
