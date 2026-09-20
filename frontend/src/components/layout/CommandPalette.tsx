import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, FileText, Moon, Sun, Play, Plus, Check } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onToggleTheme: () => void;
  onOpenReplay: () => void;
  onFilterCritical: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onToggleTheme,
  onOpenReplay,
  onFilterCritical,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'new-scan',
      title: 'Start a New Security Scan',
      desc: 'Scan public PR or repository URL',
      icon: Plus,
      action: () => {
        onNavigate('scan-setup');
        onClose();
      },
    },
    {
      id: 'crit-findings',
      title: 'Filter Critical Severity Findings',
      desc: 'Jump directly to blocker security issues',
      icon: ShieldAlert,
      action: () => {
        onFilterCritical();
        onClose();
      },
    },
    {
      id: 'threat-replay',
      title: 'Trigger Threat Replay Mode',
      desc: 'Visual playback of finding discovery',
      icon: Play,
      action: () => {
        onOpenReplay();
        onClose();
      },
    },
    {
      id: 'reports',
      title: 'Generate & Export Security Report',
      desc: 'View or download standalone HTML/print report',
      icon: FileText,
      action: () => {
        onNavigate('reports');
        onClose();
      },
    },
    {
      id: 'theme',
      title: 'Toggle Color Theme',
      desc: 'Switch between Dark Obsidian and Light mode',
      icon: Sun,
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-obsidian-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-cyan-electric/40 shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-3 border-b border-obsidian-700 flex items-center gap-2 bg-obsidian-850">
          <Search className="w-4 h-4 text-cyan-electric" />
          <input
            type="text"
            placeholder="Type a command or search actions... (Ctrl+K to dismiss)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-sm font-mono focus:outline-none"
            autoFocus
          />
          <kbd className="bg-obsidian-950 text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded border border-obsidian-700">
            ESC
          </kbd>
        </div>

        <div className="p-2 max-h-72 overflow-y-auto divide-y divide-obsidian-800">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.action}
                className="p-3 rounded-lg hover:bg-obsidian-800 cursor-pointer flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-obsidian-900 border border-obsidian-700 flex items-center justify-center text-slate-300 group-hover:text-cyan-electric group-hover:border-cyan-electric/40 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-cyan-electric font-sans">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{item.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">
              No matching commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
