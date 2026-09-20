import React, { useState, useEffect } from 'react';
import { api } from './lib/api';
import {
  Scan,
  Finding,
  FileHotspot,
  ScanTimelineItem,
  ScanAnalytics,
  ScanProgress,
  FindingStatus,
  HealthCheckResponse,
} from './types';

import { Navbar } from './components/layout/Navbar';
import { DemoBanner } from './components/layout/DemoBanner';
import { CommandPalette } from './components/layout/CommandPalette';
import { ThreatReplayModal } from './components/scanner/ThreatReplayModal';

import { LandingPage } from './pages/LandingPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ScanSetupPage } from './pages/ScanSetupPage';
import { ScanProgressPage } from './pages/ScanProgressPage';
import { FindingsExplorerPage } from './pages/FindingsExplorerPage';
import { FindingDetailPage } from './pages/FindingDetailPage';
import { CodeIntelligencePage } from './pages/CodeIntelligencePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutLimitationsPage } from './pages/AboutLimitationsPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('codeguardian-theme');
      return saved !== null ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });
  const [isDemo, setIsDemo] = useState<boolean>(true);

  // Core scan and findings state
  const [scan, setScan] = useState<Scan | null>(null);
  const [scansList, setScansList] = useState<Scan[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [files, setFiles] = useState<FileHotspot[]>([]);
  const [timeline, setTimeline] = useState<ScanTimelineItem[]>([]);
  const [analytics, setAnalytics] = useState<ScanAnalytics | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Scan progress state
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // System Health
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);

  // Modals
  const [isReplayOpen, setIsReplayOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Load initial health check
  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch(() => {});
  }, []);

  // Theme setup
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      try {
        localStorage.setItem('codeguardian-theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      try {
        localStorage.setItem('codeguardian-theme', 'light');
      } catch {}
    }
  }, [darkMode]);

  // Handle Loading Demo Mode
  const handleLoadDemo = async () => {
    setIsLoading(true);
    try {
      const res = await api.loadDemo();
      setIsDemo(true);
      await loadScanData(res.scan_id);
      setCurrentPage('workspace');
    } catch (err) {
      console.error('Failed to load demo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to fetch all entities for a scan ID
  const loadScanData = async (scanId: string) => {
    setIsLoading(true);
    try {
      const [scanData, findingsData, filesData, timelineData, analyticsData] = await Promise.all([
        api.getScan(scanId),
        api.getScanFindings(scanId),
        api.getScanFiles(scanId),
        api.getScanTimeline(scanId),
        api.getScanAnalytics(scanId),
      ]);

      setScan(scanData);
      setFindings(findingsData);
      setFiles(filesData);
      setTimeline(timelineData);
      setAnalytics(analyticsData);
      if (findingsData.length > 0) {
        setSelectedFinding(findingsData[0]);
      }
    } catch (err) {
      console.error('Failed to load scan details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load scans history
  useEffect(() => {
    if (currentPage === 'history') {
      api.listScans().then(setScansList).catch(() => {});
    }
  }, [currentPage]);

  // Handle Starting a New Scan
  const handleStartScan = async (url: string) => {
    setIsLoading(true);
    setCurrentPage('scan-progress');
    try {
      const res = await api.createScan(url);
      setActiveScanId(res.scan_id);
      setIsDemo(false);
      setScanProgress(res);

      // Poll progress every 1.2 seconds until completed or failed
      const interval = setInterval(async () => {
        try {
          const prog = await api.getScanProgress(res.scan_id);
          setScanProgress(prog);
          if (prog.status === 'completed' || prog.status === 'failed') {
            clearInterval(interval);
            if (prog.status === 'completed') {
              await loadScanData(res.scan_id);
            }
          }
        } catch {
          clearInterval(interval);
        }
      }, 1200);
    } catch (err: any) {
      setScanProgress({
        scan_id: 'error',
        status: 'failed',
        current_stage: 'Failed to launch scan',
        progress_percent: 0,
        error_message: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Finding Status Action
  const handleStatusChange = async (findingId: string, status: FindingStatus) => {
    try {
      const updated = await api.updateFindingStatus(findingId, status);
      setFindings((prev) => prev.map((f) => (f.id === findingId ? { ...f, status: updated.status } : f)));
      if (selectedFinding?.id === findingId) {
        setSelectedFinding((prev) => (prev ? { ...prev, status: updated.status } : null));
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Handle AI Explanation Trigger
  const handleExplainRetry = async (findingId: string) => {
    try {
      const updated = await api.explainFinding(findingId);
      setFindings((prev) => prev.map((f) => (f.id === findingId ? updated : f)));
      if (selectedFinding?.id === findingId) {
        setSelectedFinding(updated);
      }
    } catch (err) {
      console.error('Explain retry failed:', err);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-grid-pattern relative transition-colors duration-150 ${
      darkMode ? 'bg-obsidian-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Demo Banner */}
      <DemoBanner isDemo={isDemo} />

      {/* Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(p) => {
          setCurrentPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenReplay={() => setIsReplayOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onNewScan={() => setCurrentPage('scan-setup')}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        isDemo={isDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentPage === 'landing' && (
          <LandingPage
            onStartDemo={handleLoadDemo}
            onNewScan={() => setCurrentPage('scan-setup')}
          />
        )}

        {currentPage === 'workspace' && (
          <WorkspacePage
            scan={scan}
            findings={findings}
            files={files}
            timeline={timeline}
            selectedFinding={selectedFinding}
            onSelectFinding={setSelectedFinding}
            onStatusChange={handleStatusChange}
            onExplainRetry={handleExplainRetry}
            isLoading={isLoading}
          />
        )}

        {currentPage === 'scan-setup' && (
          <ScanSetupPage
            onStartScan={handleStartScan}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {currentPage === 'scan-progress' && (
          <ScanProgressPage
            progress={scanProgress}
            onViewResults={() => setCurrentPage('workspace')}
            onRetry={() => setCurrentPage('scan-setup')}
          />
        )}

        {currentPage === 'findings' && (
          <FindingsExplorerPage
            findings={findings}
            onSelectFinding={(f) => {
              setSelectedFinding(f);
              setCurrentPage('finding-detail');
            }}
          />
        )}

        {currentPage === 'finding-detail' && (
          <FindingDetailPage
            finding={selectedFinding}
            onBack={() => setCurrentPage('workspace')}
            onStatusChange={handleStatusChange}
            onExplainRetry={handleExplainRetry}
          />
        )}

        {currentPage === 'code-intel' && (
          <CodeIntelligencePage
            files={files}
            findings={findings}
            onSelectFinding={(f) => {
              setSelectedFinding(f);
              setCurrentPage('workspace');
            }}
          />
        )}

        {currentPage === 'analytics' && (
          <AnalyticsPage analytics={analytics} />
        )}

        {currentPage === 'history' && (
          <ScanHistoryPage
            scans={scansList}
            onSelectScan={async (id) => {
              await loadScanData(id);
              setCurrentPage('workspace');
            }}
          />
        )}

        {currentPage === 'reports' && (
          <ReportsPage scan={scan} />
        )}

        {currentPage === 'settings' && (
          <SettingsPage health={health} />
        )}

        {currentPage === 'about' && (
          <AboutLimitationsPage />
        )}
      </main>

      {/* Threat Replay Modal (Component H) */}
      <ThreatReplayModal
        isOpen={isReplayOpen}
        onClose={() => setIsReplayOpen(false)}
        findings={findings}
      />

      {/* Command Palette (Component I, Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentPage}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onOpenReplay={() => setIsReplayOpen(true)}
        onFilterCritical={() => {
          setCurrentPage('findings');
        }}
      />
    </div>
  );
};

export default App;
