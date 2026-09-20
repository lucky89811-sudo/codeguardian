import React, { useState, useEffect } from 'react';
import { X, Play, Pause, SkipForward, RotateCcw, Shield, AlertTriangle, FileCode } from 'lucide-react';
import { Finding } from '../../types';

interface ThreatReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  findings: Finding[];
}

export const ThreatReplayModal: React.FC<ThreatReplayModalProps> = ({
  isOpen,
  onClose,
  findings,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0);
      setIsPlaying(true);
      return;
    }

    let interval: any = null;
    if (isPlaying && currentIndex < findings.length) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev + 1 >= findings.length) {
            setIsPlaying(false);
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, currentIndex, findings.length]);

  if (!isOpen) return null;

  const visibleFindings = findings.slice(0, currentIndex);
  const currentFinding = findings[currentIndex - 1] || findings[0];

  // Dynamic progressive score calculation
  const progressiveScore = visibleFindings.length > 0
    ? Math.min(100, Math.round((visibleFindings.reduce((acc, f) => acc + f.risk_score, 0) / visibleFindings.length) * 1.15))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-cyan-electric/40 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-obsidian-850 border-b border-obsidian-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-cyan-electric/10 border border-cyan-electric/40 flex items-center justify-center text-cyan-electric">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
                Threat Replay Visualizer
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Replaying discovery sequence of {findings.length} audit findings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-obsidian-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playback Controls & Progressive Telemetry */}
        <div className="p-4 bg-obsidian-900 border-b border-obsidian-800 flex items-center justify-between flex-wrap gap-3 font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded bg-cyan-electric text-obsidian-950 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-300 transition-colors shadow-cyan-glow"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Resume'}</span>
            </button>
            <button
              onClick={() => {
                setCurrentIndex(findings.length);
                setIsPlaying(false);
              }}
              className="px-3 py-1.5 rounded bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700 text-xs flex items-center gap-1.5"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip to End</span>
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsPlaying(true);
              }}
              className="p-1.5 rounded bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700"
              title="Restart Replay"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400">Progress:</span>{' '}
              <span className="text-cyan-electric font-bold">{currentIndex} / {findings.length}</span>
            </div>
            <div>
              <span className="text-slate-400">Running Risk:</span>{' '}
              <span className="text-threat-critical font-bold">{progressiveScore} / 100</span>
            </div>
          </div>
        </div>

        {/* Replay Stream View */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {visibleFindings.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              Initializing replay engine... Click Resume to start.
            </div>
          ) : (
            visibleFindings.map((f, i) => (
              <div
                key={f.id}
                className="p-3 rounded-lg bg-obsidian-900 border border-obsidian-800 flex items-center justify-between gap-3 animate-fade-in text-xs font-mono"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-slate-500">#{i + 1}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    f.severity === 'critical' ? 'text-red-400 bg-red-950/40' : 'text-orange-400 bg-orange-950/40'
                  }`}>
                    {f.severity}
                  </span>
                  <span className="font-sans font-medium text-slate-200 truncate">{f.title}</span>
                </div>
                <div className="text-slate-400 shrink-0">{f.file_path}:{f.line_start}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
