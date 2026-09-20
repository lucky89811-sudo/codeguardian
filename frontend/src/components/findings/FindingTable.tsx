import React from 'react';
import { Finding } from '../../types';

interface FindingTableProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

export const FindingTable: React.FC<FindingTableProps> = ({ findings, onSelectFinding }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-obsidian-700 bg-obsidian-900">
      <table className="w-full text-left text-xs font-mono text-slate-300">
        <thead className="bg-obsidian-850 text-slate-400 border-b border-obsidian-700 uppercase text-[10px] tracking-wider">
          <tr>
            <th className="p-3">Severity</th>
            <th className="p-3">Title & Rule</th>
            <th className="p-3">File Location</th>
            <th className="p-3">OWASP 2025</th>
            <th className="p-3">CWE</th>
            <th className="p-3">Risk Score</th>
            <th className="p-3">Source</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-obsidian-800">
          {findings.map((f) => (
            <tr
              key={f.id}
              onClick={() => onSelectFinding(f)}
              className="hover:bg-obsidian-800/60 cursor-pointer transition-colors"
            >
              <td className="p-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    f.severity === 'critical'
                      ? 'text-red-400 bg-red-950/40 border border-red-500/30'
                      : f.severity === 'high'
                      ? 'text-orange-400 bg-orange-950/40 border border-orange-500/30'
                      : f.severity === 'medium'
                      ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                      : 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                  }`}
                >
                  {f.severity}
                </span>
              </td>
              <td className="p-3 font-sans font-medium text-slate-100">
                <div>{f.title}</div>
                <div className="text-[10px] font-mono text-slate-500">{f.rule_id}</div>
              </td>
              <td className="p-3 text-slate-400">
                {f.file_path}:{f.line_start}
              </td>
              <td className="p-3 text-cyan-400">{f.owasp_category}</td>
              <td className="p-3 text-slate-400">{f.cwe}</td>
              <td className="p-3 font-bold text-slate-200">{f.risk_score.toFixed(1)}</td>
              <td className="p-3 text-slate-400">{f.source}</td>
              <td className="p-3 capitalize">{f.status}</td>
              <td className="p-3 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFinding(f);
                  }}
                  className="text-cyan-electric hover:underline"
                >
                  Inspect →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
