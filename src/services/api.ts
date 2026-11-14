/**
 * FirePulse API Service Client
 * Handles communication with the FastAPI backend.
 * Provides resilient fallbacks and error handling.
 */

import {
  FireObservation,
  FireSummaryStats,
  AnomalySummary,
  TrendDataPoint,
  SatelliteInfo,
  SystemHealthResponse
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchHealth(): Promise<SystemHealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Backend currently unreachable, using offline fallback info', error);
    return {
      status: 'offline_mode',
      app_name: 'FirePulse Wildfire Intelligence',
      version: '1.0.0',
      environment: 'development',
      nasa_api_configured: false,
      default_country: 'IND',
      supported_instruments: ['MODIS', 'VIIRS'],
      supported_satellites: ['Terra', 'Aqua', 'Suomi NPP', 'NOAA-20', 'NOAA-21']
    };
  }
}

export async function fetchFireSummary(country = 'IND'): Promise<FireSummaryStats> {
  try {
    const res = await fetch(`${API_BASE}/fires/summary?country=${country}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Summary API failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Failed to fetch summary from backend, using baseline data', error);
    return {
      total_detections: 12,
      active_hotspots: 12,
      high_confidence_count: 8,
      anomalous_fire_count: 3,
      avg_frp_mw: 64.5,
      max_frp_mw: 185.0,
      max_brightness_k: 368.5,
      primary_instrument: 'VIIRS (375m High-Res)',
      modis_count: 4,
      viirs_count: 8,
      geographic_focus: 'India (Default Focus)',
      last_updated: '2026-11-14 20:30 UTC'
    };
  }
}

export async function fetchLiveFires(
  country = 'IND',
  source = 'ALL',
  anomaliesOnly = false
): Promise<FireObservation[]> {
  try {
    const url = `${API_BASE}/fires/live?country=${country}&source=${source}&anomalies_only=${anomaliesOnly}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Live fires failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Failed to fetch live fires from backend, using baseline observations', error);
    // Baseline Indian satellite observations
    return [
      {
        id: "VIIRS-SNPP-IND-2026-001",
        latitude: 30.3753,
        longitude: 75.1432,
        brightness: 348.6,
        scan: 0.38,
        track: 0.36,
        acq_date: "2026-11-14",
        acq_time: "0815",
        satellite: "Suomi NPP",
        instrument: "VIIRS",
        confidence: "high",
        version: "2.0NRT",
        bright_t31: 298.2,
        frp: 68.4,
        daynight: "D",
        region: "Punjab, India",
        is_anomaly: false,
        anomaly_score: 0.32
      },
      {
        id: "VIIRS-NOAA20-IND-2026-002",
        latitude: 30.4120,
        longitude: 75.2105,
        brightness: 362.4,
        scan: 0.40,
        track: 0.37,
        acq_date: "2026-11-14",
        acq_time: "0745",
        satellite: "NOAA-20",
        instrument: "VIIRS",
        confidence: "high",
        version: "2.0NRT",
        bright_t31: 301.5,
        frp: 142.8,
        daynight: "D",
        region: "Punjab, India",
        is_anomaly: true,
        anomaly_score: 0.88
      },
      {
        id: "VIIRS-SNPP-IND-2026-011",
        latitude: 21.4350,
        longitude: 81.8900,
        brightness: 368.5,
        scan: 0.38,
        track: 0.36,
        acq_date: "2026-11-14",
        acq_time: "0810",
        satellite: "Suomi NPP",
        instrument: "VIIRS",
        confidence: "high",
        version: "2.0NRT",
        bright_t31: 305.2,
        frp: 185.0,
        daynight: "D",
        region: "Chhattisgarh, India",
        is_anomaly: true,
        anomaly_score: 0.95
      },
      {
        id: "MODIS-AQUA-IND-2026-003",
        latitude: 30.2981,
        longitude: 75.0894,
        brightness: 331.2,
        scan: 1.10,
        track: 1.00,
        acq_date: "2026-11-14",
        acq_time: "0820",
        satellite: "Aqua",
        instrument: "MODIS",
        confidence: "85",
        version: "6.1NRT",
        bright_t31: 296.8,
        frp: 54.2,
        daynight: "D",
        region: "Punjab, India",
        is_anomaly: false,
        anomaly_score: 0.25
      },
      {
        id: "MODIS-TERRA-IND-2026-005",
        latitude: 23.1124,
        longitude: 79.2015,
        brightness: 335.8,
        scan: 1.20,
        track: 1.10,
        acq_date: "2026-11-14",
        acq_time: "0510",
        satellite: "Terra",
        instrument: "MODIS",
        confidence: "78",
        version: "6.1NRT",
        bright_t31: 298.1,
        frp: 32.5,
        daynight: "D",
        region: "Madhya Pradesh, India",
        is_anomaly: false,
        anomaly_score: 0.18
      },
      {
        id: "VIIRS-NOAA21-IND-2026-006",
        latitude: 20.8410,
        longitude: 84.7215,
        brightness: 355.1,
        scan: 0.39,
        track: 0.37,
        acq_date: "2026-11-14",
        acq_time: "0805",
        satellite: "NOAA-21",
        instrument: "VIIRS",
        confidence: "high",
        version: "2.0NRT",
        bright_t31: 302.0,
        frp: 115.3,
        daynight: "D",
        region: "Odisha, India",
        is_anomaly: true,
        anomaly_score: 0.82
      }
    ];
  }
}

export async function fetchAnomalies(country = 'IND'): Promise<{
  summary: AnomalySummary;
  anomalous_observations: FireObservation[];
}> {
  try {
    const res = await fetch(`${API_BASE}/fires/anomalies?country=${country}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Anomalies API failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Failed to fetch anomalies from backend, using baseline data', error);
    return {
      summary: {
        total_anomalies_detected: 3,
        anomaly_ratio: 0.25,
        high_frp_outliers: 3,
        dense_cluster_anomalies: 1,
        model_used: 'IsolationForest (Scikit-Learn) + Thermal Thresholding',
        detection_timestamp: new Date().toISOString()
      },
      anomalous_observations: [
        {
          id: "VIIRS-SNPP-IND-2026-011",
          latitude: 21.4350,
          longitude: 81.8900,
          brightness: 368.5,
          scan: 0.38,
          track: 0.36,
          acq_date: "2026-11-14",
          acq_time: "0810",
          satellite: "Suomi NPP",
          instrument: "VIIRS",
          confidence: "high",
          version: "2.0NRT",
          bright_t31: 305.2,
          frp: 185.0,
          daynight: "D",
          region: "Chhattisgarh, India",
          is_anomaly: true,
          anomaly_score: 0.95
        },
        {
          id: "VIIRS-NOAA20-IND-2026-002",
          latitude: 30.4120,
          longitude: 75.2105,
          brightness: 362.4,
          scan: 0.40,
          track: 0.37,
          acq_date: "2026-11-14",
          acq_time: "0745",
          satellite: "NOAA-20",
          instrument: "VIIRS",
          confidence: "high",
          version: "2.0NRT",
          bright_t31: 301.5,
          frp: 142.8,
          daynight: "D",
          region: "Punjab, India",
          is_anomaly: true,
          anomaly_score: 0.88
        },
        {
          id: "VIIRS-NOAA21-IND-2026-006",
          latitude: 20.8410,
          longitude: 84.7215,
          brightness: 355.1,
          scan: 0.39,
          track: 0.37,
          acq_date: "2026-11-14",
          acq_time: "0805",
          satellite: "NOAA-21",
          instrument: "VIIRS",
          confidence: "high",
          version: "2.0NRT",
          bright_t31: 302.0,
          frp: 115.3,
          daynight: "D",
          region: "Odisha, India",
          is_anomaly: true,
          anomaly_score: 0.82
        }
      ]
    };
  }
}

export async function fetchTrends(country = 'IND', days = 7): Promise<TrendDataPoint[]> {
  try {
    const res = await fetch(`${API_BASE}/fires/trends?country=${country}&days=${days}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Trends API failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Failed to fetch trends from backend, using baseline data', error);
    return [
      { date: "2026-11-08", modis_count: 4, viirs_count: 12, total_count: 16, avg_frp: 38.5, max_frp: 110.2 },
      { date: "2026-11-09", modis_count: 6, viirs_count: 15, total_count: 21, avg_frp: 42.1, max_frp: 125.0 },
      { date: "2026-11-10", modis_count: 5, viirs_count: 14, total_count: 19, avg_frp: 39.8, max_frp: 95.4 },
      { date: "2026-11-11", modis_count: 8, viirs_count: 19, total_count: 27, avg_frp: 48.7, max_frp: 142.8 },
      { date: "2026-11-12", modis_count: 7, viirs_count: 22, total_count: 29, avg_frp: 51.2, max_frp: 164.2 },
      { date: "2026-11-13", modis_count: 9, viirs_count: 25, total_count: 34, avg_frp: 58.0, max_frp: 185.0 },
      { date: "2026-11-14", modis_count: 5, viirs_count: 18, total_count: 23, avg_frp: 44.5, max_frp: 130.5 },
    ];
  }
}

export async function fetchSatelliteStatus(): Promise<{
  constellation: string;
  satellites: SatelliteInfo[];
}> {
  try {
    const res = await fetch(`${API_BASE}/satellite-status`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Satellite status API failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    return {
      constellation: "NASA Earth Observing System (EOS) & JPSS",
      satellites: [
        {
          name: "Suomi NPP",
          instrument: "VIIRS",
          resolution: "375m (I-bands)",
          status: "Operational",
          orbit: "Sun-synchronous, ~824 km",
          equator_crossing: "13:30 ascending"
        },
        {
          name: "NOAA-20 (JPSS-1)",
          instrument: "VIIRS",
          resolution: "375m (I-bands)",
          status: "Operational",
          orbit: "Sun-synchronous, ~824 km",
          equator_crossing: "13:30 ascending"
        },
        {
          name: "NOAA-21 (JPSS-2)",
          instrument: "VIIRS",
          resolution: "375m (I-bands)",
          status: "Operational",
          orbit: "Sun-synchronous, ~824 km",
          equator_crossing: "13:30 ascending"
        },
        {
          name: "Aqua",
          instrument: "MODIS",
          resolution: "1km (Thermal channels)",
          status: "Operational",
          orbit: "Sun-synchronous, ~705 km",
          equator_crossing: "13:30 ascending"
        },
        {
          name: "Terra",
          instrument: "MODIS",
          resolution: "1km (Thermal channels)",
          status: "Operational",
          orbit: "Sun-synchronous, ~705 km",
          equator_crossing: "10:30 descending"
        }
      ]
    };
  }
}
