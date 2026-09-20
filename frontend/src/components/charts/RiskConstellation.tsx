import React, { useState } from 'react';
import { Finding } from '../../types';
import { Network, Table, Info } from 'lucide-react';

interface RiskConstellationProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

export const RiskConstellation: React.FC<RiskConstellationProps> = ({
  findings,
  onSelectFinding,
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');
  const [hoveredNode, setHoveredNode] = useState<Finding | null>(null);

  // OWASP color families
  const getOwaspColor = (cat: string) => {
    if (cat.includes('A05')) return '#00F2FE'; // Injection (Cyan)
    if (cat.includes('A01')) return '#F97316'; // Broken Access Control (Orange)
    if (cat.includes('A07')) return '#EF4444'; // Auth Failures (Red)
    if (cat.includes('A03')) return '#F59E0B'; // Supply Chain (Amber)
    if (cat.includes('A02')) return '#8B5CF6'; // Cryptographic (Violet)
    return '#3B82F6';
  };

  const getNodeRadius = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 14;
      case 'high':
        return 11;
      case 'medium':
        return 8;
      default:
        return 6;
    }
  };

  // SVG coordinate distribution algorithm
  const centerX = 300;
  const centerY = 180;
  const nodes = findings.map((f, idx) => {
    const angle = (idx / Math.max(1, findings.length)) * 2 * Math.PI;
    const distance = 90 + (idx % 3) * 35;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    return {
      x,
      y,
      finding: f,
      color: getOwaspColor(f.owasp_category),
      radius: getNodeRadius(f.severity),
      opacity: Math.max(0.4, f.confidence),
    };
  });

  return (
    <div className="glass-panel rounded-xl p-5 border border-obsidian-700">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-electric" /> Risk Constellation Orbital Graph
          </h3>
          <p className="text-xs text-slate-400">
            Node size represents severity; filaments link shared file domains and OWASP clusters.
          </p>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'graph' ? 'table' : 'graph')}
          className="flex items-center gap-1 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700 px-2 py-1 rounded text-xs font-mono transition-colors"
        >
          {viewMode === 'graph' ? (
            <>
              <Table className="w-3.5 h-3.5 text-cyan-electric" /> <span>List View</span>
            </>
          ) : (
            <>
              <Network className="w-3.5 h-3.5 text-cyan-electric" /> <span>Graph View</span>
            </>
          )}
        </button>
      </div>

      {viewMode === 'graph' ? (
        <div className="relative w-full overflow-hidden flex justify-center items-center bg-obsidian-950/70 rounded-lg border border-obsidian-800">
          <svg viewBox="0 0 600 360" className="w-full max-w-2xl h-80">
            {/* Center PR Gravity Core */}
            <circle cx={centerX} cy={centerY} r="28" fill="#101622" stroke="#00F2FE" strokeWidth="2" opacity="0.8" />
            <circle cx={centerX} cy={centerY} r="55" fill="none" stroke="#212d45" strokeDasharray="4 4" />
            <circle cx={centerX} cy={centerY} r="115" fill="none" stroke="#161e2e" strokeDasharray="3 3" />
            <text x={centerX} y={centerY + 4} textAnchor="middle" fill="#00F2FE" fontSize="10" fontFamily="monospace" fontWeight="bold">
              PR #42
            </text>

            {/* Connecting Filaments */}
            {nodes.map((node, i) => (
              <g key={`filament-${i}`}>
                {/* Connection to core */}
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={node.x}
                  y2={node.y}
                  stroke={node.color}
                  strokeWidth="0.8"
                  opacity="0.25"
                />
                {/* Cluster connections to neighbors */}
                {nodes.slice(i + 1).map((other, j) => {
                  const sameFile = node.finding.file_path === other.finding.file_path;
                  const sameCat = node.finding.owasp_category === other.finding.owasp_category;
                  if (sameFile || sameCat) {
                    return (
                      <line
                        key={`link-${i}-${j}`}
                        x1={node.x}
                        y1={node.y}
                        x2={other.x}
                        y2={other.y}
                        stroke={node.color}
                        strokeWidth={sameFile ? "1.5" : "0.7"}
                        strokeDasharray={sameFile ? undefined : "2 2"}
                        opacity={sameFile ? "0.45" : "0.2"}
                      />
                    );
                  }
                  return null;
                })}
              </g>
            ))}

            {/* Finding Orbital Nodes */}
            {nodes.map((node, i) => (
              <g
                key={`node-${i}`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => onSelectFinding(node.finding)}
                onMouseEnter={() => setHoveredNode(node.finding)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius + 3}
                  fill={node.color}
                  opacity="0.15"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill={node.color}
                  opacity={node.opacity}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              </g>
            ))}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredNode && (
            <div className="absolute bottom-3 left-3 bg-obsidian-950/95 border border-cyan-electric/40 p-2.5 rounded-lg text-xs font-mono shadow-2xl max-w-sm pointer-events-none">
              <div className="font-bold text-slate-100 truncate">{hoveredNode.title}</div>
              <div className="text-cyan-electric text-[11px]">{hoveredNode.owasp_category} • {hoveredNode.cwe}</div>
              <div className="text-slate-400 text-[10px] truncate">{hoveredNode.file_path}:{hoveredNode.line_start}</div>
            </div>
          )}
        </div>
      ) : (
        /* Accessible List Alternative */
        <div className="space-y-2 font-mono text-xs max-h-72 overflow-y-auto">
          {findings.map((f) => (
            <div
              key={f.id}
              onClick={() => onSelectFinding(f)}
              className="p-2.5 rounded bg-obsidian-900 border border-obsidian-800 hover:border-cyan-electric/40 cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-200">{f.title}</span>
                <span className="text-slate-500 text-[10px] block">{f.file_path}</span>
              </div>
              <span className="text-cyan-electric text-[11px]">{f.owasp_category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
