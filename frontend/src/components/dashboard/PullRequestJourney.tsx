import React from 'react';
import { GitPullRequest, Search, FileCode, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ScanTimelineItem } from '../../types';

interface PullRequestJourneyProps {
  timeline: ScanTimelineItem[];
}

export const PullRequestJourney: React.FC<PullRequestJourneyProps> = ({ timeline }) => {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'fetching_files':
        return <GitPullRequest className="w-4 h-4 text-cyan-electric" />;
      case 'running_semgrep':
      case 'running_custom_rules':
        return <Search className="w-4 h-4 text-amber-400" />;
      case 'generating_ai_explanations':
        return <Sparkles className="w-4 h-4 text-ai-soft" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-obsidian-700">
      <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
        <GitPullRequest className="w-4 h-4 text-cyan-electric" /> Pull Request Security Audit Journey
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-obsidian-700">
        {timeline.map((item, index) => (
          <div key={item.id || index} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-obsidian-950 border-2 border-cyan-electric flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-electric"></span>
            </div>

            <div className="bg-obsidian-900/60 border border-obsidian-800 rounded-lg p-3 group-hover:border-cyan-electric/30 transition-colors">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  {getStageIcon(item.stage)} {item.title}
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
