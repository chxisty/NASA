'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OverviewSection } from '@/components/sections/OverviewSection';
import { LiveMapSection } from '@/components/sections/LiveMapSection';
import { AnomalySection } from '@/components/sections/AnomalySection';
import { HistoricalSection } from '@/components/sections/HistoricalSection';
import { SatelliteDataSection } from '@/components/sections/SatelliteDataSection';
import { AboutSection } from '@/components/sections/AboutSection';

import {
  fetchHealth,
  fetchFireSummary,
  fetchLiveFires,
  fetchAnomalies,
  fetchTrends,
  fetchSatelliteStatus
} from '@/services/api';

import {
  NavigationSection,
  FireObservation,
  FireSummaryStats,
  AnomalySummary,
  TrendDataPoint,
  SatelliteInfo
} from '@/types';

export default function Home() {
  const [currentSection, setCurrentSection] = useState<NavigationSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedScope, setSelectedScope] = useState<'IND' | 'GLOBAL'>('IND');
  const [selectedSensor, setSelectedSensor] = useState<'ALL' | 'MODIS' | 'VIIRS'>('ALL');

  // Data states
  const [summary, setSummary] = useState<FireSummaryStats | null>(null);
  const [observations, setObservations] = useState<FireObservation[]>([]);
  const [anomalies, setAnomalies] = useState<FireObservation[]>([]);
  const [anomalySummary, setAnomalySummary] = useState<AnomalySummary | null>(null);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [satellites, setSatellites] = useState<SatelliteInfo[]>([]);
  const [constellationName, setConstellationName] = useState<string>('NASA Earth Observing System (EOS)');

  // Telemetry status
  const [nasaConnected, setNasaConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load all data streams
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const countryCode = selectedScope === 'IND' ? 'IND' : 'GLOBAL';

      // Parallel fetch across endpoints
      const [healthData, summaryData, firesData, anomalyData, trendsData, satData] =
        await Promise.all([
          fetchHealth(),
          fetchFireSummary(countryCode),
          fetchLiveFires(countryCode, selectedSensor),
          fetchAnomalies(countryCode),
          fetchTrends(countryCode, 7),
          fetchSatelliteStatus()
        ]);

      if (healthData) {
        setNasaConnected(healthData.nasa_api_configured);
      }

      setSummary(summaryData);
      setObservations(firesData);
      setAnomalies(anomalyData.anomalous_observations);
      setAnomalySummary(anomalyData.summary);
      setTrends(trendsData);
      setSatellites(satData.satellites);
      setConstellationName(satData.constellation);
    } catch (err) {
      console.error('Failed to load FirePulse telemetry:', err);
      setError('Unable to load satellite observation telemetry. Check server connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedScope, selectedSensor]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    loadDashboardData(true);
  };

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
          selectedSensor={selectedSensor}
          onSensorChange={(sensor) => setSelectedSensor(sensor)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          nasaConnected={nasaConnected}
        />

        {/* Dynamic Section Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {currentSection === 'overview' && (
            <OverviewSection
              summary={summary}
              observations={observations}
              isLoading={isLoading}
              error={error}
              onRefresh={handleRefresh}
              onViewMap={() => setCurrentSection('live-map')}
              onViewAnomalies={() => setCurrentSection('anomalies')}
            />
          )}

          {currentSection === 'live-map' && (
            <LiveMapSection
              observations={observations}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          )}

          {currentSection === 'anomalies' && (
            <AnomalySection
              anomalies={anomalies}
              summary={anomalySummary}
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
              satellites={satellites}
              constellationName={constellationName}
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
