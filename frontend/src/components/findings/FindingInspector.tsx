import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Terminal,
  Lock,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Code2,
  CheckCircle,
} from 'lucide-react';
import { Finding, FindingStatus } from '../../types';

interface FindingInspectorProps {
  finding: Finding | null;
  onClose: () => void;
  onStatusChange: (findingId: string, status: FindingStatus) => void;
  onExplainRetry?: (findingId: string) => void;
}

export const FindingInspector: React.FC<FindingInspectorProps> = ({
  finding,
  onClose,
  onStatusChange,
  onExplainRetry,
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);

  if (!finding) return null;

  const expl = finding.ai_explanation;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(finding.code_snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyPatch = () => {
    if (expl?.patched_code) {
      navigator.clipboard.writeText(expl.patched_code);
      setCopiedPatch(true);
      setTimeout(() => setCopiedPatch(false), 2000);
    }
  };

  return (
    <div className="craft-panel rounded-2xl border border-white/[0.1] flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Drawer Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-obsidian-900/90 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-wrap font-mono">
          <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-white/[0.05] border border-white/[0.08] text-cyan-electric">
            {finding.rule_id}
          </span>
          <span className="text-xs text-slate-400">
            {finding.file_path}:{finding.line_start}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="p-5 overflow-y-auto space-y-5 flex-1 text-sm font-sans">
        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-slate-100 mb-1.5 font-sans leading-snug">
            {finding.title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">{finding.description}</p>
        </div>

        {/* High-Precision Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          <div className="bg-black/40 border border-white/[0.06] rounded-lg p-2.5">
            <span className="text-slate-500 text-[10px] block uppercase">SEVERITY</span>
            <span className="font-bold uppercase text-threat-critical">{finding.severity}</span>
          </div>
          <div className="bg-black/40 border border-white/[0.06] rounded-lg p-2.5">
            <span className="text-slate-500 text-[10px] block uppercase">RISK SCORE</span>
            <span className="font-bold text-cyan-electric tabular-nums">{finding.risk_score.toFixed(1)} / 100</span>
          </div>
          <div className="bg-black/40 border border-white/[0.06] rounded-lg p-2.5">
            <span className="text-slate-500 text-[10px] block uppercase">CWE</span>
            <span className="font-bold text-slate-200">{finding.cwe}</span>
          </div>
          <div className="bg-black/40 border border-white/[0.06] rounded-lg p-2.5">
            <span className="text-slate-500 text-[10px] block uppercase">OWASP 2025</span>
            <span className="font-bold text-slate-200">{finding.owasp_category}</span>
          </div>
        </div>

        {/* Deterministic Scanner Evidence (Split Diff Gutter View) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-threat-critical" /> Flagged Code Evidence
            </span>
            <button
              onClick={handleCopySnippet}
              className="text-slate-400 hover:text-cyan-electric flex items-center gap-1 transition-colors text-[11px]"
            >
              {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="rounded-lg overflow-hidden border border-red-500/20 bg-black/60 font-mono text-xs">
            <div className="diff-line-del p-3 text-red-200/90 overflow-x-auto">
              <span className="text-red-500 font-bold select-none mr-2">-</span>
              <code>{finding.code_snippet}</code>
            </div>
          </div>
        </div>

        {/* AI Reasoning Trail (Component F) */}
        {expl ? (
          <div className="bg-gradient-to-b from-ai-violet/[0.06] to-transparent border border-ai-violet/25 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-ai-violet/20 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-ai-soft" />
                <span className="font-mono text-xs font-bold text-ai-soft uppercase tracking-wider">
                  AI Reasoning Trail &bull; {expl.model_name}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                Latency: {expl.latency_ms}ms &bull; Conf: {(expl.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* 1. Evidence */}
              <div className="space-y-0.5">
                <span className="text-ai-soft font-mono font-bold uppercase text-[10px] tracking-wider block">
                  1. Root Cause Summary
                </span>
                <p className="text-slate-300 font-sans leading-relaxed">{expl.summary}</p>
              </div>

              {/* 2. Why Flagged */}
              <div className="space-y-0.5">
                <span className="text-ai-soft font-mono font-bold uppercase text-[10px] tracking-wider block">
                  2. AST Pattern Match Rationale
                </span>
                <p className="text-slate-300 font-sans leading-relaxed">{expl.why_flagged}</p>
              </div>

              {/* 3. Threat Vector */}
              <div className="space-y-0.5">
                <span className="text-threat-high font-mono font-bold uppercase text-[10px] tracking-wider block">
                  3. Realistic Attack Vector
                </span>
                <p className="text-slate-300 font-sans leading-relaxed">{expl.attack_scenario}</p>
              </div>

              {/* 4. Potential Impact */}
              <div className="space-y-0.5">
                <span className="text-threat-critical font-mono font-bold uppercase text-[10px] tracking-wider block">
                  4. Potential Security Impact
                </span>
                <p className="text-slate-300 font-sans leading-relaxed">{expl.impact}</p>
              </div>

              {/* 5. Recommended Fix & Patched Code */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                    5. Suggested Secure Patch
                  </span>
                  <button
                    onClick={handleCopyPatch}
                    className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-mono text-[11px] transition-colors"
                  >
                    {copiedPatch ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPatch ? 'Copied' : 'Copy Fix'}</span>
                  </button>
                </div>

                <div className="rounded-lg overflow-hidden border border-emerald-500/25 bg-black/60 font-mono text-xs">
                  <div className="diff-line-add p-3 text-emerald-200 overflow-x-auto">
                    <span className="text-emerald-500 font-bold select-none mr-2">+</span>
                    <code>{expl.patched_code}</code>
                  </div>
                </div>
              </div>

              {/* 6. Human Review Verification Requirement */}
              <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-lg text-[11px] font-mono text-amber-200/90 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> 6. Human Engineer Verification Mandatory
                </div>
                <p className="text-slate-400 font-sans leading-relaxed">
                  Automated AI recommendations must be compiled, tested, and validated by the reviewing developer prior to merging.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-black/30 border border-white/[0.06] rounded-xl text-center space-y-2">
            <Code2 className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">
              Deterministic scanner finding identified. AI explanation has not been requested yet.
            </p>
            {onExplainRetry && (
              <button
                onClick={() => onExplainRetry(finding.id)}
                className="bg-cyan-electric/10 hover:bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/30 px-3 py-1.5 rounded text-xs font-mono transition-colors"
              >
                Synthesize AI Reasoning
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review Actions Footer */}
      <div className="p-4 border-t border-white/[0.08] bg-obsidian-900/90 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Status:</span>
          <span className="font-mono text-xs font-bold uppercase text-slate-200 bg-black/50 px-2 py-0.5 rounded border border-white/[0.08]">
            {finding.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onStatusChange(finding.id, 'false_positive')}
            className="px-3 py-1.5 rounded-md text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-colors"
          >
            Mark False Positive
          </button>
          <button
            onClick={() => onStatusChange(finding.id, finding.status === 'reviewed' ? 'open' : 'reviewed')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
              finding.status === 'reviewed'
                ? 'bg-white/[0.04] text-slate-300 border border-white/[0.08]'
                : 'bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 shadow-sm'
            }`}
          >
            {finding.status === 'reviewed' ? 'Reopen Finding' : '✓ Mark as Reviewed'}
          </button>
        </div>
      </div>
    </div>
  );
};
