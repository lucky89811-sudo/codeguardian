import React, { useState } from 'react';
import { Shield, GitPullRequest, ArrowRight, AlertCircle, CheckCircle2, FileCode, Check } from 'lucide-react';
import { api } from '../lib/api';

interface ScanSetupPageProps {
  onStartScan: (url: string) => void;
  onLoadDemo: () => void;
}

export const ScanSetupPage: React.FC<ScanSetupPageProps> = ({ onStartScan, onLoadDemo }) => {
  const [url, setUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleUrls = [
    {
      title: 'Demo eCommerce Platform (Bundled Fixture)',
      desc: 'PR #42: SQL injection, hardcoded stripe key, unsafe shell, insecure CORS',
      action: onLoadDemo,
      isDemo: true,
    },
    {
      title: 'facebook/react PR #28000',
      url: 'https://github.com/facebook/react/pull/28000',
      desc: 'Public open-source pull request',
      isDemo: false,
    },
    {
      title: 'fastapi/fastapi PR #10000',
      url: 'https://github.com/fastapi/fastapi/pull/10000',
      desc: 'Python web framework pull request',
      isDemo: false,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid GitHub pull request URL.');
      return;
    }

    setError(null);
    setIsValidating(true);

    try {
      const parsed = await api.parseGitHubUrl(url);
      if (!parsed.is_valid || parsed.url_type !== 'pull_request') {
        setError(parsed.error || 'The provided URL is not a valid GitHub pull request URL.');
        setIsValidating(false);
        return;
      }
      onStartScan(url);
    } catch (err: any) {
      setError(err.message || 'Failed to validate URL.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-6 h-6 text-cyan-electric" /> Initiate PR Security Audit
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Connect a public GitHub Pull Request URL to run Semgrep, 15 custom rules, and Gemini explainable AI.
        </p>
      </div>

      {/* Main URL Form */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 border border-obsidian-700 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
            GitHub Pull Request URL
          </label>
          <div className="relative">
            <GitPullRequest className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="https://github.com/owner/repository/pull/123"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              className="w-full bg-obsidian-950 border border-obsidian-700 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-electric focus:ring-1 focus:ring-cyan-electric transition-all"
            />
          </div>
          {error && (
            <div className="mt-2 text-xs font-mono text-threat-critical flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Scan Options */}
        <div className="pt-2 border-t border-obsidian-800 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-obsidian-950/60 p-2 rounded border border-obsidian-800">
            <Check className="w-3.5 h-3.5 text-cyan-electric" />
            <span>Semgrep Ruleset (p/default)</span>
          </div>
          <div className="flex items-center gap-2 bg-obsidian-950/60 p-2 rounded border border-obsidian-800">
            <Check className="w-3.5 h-3.5 text-cyan-electric" />
            <span>15 Custom OWASP Rules</span>
          </div>
          <div className="flex items-center gap-2 bg-obsidian-950/60 p-2 rounded border border-obsidian-800">
            <Check className="w-3.5 h-3.5 text-cyan-electric" />
            <span>Gemini 2.5 Explainable AI</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isValidating}
          className="w-full py-3 rounded-xl bg-cyan-electric hover:bg-cyan-300 text-obsidian-950 font-mono font-bold text-sm shadow-cyan-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isValidating ? (
            <span>Validating Pull Request URL...</span>
          ) : (
            <>
              <span>Launch Security Review Scan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Preset / Sample Repositories */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Or Select a Sample Assessment:
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {sampleUrls.map((sample, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (sample.isDemo && sample.action) {
                  sample.action();
                } else if (sample.url) {
                  setUrl(sample.url);
                }
              }}
              className="glass-panel-hover glass-panel p-4 rounded-xl border border-obsidian-700/80 cursor-pointer flex items-center justify-between group transition-all"
            >
              <div>
                <div className="text-sm font-bold text-slate-200 group-hover:text-cyan-electric flex items-center gap-2">
                  <span>{sample.title}</span>
                  {sample.isDemo && (
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded border border-amber-500/30">
                      OFFLINE DEMO
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{sample.desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-electric group-hover:translate-x-0.5 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
