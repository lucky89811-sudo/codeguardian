import React from 'react';
import { Sparkles, CheckCircle, FileCode, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Finding } from '../../types';

interface FindingCardProps {
  finding: Finding;
  isSelected?: boolean;
  onSelect: (finding: Finding) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  isSelected = false,
  onSelect,
}) => {
  const sevBadge = {
    critical: 'bg-red-950/40 text-threat-critical border-threat-critical/30',
    high: 'bg-orange-950/40 text-threat-high border-threat-high/30',
    medium: 'bg-amber-950/40 text-threat-medium border-threat-medium/30',
    low: 'bg-emerald-950/40 text-threat-low border-threat-low/30',
    info: 'bg-blue-950/40 text-threat-info border-threat-info/30',
  }[finding.severity] || 'bg-slate-800 text-slate-300 border-slate-700';

  const patternBadge = {
    'Confirmed pattern': 'bg-cyan-950/40 text-cyan-300 border-cyan-500/25',
    'Possible vulnerability': 'bg-amber-950/40 text-amber-300 border-amber-500/25',
    'Needs human review': 'bg-violet-950/40 text-violet-300 border-violet-500/25',
  }[finding.pattern_label] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <div
      onClick={() => onSelect(finding)}
      className={`rounded-xl p-4 transition-all cursor-pointer border relative group ${
        isSelected
          ? 'bg-obsidian-850/90 border-cyan-electric/80 shadow-cyan-glow'
          : 'bg-obsidian-900/60 hover:bg-obsidian-850/70 border-white/[0.06] hover:border-white/[0.15]'
      }`}
    >
      {/* Top Header: Severity, Pattern, Rule ID, and Risk Score */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${sevBadge}`}>
            {finding.severity}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-white/[0.06]">
            {finding.rule_id}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] border ${patternBadge}`}>
            {finding.pattern_label}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 text-[10px]">RISK:</span>
          <span className="font-bold text-white tabular-nums bg-black/50 px-1.5 py-0.5 rounded border border-white/[0.08]">
            {finding.risk_score.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Finding Title */}
      <h4 className="font-semibold text-sm text-slate-100 group-hover:text-cyan-electric transition-colors line-clamp-1 mb-1 font-sans">
        {finding.title}
      </h4>

      {/* File & Line Reference */}
      <div className="flex items-center gap-1 text-xs font-mono text-slate-400 mb-2">
        <FileCode className="w-3.5 h-3.5 text-cyan-electric/60 shrink-0" />
        <span className="text-slate-300 truncate">{finding.file_path}</span>
        <span className="text-slate-500 shrink-0">:{finding.line_start}</span>
      </div>

      {/* Syntax Preview Snippet */}
      <div className="bg-black/50 border border-white/[0.06] rounded-md p-2 text-xs font-mono text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap mb-2.5">
        <span className="text-slate-600 select-none mr-2">{finding.line_start} |</span>
        <code>{finding.code_snippet}</code>
      </div>

      {/* Footer Tags & AI Telemetry */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.05] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-[11px] font-semibold">{finding.owasp_category}</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-400 text-[11px]">{finding.cwe}</span>
        </div>

        <div className="flex items-center gap-2">
          {finding.ai_explanation ? (
            <span className="flex items-center gap-1 text-[10px] text-ai-soft bg-ai-violet/10 border border-ai-violet/30 px-1.5 py-0.5 rounded">
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI ({finding.ai_explanation.latency_ms}ms)</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-500">Deterministic</span>
          )}

          {finding.status === 'reviewed' && (
            <span className="text-emerald-400 text-[10px] flex items-center gap-0.5">
              <CheckCircle className="w-3 h-3" /> Reviewed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
