import React, { useState } from 'react';
import { FileCode, AlertOctagon, Table, Layers } from 'lucide-react';
import { FileHotspot, SeverityLevel } from '../../types';

interface CodeHeatmapProps {
  files: FileHotspot[];
  onSelectFile: (filePath: string) => void;
  selectedFile?: string | null;
}

export const CodeHeatmap: React.FC<CodeHeatmapProps> = ({
  files,
  onSelectFile,
  selectedFile,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const getRiskBorder = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return 'border-threat-critical/50 hover:border-threat-critical text-red-400';
      case 'high':
        return 'border-threat-high/50 hover:border-threat-high text-orange-400';
      case 'medium':
        return 'border-threat-medium/50 hover:border-threat-medium text-amber-400';
      default:
        return 'border-threat-low/50 hover:border-threat-low text-emerald-400';
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-obsidian-700">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
            File Risk Heatmap & Hotspots
          </h3>
          <p className="text-xs text-slate-400">
            Density of vulnerabilities mapped across modified pull-request files.
          </p>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
          className="flex items-center gap-1 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700 px-2 py-1 rounded text-xs font-mono transition-colors"
        >
          {viewMode === 'cards' ? (
            <>
              <Table className="w-3.5 h-3.5 text-cyan-electric" /> <span>Table View</span>
            </>
          ) : (
            <>
              <Layers className="w-3.5 h-3.5 text-cyan-electric" /> <span>Grid View</span>
            </>
          )}
        </button>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {files.map((file) => {
            const isSelected = selectedFile === file.file_path;
            return (
              <div
                key={file.file_path}
                onClick={() => onSelectFile(file.file_path)}
                className={`p-3 rounded-lg border bg-obsidian-900/90 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-electric shadow-cyan-glow bg-obsidian-850'
                    : getRiskBorder(file.highest_severity)
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <FileCode className="w-4 h-4 shrink-0 text-cyan-electric/80" />
                    <span className="font-mono text-xs font-bold text-slate-200 truncate" title={file.file_path}>
                      {file.file_path.split('/').pop()}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-obsidian-950 border border-obsidian-800">
                    {file.highest_severity}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 truncate mb-2" title={file.file_path}>
                  {file.file_path}
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-obsidian-800 text-slate-400">
                  <span>{file.findings_count} {file.findings_count === 1 ? 'finding' : 'findings'}</span>
                  <span className="font-bold text-slate-200">
                    Score: {file.risk_score.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Accessible Table Alternative */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-obsidian-850 text-slate-400 border-b border-obsidian-700 uppercase text-[10px]">
              <tr>
                <th className="p-2.5">File Path</th>
                <th className="p-2.5">Highest Severity</th>
                <th className="p-2.5">Findings Count</th>
                <th className="p-2.5">File Risk Score</th>
                <th className="p-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800">
              {files.map((file) => (
                <tr
                  key={file.file_path}
                  onClick={() => onSelectFile(file.file_path)}
                  className="hover:bg-obsidian-800 cursor-pointer"
                >
                  <td className="p-2.5 font-bold text-slate-100">{file.file_path}</td>
                  <td className="p-2.5 uppercase font-bold text-threat-critical">{file.highest_severity}</td>
                  <td className="p-2.5">{file.findings_count}</td>
                  <td className="p-2.5 font-bold text-cyan-electric">{file.risk_score.toFixed(1)}</td>
                  <td className="p-2.5 text-right">
                    <button className="text-cyan-electric hover:underline">Select File →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
