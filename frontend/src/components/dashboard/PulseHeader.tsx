import React from 'react';
import { GitPullRequest, GitBranch, Clock, FileCode, Cpu, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Scan, ScanProgress } from '../../types';

interface PulseHeaderProps {
  scan?: Scan | null;
  progress?: ScanProgress | null;
  isScanning?: boolean;
}

export const PulseHeader: React.FC<PulseHeaderProps> = ({ scan, progress, isScanning }) => {
  const pr = scan?.pull_request;

  return (
    <div className="craft-panel rounded-2xl p-5 mb-6 border border-white/[0.08] relative overflow-hidden">
      {/* Background scanline effect during scan */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-electric/[0.04] to-transparent animate-scanline" />
      )}

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        {/* Left: PR Context, Branches, and Diff Summary */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span className="text-slate-400">{pr?.repo_owner || 'guardian-demo'}</span>
              <span className="text-slate-600">/</span>
              <span>{pr?.repo_name || 'nexus-ecommerce-platform'}</span>
            </span>

            <span className="bg-cyan-electric/10 text-cyan-electric border border-cyan-electric/25 font-mono text-xs px-2 py-0.5 rounded font-semibold tracking-wide">
              PR #{pr?.number || 42}
            </span>

            <span className="bg-violet-950/40 text-violet-300 border border-violet-500/25 text-[11px] font-mono px-2 py-0.5 rounded font-medium">
              OWASP Top 10:2025 Standard
            </span>

            {/* Diff Stats */}
            <div className="flex items-center gap-1.5 font-mono text-xs bg-black/40 border border-white/[0.06] px-2 py-0.5 rounded">
              <span className="text-emerald-400 font-bold">+{pr?.additions || 482}</span>
              <span className="text-threat-critical font-bold">-{pr?.deletions || 114}</span>
              <span className="text-slate-500 text-[10px] pl-1">{pr?.changed_files || 7} files</span>
            </div>
          </div>

          {/* Branch Flow Diagram */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1 bg-white/[0.03] px-2 py-1 rounded border border-white/[0.06]">
              <GitBranch className="w-3.5 h-3.5 text-cyan-electric" />
              <span className="text-slate-400">base:</span>
              <span className="text-slate-200 font-semibold">{pr?.target_branch || 'main'}</span>
            </div>
            <span className="text-slate-500">&larr;</span>
            <div className="flex items-center gap-1 bg-white/[0.03] px-2 py-1 rounded border border-white/[0.06]">
              <GitBranch className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-slate-400">head:</span>
              <span className="text-slate-200 font-semibold">{pr?.source_branch || 'feature/checkout-v2'}</span>
            </div>
            <span className="text-slate-500 hidden sm:inline">&bull;</span>
            <span className="text-slate-400 text-xs hidden sm:inline truncate max-w-md">
              {pr?.title || 'feat(checkout): add instant checkout API, admin overrides, and legacy payment bridge'}
            </span>
          </div>
        </div>

        {/* Right: Telemetry Cockpit Stats */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap font-mono text-xs border-t xl:border-t-0 pt-3 xl:pt-0 border-white/[0.06]">
          {/* Engine Status Pulse */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              {isScanning ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-electric opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-electric"></span>
                </>
              ) : scan?.critical_count && scan.critical_count > 0 ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-threat-critical opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-threat-critical"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              )}
            </span>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Engine State</span>
              <span className="font-bold text-slate-200 capitalize text-xs">
                {isScanning ? (progress?.current_stage || 'Analyzing...') : (scan?.status || 'Completed')}
              </span>
            </div>
          </div>

          {/* Files Analyzed */}
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Scope</span>
            <span className="font-bold text-slate-200 text-xs tabular-nums">
              {scan?.files_analyzed || 7} Files Inspected
            </span>
          </div>

          {/* Scan Latency */}
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Execution Time</span>
            <span className="font-bold text-slate-200 text-xs tabular-nums">
              {scan?.duration_ms ? `${(scan.duration_ms / 1000).toFixed(2)}s` : '1.84s'}
            </span>
          </div>

          {/* Dual Engine Info */}
          <div className="hidden sm:block">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Engines</span>
            <span className="font-semibold text-cyan-electric text-[11px]">
              Semgrep + 15 AST Rules
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar during active scan */}
      {isScanning && progress && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span className="text-cyan-electric">{progress.current_stage}</span>
            <span className="tabular-nums font-bold">{progress.progress_percent}%</span>
          </div>
          <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-electric h-full transition-all duration-300 shadow-cyan-glow"
              style={{ width: `${progress.progress_percent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
