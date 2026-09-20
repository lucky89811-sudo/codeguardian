import React, { useState } from 'react';
import { ShieldAlert, Info, HelpCircle, ChevronRight, Activity } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
}) => {
  const [showFormula, setShowFormula] = useState(false);

  let tier = 'Informational';
  let tierColor = 'text-threat-info border-threat-info/30 bg-blue-950/30';
  let strokeColor = '#3B82F6';

  if (score >= 85) {
    tier = 'Critical Threat';
    tierColor = 'text-threat-critical border-threat-critical/40 bg-red-950/40 shadow-threat-glow';
    strokeColor = '#EF4444';
  } else if (score >= 70) {
    tier = 'High Risk';
    tierColor = 'text-threat-high border-threat-high/40 bg-orange-950/40';
    strokeColor = '#F97316';
  } else if (score >= 40) {
    tier = 'Moderate Risk';
    tierColor = 'text-threat-medium border-threat-medium/40 bg-amber-950/40';
    strokeColor = '#F59E0B';
  } else if (score >= 20) {
    tier = 'Low Risk';
    tierColor = 'text-threat-low border-threat-low/40 bg-emerald-950/40';
    strokeColor = '#10B981';
  }

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * (circumference * 0.75);

  return (
    <div className="craft-panel rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between relative shadow-xl">
      {/* Title */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-electric" /> PR Security Index
        </span>
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="text-slate-400 hover:text-cyan-electric text-[11px] flex items-center gap-1 font-mono transition-colors"
          title="Explain risk scoring formula"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Algorithm</span>
        </button>
      </div>

      {/* Radial Instrument Arc */}
      <div className="flex items-center justify-center my-3 relative">
        <svg className="w-44 h-44 transform -rotate-135" viewBox="0 0 160 160">
          {/* Background tick arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#161e2e"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          {/* Active value arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-white tabular-nums">
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
            / 100 INDEX
          </span>
          <span className={`mt-2 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${tierColor}`}>
            {tier}
          </span>
        </div>
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-white/[0.06] text-center font-mono">
        <div className="bg-red-950/20 border border-threat-critical/20 rounded-lg p-1.5">
          <div className="text-[10px] text-threat-critical font-bold">CRIT</div>
          <div className="text-sm font-bold text-white tabular-nums">{criticalCount}</div>
        </div>
        <div className="bg-orange-950/20 border border-threat-high/20 rounded-lg p-1.5">
          <div className="text-[10px] text-threat-high font-bold">HIGH</div>
          <div className="text-sm font-bold text-white tabular-nums">{highCount}</div>
        </div>
        <div className="bg-amber-950/20 border border-threat-medium/20 rounded-lg p-1.5">
          <div className="text-[10px] text-threat-medium font-bold">MED</div>
          <div className="text-sm font-bold text-white tabular-nums">{mediumCount}</div>
        </div>
        <div className="bg-emerald-950/20 border border-threat-low/20 rounded-lg p-1.5">
          <div className="text-[10px] text-threat-low font-bold">LOW</div>
          <div className="text-sm font-bold text-white tabular-nums">{lowCount}</div>
        </div>
      </div>

      {/* Transparent Formula Explainer */}
      {showFormula && (
        <div className="mt-3 p-3 bg-obsidian-950/95 border border-cyan-electric/30 rounded-xl text-xs font-mono text-slate-300 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-1.5 text-cyan-electric font-bold text-[11px]">
            <span>Deterministic Scoring Algorithm</span>
            <button onClick={() => setShowFormula(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="bg-black/60 p-2 rounded text-[11px] text-slate-200 mb-2 border border-white/[0.08] overflow-x-auto">
            <code>score = (sev*0.40 + conf*0.25 + exploit*0.20 + expo*0.15) * 100</code>
          </div>
          <ul className="space-y-1 text-[10px] text-slate-400">
            <li>&bull; Severity Weight: 40% (Crit=1.0, High=0.8, Med=0.55, Low=0.3)</li>
            <li>&bull; Confidence: 25% (AST pattern fidelity)</li>
            <li>&bull; Exploitability: 20% (Remote trigger feasibility)</li>
            <li>&bull; Exposure: 15% (Public API endpoint vs Internal helper)</li>
          </ul>
        </div>
      )}
    </div>
  );
};
