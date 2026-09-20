import React, { useState } from 'react';
import { FileHotspot, Finding } from '../types';
import { CodeHeatmap } from '../components/charts/CodeHeatmap';
import { FileCode, ShieldAlert, Terminal, Check } from 'lucide-react';

interface CodeIntelligencePageProps {
  files: FileHotspot[];
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

export const CodeIntelligencePage: React.FC<CodeIntelligencePageProps> = ({
  files,
  findings,
  onSelectFinding,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>(files[0]?.file_path || '');

  const fileFindings = findings.filter((f) => f.file_path === selectedFile);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <FileCode className="w-5 h-5 text-cyan-electric" /> Code Intelligence & File Security
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Deep-dive into source code context, modified files, and line-level vulnerability density.
        </p>
      </div>

      <CodeHeatmap
        files={files}
        onSelectFile={(path) => setSelectedFile(path)}
        selectedFile={selectedFile}
      />

      {/* Selected File Security Annotation View */}
      <div className="glass-panel rounded-xl p-5 border border-obsidian-700 space-y-4">
        <div className="flex items-center justify-between border-b border-obsidian-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-electric" />
            <span className="font-mono text-sm font-bold text-slate-200">{selectedFile}</span>
          </div>
          <span className="font-mono text-xs text-slate-400">
            {fileFindings.length} flagged security {fileFindings.length === 1 ? 'issue' : 'issues'}
          </span>
        </div>

        {fileFindings.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            No vulnerabilities identified in this specific file.
          </div>
        ) : (
          <div className="space-y-3">
            {fileFindings.map((f) => (
              <div
                key={f.id}
                onClick={() => onSelectFinding(f)}
                className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800 hover:border-cyan-electric/40 cursor-pointer space-y-2 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-threat-critical font-bold uppercase">{f.severity}</span>
                    <span className="text-slate-300 font-sans font-medium">{f.title}</span>
                  </div>
                  <span className="text-slate-500">Line {f.line_start}</span>
                </div>
                <pre className="p-2 rounded bg-obsidian-900 text-xs font-mono text-red-300/80 overflow-x-auto">
                  <code>{f.code_snippet}</code>
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
