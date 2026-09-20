import React from 'react';
import { Database, ShieldCheck, Sparkles, X } from 'lucide-react';

interface DemoBannerProps {
  isDemo?: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ isDemo = true }) => {
  const [dismissed, setDismissed] = React.useState(false);
  if (!isDemo || dismissed) return null;

  return (
    <div className="bg-obsidian-900/90 border-b border-white/[0.06] text-slate-300 px-4 py-1.5 text-xs flex items-center justify-between font-mono backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-electric opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-electric"></span>
          </span>
          <span className="bg-white/[0.08] text-cyan-electric text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide border border-cyan-electric/20 uppercase">
            DEMO MODE
          </span>
        </div>

        <span className="text-slate-400 truncate text-[11px]">
          Synthesized Pull Request Security Audit: <span className="text-slate-200">nexus-ecommerce-platform / PR #42</span> &bull; 100% offline dataset
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>OWASP Top 10:2025 Aligned</span>
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-500 hover:text-slate-300 p-0.5 rounded hover:bg-white/[0.05] transition-colors"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
