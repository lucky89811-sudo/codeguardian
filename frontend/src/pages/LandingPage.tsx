import React from 'react';
import {
  Shield,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertOctagon,
  Terminal,
  FileCode,
  Cpu,
  GitPullRequest,
  Check,
  ChevronRight,
} from 'lucide-react';

interface LandingPageProps {
  onStartDemo: () => void;
  onNewScan: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDemo, onNewScan }) => {
  return (
    <div className="space-y-24 pb-20 pt-4">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-7 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 text-cyan-electric text-xs font-mono tracking-wide">
          <span className="w-2 h-2 rounded-full bg-cyan-electric animate-pulse"></span>
          <span>Next-Generation Pull Request Security Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-sans">
          Static Analysis with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-electric via-teal-300 to-violet-400">
            Explainable AI Reasoning.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
          CodeGuardian audits GitHub Pull Requests by combining deterministic Semgrep and AST rules with Google Gemini structured analysis. It cuts through noise, explains root causes, and suggests verified patches.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
          <button
            onClick={onStartDemo}
            className="px-6 py-3 rounded-xl bg-cyan-electric hover:bg-cyan-300 text-obsidian-950 font-mono font-bold text-sm shadow-cyan-glow transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
          >
            <span>Launch Demo Mode (Instant)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onNewScan}
            className="px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.1] hover:border-cyan-electric/40 font-mono text-sm transition-all flex items-center gap-2"
          >
            <GitPullRequest className="w-4 h-4 text-cyan-electric" />
            <span>Audit GitHub PR</span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-500 flex items-center justify-center gap-4 flex-wrap">
          <span>✓ 100% Offline Capable</span>
          <span>&bull;</span>
          <span>✓ Zero Credential Requirement for Demo</span>
          <span>&bull;</span>
          <span>✓ OWASP Top 10:2025 Aligned</span>
        </div>
      </section>

      {/* Hero Product Mockup / Terminal Preview */}
      <section className="craft-panel rounded-2xl border border-white/[0.1] max-w-5xl mx-auto shadow-2xl overflow-hidden relative">
        <div className="bg-obsidian-900/90 px-4 py-3 border-b border-white/[0.08] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-slate-400 pl-2">nexus-ecommerce-platform #42 &bull; guardian-review-stream</span>
          </div>
          <span className="text-cyan-electric font-bold text-[10px] bg-cyan-electric/10 px-2 py-0.5 rounded border border-cyan-electric/30">
            AUDIT ACTIVE // 92.4 RISK
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-obsidian-950/60 font-mono text-xs">
          {/* Left Column: Finding Stream */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Detected Findings Stream</div>

            <div className="p-3.5 rounded-xl bg-obsidian-900 border border-red-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950/60 text-threat-critical border border-red-500/30">
                  CRITICAL &bull; CG-SEC-006
                </span>
                <span className="text-white font-bold">Risk: 93.5/100</span>
              </div>
              <div className="font-sans font-semibold text-slate-200">Dynamic SQL Injection in Order Query</div>
              <div className="text-[11px] text-slate-400">backend/app/db/orders.py:34</div>
            </div>

            <div className="p-3 rounded-xl bg-obsidian-900/60 border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-950/40 text-threat-high border border-orange-500/30">
                  HIGH &bull; CG-SEC-008
                </span>
                <span className="text-slate-300">Risk: 82.0/100</span>
              </div>
              <div className="font-sans text-slate-300">Path Traversal via Unvalidated File Loading</div>
            </div>
          </div>

          {/* Right Column: AI Reasoning Trail Overlay */}
          <div className="lg:col-span-7 bg-obsidian-900/80 border border-white/[0.08] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-ai-soft font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Explainable Remediation (Gemini 2.5)
              </span>
              <span className="text-slate-500 text-[10px]">Conf: 96% &bull; Latency: 18ms</span>
            </div>

            <div className="space-y-2">
              <div className="diff-line-del p-2 rounded text-red-200 text-[11px] overflow-x-auto">
                - query = f"SELECT * FROM orders WHERE customer_id = &#39;{'{customer_id}'}&#39;"
              </div>
              <div className="diff-line-add p-2 rounded text-emerald-200 text-[11px] overflow-x-auto">
                + query = "SELECT * FROM orders WHERE customer_id = %s"
                <br />+ cursor.execute(query, (customer_id,))
              </div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/25 p-2.5 rounded text-[11px] text-amber-200/90 font-sans">
              <strong>Human Verification Required:</strong> AI suggests query parameter binding. Reviewer must ensure database driver matches psycopg2 substitution syntax.
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Pillars */}
      <section className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight">
            Designed for Trust, Transparency & Human Review
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Rigorous application security engineering without unverified automated claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          <div className="craft-panel p-6 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-electric/10 text-cyan-electric flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Zero Code Execution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Untrusted pull request code is treated strictly as passive string context. No npm install, no setup scripts, and no arbitrary code execution.
            </p>
          </div>

          <div className="craft-panel p-6 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Pre-Scan Secret Scrubbing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-entropy tokens, AWS credentials, JWTs, and private keys are scrubbed automatically before code snippets touch AI models or reports.
            </p>
          </div>

          <div className="craft-panel p-6 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Transparent 0–100 Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No black-box scores. Risk calculations factor severity, AST confidence, exploitability, and exposure with full mathematical breakdown.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
