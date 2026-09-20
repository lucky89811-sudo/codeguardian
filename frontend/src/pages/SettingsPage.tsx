import React from 'react';
import { Settings as SettingsIcon, Key, Shield, Sliders, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { HealthCheckResponse } from '../types';

interface SettingsPageProps {
  health: HealthCheckResponse | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ health }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-cyan-electric" /> System & Engine Settings
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Review static analysis engines, API credentials, and review comment safeguards.
        </p>
      </div>

      <div className="glass-panel rounded-xl p-6 border border-obsidian-700 space-y-6">
        {/* Capability Status */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Backend Scanner Integrations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-obsidian-950 border border-obsidian-800 rounded-lg flex items-center justify-between">
              <span>Semgrep CLI Subprocess</span>
              {health?.capabilities.semgrep_installed ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Installed
                </span>
              ) : (
                <span className="text-slate-400">Fallback Engine Active</span>
              )}
            </div>

            <div className="p-3 bg-obsidian-950 border border-obsidian-800 rounded-lg flex items-center justify-between">
              <span>Google Gemini AI SDK</span>
              {health?.capabilities.gemini_configured ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Live API Active
                </span>
              ) : (
                <span className="text-amber-400 font-bold">Offline Demo Provider</span>
              )}
            </div>

            <div className="p-3 bg-obsidian-950 border border-obsidian-800 rounded-lg flex items-center justify-between">
              <span>GitHub API Token</span>
              {health?.capabilities.github_token_configured ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                </span>
              ) : (
                <span className="text-slate-400">Public Rate-Limit</span>
              )}
            </div>

            <div className="p-3 bg-obsidian-950 border border-obsidian-800 rounded-lg flex items-center justify-between">
              <span>OWASP Standard Version</span>
              <span className="text-cyan-electric font-bold">{health?.owasp_standard || '2025'}</span>
            </div>
          </div>
        </div>

        {/* Security Comment Guardrails */}
        <div className="space-y-3 pt-4 border-t border-obsidian-800">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-400" /> GitHub Review Comments Safety Guard
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            By design, CodeGuardian disables automatic comment publishing. Publishing inline comments to a GitHub pull request requires server-side enablement (<code className="text-cyan-electric font-mono">ENABLE_GITHUB_COMMENTS=true</code>) and explicit confirmation on each request.
          </p>
          <div className="p-3 bg-obsidian-950 rounded-lg border border-obsidian-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Automated Comment Publishing</span>
            <span className="text-threat-critical font-bold">DISABLED (Protected)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
