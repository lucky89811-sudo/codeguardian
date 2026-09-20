import React from 'react';
import { Shield, Sparkles, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { ScanProgress } from '../types';

interface ScanProgressPageProps {
  progress: ScanProgress | null;
  onViewResults: () => void;
  onRetry: () => void;
}

export const ScanProgressPage: React.FC<ScanProgressPageProps> = ({
  progress,
  onViewResults,
  onRetry,
}) => {
  const isFailed = progress?.status === 'failed';
  const isCompleted = progress?.status === 'completed';

  const stages = [
    { key: 'queued', label: 'Scan Queued in Sandbox' },
    { key: 'fetching_files', label: 'Retrieving PR Diff & Changed Files' },
    { key: 'running_semgrep', label: 'Executing Semgrep Static Analysis' },
    { key: 'running_custom_rules', label: 'Running 15 Custom OWASP:2025 Rules' },
    { key: 'normalizing_findings', label: 'Deduplicating & Mapping CWEs' },
    { key: 'generating_ai_explanations', label: 'Generating Gemini Explainable AI Reasoning' },
    { key: 'completed', label: 'Finalizing Review Workspace' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-cyan-dim border border-cyan-electric/40 text-cyan-electric flex items-center justify-center mx-auto shadow-cyan-glow">
          {isCompleted ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          ) : isFailed ? (
            <AlertCircle className="w-8 h-8 text-threat-critical" />
          ) : (
            <Shield className="w-8 h-8 animate-pulse text-cyan-electric" />
          )}
        </div>

        <h2 className="text-2xl font-mono font-bold text-slate-100 uppercase tracking-wider">
          {isCompleted
            ? 'Security Review Complete'
            : isFailed
            ? 'Scan Failed'
            : 'Analyzing Pull Request...'}
        </h2>

        <p className="text-xs font-mono text-slate-400">
          {progress?.current_stage || 'Initializing analysis pipeline...'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="glass-panel rounded-xl p-6 border border-obsidian-700 space-y-4">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-300">Overall Progress</span>
          <span className="text-cyan-electric font-bold">{progress?.progress_percent || 0}%</span>
        </div>

        <div className="w-full bg-obsidian-950 rounded-full h-2 overflow-hidden border border-obsidian-800">
          <div
            className={`h-full transition-all duration-500 ${
              isFailed ? 'bg-threat-critical' : 'bg-cyan-electric shadow-cyan-glow'
            }`}
            style={{ width: `${progress?.progress_percent || 0}%` }}
          />
        </div>

        {/* Error Notification */}
        {isFailed && progress?.error_message && (
          <div className="p-3 bg-red-950/30 border border-threat-critical/40 rounded-lg text-xs font-mono text-threat-critical">
            {progress.error_message}
          </div>
        )}

        {/* Pipeline Stages Checklist */}
        <div className="pt-4 border-t border-obsidian-800 space-y-2.5 font-mono text-xs">
          {stages.map((stg, i) => {
            const isDone = (progress?.progress_percent || 0) >= (i + 1) * 14;
            const isCurrent = progress?.status === stg.key;

            return (
              <div
                key={stg.key}
                className={`flex items-center justify-between p-2 rounded ${
                  isCurrent ? 'bg-cyan-dim/40 text-cyan-electric' : 'text-slate-400'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-400' : isCurrent ? 'bg-cyan-electric animate-ping' : 'bg-slate-700'}`} />
                  <span>{stg.label}</span>
                </span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        {isCompleted && (
          <button
            onClick={onViewResults}
            className="px-6 py-3 rounded-xl bg-cyan-electric text-obsidian-950 font-mono font-bold text-sm shadow-cyan-glow hover:bg-cyan-300 transition-all flex items-center gap-2"
          >
            <span>Open Guardian Console Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {isFailed && (
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-200 border border-obsidian-700 font-mono text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Scan</span>
          </button>
        )}
      </div>
    </div>
  );
};
