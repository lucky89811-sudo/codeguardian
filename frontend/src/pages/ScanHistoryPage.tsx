import React from 'react';
import { Scan } from '../types';
import { History, GitPullRequest, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface ScanHistoryPageProps {
  scans: Scan[];
  onSelectScan: (scanId: string) => void;
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({ scans, onSelectScan }) => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-electric" /> Security Review Audit History
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Audit trail of past pull-request assessments, risk velocities, and scanner snapshots.
        </p>
      </div>

      <div className="glass-panel rounded-xl border border-obsidian-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-obsidian-850 text-slate-400 border-b border-obsidian-700 uppercase text-[10px]">
              <tr>
                <th className="p-3">Repository / PR</th>
                <th className="p-3">Risk Index</th>
                <th className="p-3">Findings</th>
                <th className="p-3">Critical / High</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800">
              {scans.map((s) => {
                const pr = s.pull_request;
                return (
                  <tr
                    key={s.id}
                    onClick={() => onSelectScan(s.id)}
                    className="hover:bg-obsidian-800/60 cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-bold text-slate-100">
                        {pr ? `${pr.repo_owner}/${pr.repo_name}` : 'Sample Repo'}
                      </div>
                      <div className="text-[11px] text-cyan-electric">PR #{pr?.number || 42}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-threat-critical">{s.overall_score.toFixed(1)}</span>
                      <span className="text-slate-500"> / 100</span>
                    </td>
                    <td className="p-3">{s.total_findings}</td>
                    <td className="p-3 text-threat-critical">
                      {s.critical_count} / {s.high_count}
                    </td>
                    <td className="p-3 text-slate-400">
                      {(s.duration_ms / 1000).toFixed(2)}s
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(s.started_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectScan(s.id);
                        }}
                        className="text-cyan-electric hover:underline flex items-center gap-1 ml-auto"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
