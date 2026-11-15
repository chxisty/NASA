'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OverviewSection } from '@/components/sections/OverviewSection';
import { LiveMapSection } from '@/components/sections/LiveMapSection';
import { HarmonizationSection } from '@/components/sections/HarmonizationSection';
import { AnomalySection } from '@/components/sections/AnomalySection';
import { HistoricalSection } from '@/components/sections/HistoricalSection';
import { SatelliteDataSection } from '@/components/sections/SatelliteDataSection';
import { AboutSection } from '@/components/sections/AboutSection';

import {
  fetchHealth,
  fetchFires,
  fetchFiresSummary,
  fetchSources,
  fetchTrends,
  fetchHarmonizationSummary,
  fetchMLAnomalies,
  fetchMLClusters,
  fetchMLSummary
} from '@/services/api';

import {
  NavigationSection,
  NormalizedFireObservation,
  FiresSummaryResponse,
  HarmonizationSummaryResponse,
  MLAnomaliesResponse,
  MLClustersResponse,
  MLSummaryResponse,
  AnomalySummary,
  TrendDataPoint,
  SatelliteSourceInfo
} from '@/types';

export default function Home() {
  const [currentSection, setCurrentSection] = useState<NavigationSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedScope, setSelectedScope] = useState<'IND' | 'GLOBAL'>('IND');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedDays, setSelectedDays] = useState<number>(1);

  // Data states
  const [summary, setSummary] = useState<FiresSummaryResponse | null>(null);
  const [harmonizationSummary, setHarmonizationSummary] = useState<HarmonizationSummaryResponse | null>(null);
  const [mlAnomaliesData, setMlAnomaliesData] = useState<MLAnomaliesResponse | null>(null);
  const [mlClustersData, setMlClustersData] = useState<MLClustersResponse | null>(null);
  const [mlSummaryData, setMlSummaryData] = useState<MLSummaryResponse | null>(null);
  const [observations, setObservations] = useState<NormalizedFireObservation[]>([]);
  const [anomalies, setAnomalies] = useState<NormalizedFireObservation[]>([]);
  const [anomalySummary, setAnomalySummary] = useState<AnomalySummary | null>(null);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [sources, setSources] = useState<SatelliteSourceInfo[]>([]);

  // Telemetry status
  const [nasaConnected, setNasaConnected] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load all data streams from FastAPI NASA & Harmonization endpoints
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const countryCode = selectedScope === 'IND' ? 'IND' : 'GLOBAL';

      // Parallel fetch across official NASA FIRMS, Harmonization & ML endpoints
      const [
        healthData,
        summaryData,
        firesData,
        sourcesData,
        trendsData,
        harmData,
        anomaliesRes,
        clustersRes,
        mlSummaryRes
      ] = await Promise.all([
        fetchHealth(),
        fetchFiresSummary(countryCode, selectedSource, selectedDays),
        fetchFires(countryCode, selectedSource, selectedDays),
        fetchSources(),
        fetchTrends(7),
        fetchHarmonizationSummary(countryCode, selectedDays),
        fetchMLAnomalies(countryCode, selectedSource, selectedDays),
        fetchMLClusters(countryCode, selectedSource, selectedDays),
        fetchMLSummary(countryCode, selectedSource, selectedDays)
      ]);

      if (healthData) {
        setNasaConnected(healthData.nasa_api_configured);
        setIsDemoMode(healthData.mode === 'demo');
      }

      setSummary(summaryData);
      setHarmonizationSummary(harmData);
      setObservations(firesData.data);
      setMlAnomaliesData(anomaliesRes);
      setMlClustersData(clustersRes);
      setMlSummaryData(mlSummaryRes);

      // Extract anomalies (FRP > 100 MW or brightness > 360 K)
      const flaggedAnomalies = firesData.data.filter((o) => o.is_anomaly);
      setAnomalies(flaggedAnomalies);

      setAnomalySummary({
        total_anomalies_detected: anomaliesRes?.anomalous_grids_count ?? flaggedAnomalies.length,
        anomaly_ratio: firesData.data.length ? flaggedAnomalies.length / firesData.data.length : 0,
        high_frp_outliers: flaggedAnomalies.filter((a) => (a.frp || 0) > 100).length,
        dense_cluster_anomalies: clustersRes?.total_clusters ?? Math.max(0, flaggedAnomalies.length - 1),
        model_used: 'Isolation Forest (Scikit-Learn) + K-Means Spatial',
        detection_timestamp: new Date().toISOString()
      });

      setSources(sourcesData);
      setTrends(trendsData);
    } catch (err) {
      console.error('Failed to load FirePulse telemetry:', err);
      setError('Unable to load satellite observation telemetry. Check server connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedScope, selectedSource, selectedDays]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  // Convert summary to format expected by OverviewSection
  const overviewSummary = summary ? {
    total_detections: summary.total_observations,
    active_hotspots: summary.total_observations,
    high_confidence_count: (summary.confidence_breakdown.viirs?.high || 0) + (summary.confidence_breakdown.modis?.['high (>80%)'] || 0),
    anomalous_fire_count: anomalies.length,
    avg_frp_mw: summary.frp_stats.mean || 0.0,
    max_frp_mw: summary.frp_stats.max || 0.0,
    max_brightness_k: summary.brightness_stats.max || 0.0,
    primary_instrument: summary.sensor_breakdown.VIIRS >= summary.sensor_breakdown.MODIS ? 'VIIRS 375m' : 'MODIS 1km',
    modis_count: summary.sensor_breakdown.MODIS,
    viirs_count: summary.sensor_breakdown.VIIRS,
    geographic_focus: summary.country === 'IND' ? 'India (National Focus)' : 'Global Observation',
    last_updated: summary.last_updated
  } : null;

  return (
    <div className="min-h-screen bg-[#0B1220] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(section) => setCurrentSection(section)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          currentSection={currentSection}
          onOpenMobileMenu={() => setIsSidebarOpen(true)}
          selectedScope={selectedScope}
          onScopeChange={(scope) => setSelectedScope(scope)}
          selectedSource={selectedSource}
          onSourceChange={(src) => setSelectedSource(src)}
          selectedDays={selectedDays}
          onDaysChange={(d) => setSelectedDays(d)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          nasaConnected={nasaConnected}
          isDemoMode={isDemoMode}
        />

        {/* Dynamic Section Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {currentSection === 'overview' && (
            <OverviewSection
              summary={overviewSummary}
              observations={observations}
              isLoading={isLoading}
              error={error}
              onRefresh={handleRefresh}
              onViewMap={() => setCurrentSection('live-map')}
              onViewAnomalies={() => setCurrentSection('anomalies')}
              onViewHarmonization={() => setCurrentSection('harmonization')}
            />
          )}

          {currentSection === 'live-map' && (
            <LiveMapSection
              observations={observations}
              clustersData={mlClustersData}
              anomaliesData={mlAnomaliesData}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          )}

          {currentSection === 'harmonization' && (
            <HarmonizationSection
              summary={harmonizationSummary}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          )}

          {currentSection === 'anomalies' && (
            <AnomalySection
              anomaliesData={mlAnomaliesData}
              clustersData={mlClustersData}
              summaryData={mlSummaryData}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          )}

          {currentSection === 'historical' && (
            <HistoricalSection
              trends={trends}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          )}

          {currentSection === 'satellite' && (
            <SatelliteDataSection
              satellites={sources.map(s => ({
                name: s.name,
                instrument: s.instrument,
                resolution: s.resolution,
                status: s.status,
                orbit: "Sun-synchronous LEO (~705-824 km)",
                equator_crossing: s.instrument === 'MODIS' ? '10:30 (Terra) / 13:30 (Aqua)' : '13:30 (Ascending)'
              }))}
              constellationName="NASA Earth Observing System (EOS) & Suomi NPP / JPSS"
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          )}

          {currentSection === 'about' && <AboutSection />}
        </main>
      </div>
    </div>
  );
}
