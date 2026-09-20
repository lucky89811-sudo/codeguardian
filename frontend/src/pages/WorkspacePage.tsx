import React, { useState } from 'react';
import { Scan, Finding, FileHotspot, ScanTimelineItem, FindingStatus } from '../types';
import { PulseHeader } from '../components/dashboard/PulseHeader';
import { ScoreGauge } from '../components/dashboard/ScoreGauge';
import { FindingCard } from '../components/findings/FindingCard';
import { FindingInspector } from '../components/findings/FindingInspector';
import { FindingTable } from '../components/findings/FindingTable';
import { RiskMatrix } from '../components/charts/RiskMatrix';
import { CodeHeatmap } from '../components/charts/CodeHeatmap';
import { RiskConstellation } from '../components/charts/RiskConstellation';
import { PullRequestJourney } from '../components/dashboard/PullRequestJourney';
import { Filter, Layers, Network, Table, BarChart2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface WorkspacePageProps {
  scan: Scan | null;
  findings: Finding[];
  files: FileHotspot[];
  timeline: ScanTimelineItem[];
  selectedFinding: Finding | null;
  onSelectFinding: (finding: Finding | null) => void;
  onStatusChange: (findingId: string, status: FindingStatus) => void;
  onExplainRetry: (findingId: string) => void;
  isLoading: boolean;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  scan,
  findings,
  files,
  timeline,
  selectedFinding,
  onSelectFinding,
  onStatusChange,
  onExplainRetry,
  isLoading,
}) => {
  const [sevFilter, setSevFilter] = useState<string>('all');
  const [owaspFilter, setOwaspFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewTab, setViewTab] = useState<'matrix' | 'heatmap' | 'journey' | 'constellation'>('matrix');
  const [isTableView, setIsTableView] = useState<boolean>(false);

  if (isLoading && !scan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-2 border-cyan-electric border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-slate-400">Loading security review workspace...</p>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center max-w-lg mx-auto border border-obsidian-700 space-y-4 my-12">
        <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-mono font-bold text-slate-200">No Active Scan Session</h3>
        <p className="text-xs text-slate-400">
          Load demo mode or connect a GitHub pull request to start reviewing security findings.
        </p>
      </div>
    );
  }

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    if (sevFilter !== 'all' && f.severity !== sevFilter) return false;
    if (owaspFilter !== 'all' && !f.owasp_category.includes(owaspFilter)) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top: Security Pulse Header */}
      <PulseHeader scan={scan} isScanning={scan.status === 'scanning'} />

      {/* Main Grid: 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Risk Score & Severity Metrics (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <ScoreGauge
            score={scan.overall_score}
            criticalCount={scan.critical_count}
            highCount={scan.high_count}
            mediumCount={scan.medium_count}
            lowCount={scan.low_count}
          />

          {/* Quick Filters Panel */}
          <div className="glass-panel rounded-xl p-4 border border-obsidian-700 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-cyan-electric" /> Filter Findings
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">Severity</label>
                <select
                  value={sevFilter}
                  onChange={(e) => setSevFilter(e.target.value)}
                  className="w-full bg-obsidian-950 border border-obsidian-700 text-slate-200 rounded p-1.5 text-xs focus:outline-none focus:border-cyan-electric"
                >
                  <option value="all">All Severities ({findings.length})</option>
                  <option value="critical">Critical ({scan.critical_count})</option>
                  <option value="high">High ({scan.high_count})</option>
                  <option value="medium">Medium ({scan.medium_count})</option>
                  <option value="low">Low ({scan.low_count})</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">OWASP 2025 Category</label>
                <select
                  value={owaspFilter}
                  onChange={(e) => setOwaspFilter(e.target.value)}
                  className="w-full bg-obsidian-950 border border-obsidian-700 text-slate-200 rounded p-1.5 text-xs focus:outline-none focus:border-cyan-electric"
                >
                  <option value="all">All Categories</option>
                  <option value="A05">A05:2025 Injection</option>
                  <option value="A01">A01:2025 Broken Access Control</option>
                  <option value="A07">A07:2025 Auth Failures</option>
                  <option value="A03">A03:2025 Supply Chain</option>
                  <option value="A02">A02:2025 Cryptographic</option>
                  <option value="A06">A06:2025 Misconfiguration</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">Review Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-obsidian-950 border border-obsidian-700 text-slate-200 rounded p-1.5 text-xs focus:outline-none focus:border-cyan-electric"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="false_positive">False Positive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Findings Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Security Findings ({filteredFindings.length})
            </h3>
            <button
              onClick={() => setIsTableView(!isTableView)}
              className="text-xs font-mono text-slate-400 hover:text-cyan-electric flex items-center gap-1 transition-colors"
            >
              <Table className="w-3.5 h-3.5" />
              <span>{isTableView ? 'Card View' : 'Table View'}</span>
            </button>
          </div>

          {filteredFindings.length === 0 ? (
            <div className="p-8 rounded-xl bg-obsidian-900 border border-obsidian-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-mono text-slate-300">No findings match active filter.</p>
            </div>
          ) : isTableView ? (
            <FindingTable findings={filteredFindings} onSelectFinding={onSelectFinding} />
          ) : (
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {filteredFindings.map((f) => (
                <FindingCard
                  key={f.id}
                  finding={f}
                  isSelected={selectedFinding?.id === f.id}
                  onSelect={onSelectFinding}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Selected Finding Inspector (4 cols) */}
        <div className="lg:col-span-4 sticky top-20">
          {selectedFinding ? (
            <div className="h-[750px]">
              <FindingInspector
                finding={selectedFinding}
                onClose={() => onSelectFinding(null)}
                onStatusChange={onStatusChange}
                onExplainRetry={onExplainRetry}
              />
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-8 border border-obsidian-700 text-center space-y-3 h-[400px] flex flex-col items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-slate-600" />
              <h4 className="text-sm font-mono font-bold text-slate-300">No Finding Selected</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Select any security finding from the list or matrix to open the decoupled code evidence and explainable AI reasoning trail.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Below Section: Tabbed Analytics & Deep Dive Visualizations */}
      <div className="pt-6 border-t border-obsidian-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-obsidian-700/80 pb-2">
          <button
            onClick={() => setViewTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              viewTab === 'matrix'
                ? 'bg-cyan-dim text-cyan-electric border border-cyan-electric/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> 2D Risk Matrix
          </button>
          <button
            onClick={() => setViewTab('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              viewTab === 'heatmap'
                ? 'bg-cyan-dim text-cyan-electric border border-cyan-electric/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Code Heatmap
          </button>
          <button
            onClick={() => setViewTab('constellation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              viewTab === 'constellation'
                ? 'bg-cyan-dim text-cyan-electric border border-cyan-electric/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" /> Explore Graph (Constellation)
          </button>
          <button
            onClick={() => setViewTab('journey')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              viewTab === 'journey'
                ? 'bg-cyan-dim text-cyan-electric border border-cyan-electric/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>PR Journey Timeline</span>
          </button>
        </div>

        <div>
          {viewTab === 'matrix' && (
            <RiskMatrix findings={findings} onSelectFinding={onSelectFinding} />
          )}
          {viewTab === 'heatmap' && (
            <CodeHeatmap files={files} onSelectFile={(p) => {}} />
          )}
          {viewTab === 'constellation' && (
            <RiskConstellation findings={findings} onSelectFinding={onSelectFinding} />
          )}
          {viewTab === 'journey' && (
            <PullRequestJourney timeline={timeline} />
          )}
        </div>
      </div>
    </div>
  );
};
