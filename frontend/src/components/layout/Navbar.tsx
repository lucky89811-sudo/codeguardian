import React from 'react';
import {
  Shield,
  Play,
  Command,
  Sun,
  Moon,
  FileText,
  Search,
  History,
  BarChart3,
  Code2,
  AlertOctagon,
  GitBranch,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenReplay?: () => void;
  onOpenCommandPalette?: () => void;
  onNewScan?: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  isDemo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenReplay,
  onOpenCommandPalette,
  onNewScan,
  darkMode,
  onToggleTheme,
}) => {
  const navItems = [
    { id: 'workspace', label: 'Overview', icon: Shield },
    { id: 'findings', label: 'Findings', icon: AlertOctagon },
    { id: 'code-intel', label: 'Heatmap', icon: Code2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'Audit History', icon: History },
    { id: 'reports', label: 'Report Export', icon: FileText },
    { id: 'about', label: 'Safety & Policy', icon: Search },
  ];

  return (
    <nav className="border-b border-white/[0.07] bg-obsidian-900/80 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 py-2.5 flex items-center justify-between transition-colors">
      {/* Brand & Breadcrumbs */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-electric/50 rounded-lg p-1 group"
        >
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-electric to-cyan-700 flex items-center justify-center text-obsidian-950 font-black text-sm shadow-cyan-glow group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 text-obsidian-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-mono font-bold text-xs tracking-wider text-slate-100 flex items-center gap-1">
              CODE<span className="text-cyan-electric">GUARDIAN</span>
            </span>
          </div>
        </button>

        {/* Breadcrumb separator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-500 border-l border-white/[0.08] pl-5">
          <GitBranch className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">nexus-ecommerce-platform</span>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-electric font-semibold">PR #42</span>
        </div>

        {/* Primary Nav Links */}
        <div className="hidden md:flex items-center gap-1 border-l border-white/[0.08] pl-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  active
                    ? 'bg-cyan-electric/10 text-cyan-electric border border-cyan-electric/25 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {onOpenReplay && (
          <button
            onClick={onOpenReplay}
            className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-cyan-electric border border-white/[0.08] hover:border-cyan-electric/30 px-2.5 py-1.5 rounded-md text-xs font-mono transition-all"
            title="Visual step-by-step scan replay"
          >
            <Play className="w-3 h-3 text-cyan-electric" />
            <span className="hidden sm:inline">Threat Replay</span>
          </button>
        )}

        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.07] text-slate-400 hover:text-slate-200 border border-white/[0.08] px-2.5 py-1.5 rounded-md text-xs font-mono transition-all"
          title="Command Palette (Ctrl+K)"
        >
          <Command className="w-3 h-3" />
          <span>Quick Actions</span>
          <kbd className="bg-obsidian-950 px-1 py-0.5 rounded text-[10px] text-slate-400 border border-white/[0.08]">
            Ctrl+K
          </kbd>
        </button>

        <button
          onClick={onNewScan || (() => onNavigate('scan-setup'))}
          className="bg-cyan-electric hover:bg-cyan-300 text-obsidian-950 px-3.5 py-1.5 rounded-md text-xs font-bold font-mono tracking-wide shadow-cyan-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          + New Audit
        </button>

        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-white/[0.08] transition-colors"
          title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
        </button>
      </div>
    </nav>
  );
};
