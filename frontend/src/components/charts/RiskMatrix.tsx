import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { Finding } from '../../types';
import { Table, BarChart2 } from 'lucide-react';

interface RiskMatrixProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ findings, onSelectFinding }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [selectedSev, setSelectedSev] = useState<string>('all');

  const filtered = selectedSev === 'all' ? findings : findings.filter((f) => f.severity === selectedSev);

  const data = filtered.map((f) => ({
    x: Math.round(f.exploitability * 100),
    y: Math.round(f.impact * 100),
    z: Math.round(f.confidence * 100),
    finding: f,
  }));

  const getColor = (sev: string) => {
    switch (sev) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F97316';
      case 'medium':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-obsidian-700">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
            Threat Exploitability vs. Impact Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Bubble size indicates scanner confidence. Click any node to inspect finding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Severity filter */}
          <select
            value={selectedSev}
            onChange={(e) => setSelectedSev(e.target.value)}
            className="bg-obsidian-950 border border-obsidian-700 text-xs font-mono text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-cyan-electric"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Accessible view toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
            className="flex items-center gap-1 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700 px-2 py-1 rounded text-xs font-mono transition-colors"
          >
            {viewMode === 'chart' ? (
              <>
                <Table className="w-3.5 h-3.5 text-cyan-electric" /> <span>Table View</span>
              </>
            ) : (
              <>
                <BarChart2 className="w-3.5 h-3.5 text-cyan-electric" /> <span>2D Matrix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <div className="h-72 w-full font-mono text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <XAxis
                type="number"
                dataKey="x"
                name="Exploitability"
                unit="%"
                domain={[0, 100]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8' }}
                label={{ value: 'Exploitability →', position: 'insideBottom', offset: -10, fill: '#64748b' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Impact"
                unit="%"
                domain={[0, 100]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8' }}
                label={{ value: 'Impact ↑', angle: -90, position: 'insideLeft', fill: '#64748b' }}
              />
              <ZAxis type="number" dataKey="z" range={[80, 260]} name="Confidence" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload.finding as Finding;
                    return (
                      <div className="bg-obsidian-950 border border-obsidian-700 p-2.5 rounded shadow-xl text-xs font-mono space-y-1">
                        <div className="font-bold text-slate-100 line-clamp-1">{item.title}</div>
                        <div className="text-cyan-electric">{item.cwe} • {item.owasp_category}</div>
                        <div className="text-slate-400">
                          Exploit: {item.exploitability * 100}% | Impact: {item.impact * 100}%
                        </div>
                        <div className="text-slate-500 text-[10px]">{item.file_path}:{item.line_start}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Findings"
                data={data}
                onClick={(e) => onSelectFinding(e.finding)}
                className="cursor-pointer"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getColor(entry.finding.severity)}
                    fillOpacity={0.8}
                    stroke="#ffffff"
                    strokeWidth={1}
                    className="hover:opacity-100 transition-opacity"
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Accessible Table Alternative */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-obsidian-850 text-slate-400 border-b border-obsidian-700 uppercase text-[10px]">
              <tr>
                <th className="p-2">Finding</th>
                <th className="p-2">Severity</th>
                <th className="p-2">Exploitability</th>
                <th className="p-2">Impact</th>
                <th className="p-2">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800">
              {filtered.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => onSelectFinding(f)}
                  className="hover:bg-obsidian-800 cursor-pointer"
                >
                  <td className="p-2 font-sans">{f.title}</td>
                  <td className="p-2 font-bold uppercase">{f.severity}</td>
                  <td className="p-2">{(f.exploitability * 100).toFixed(0)}%</td>
                  <td className="p-2">{(f.impact * 100).toFixed(0)}%</td>
                  <td className="p-2">{(f.confidence * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
