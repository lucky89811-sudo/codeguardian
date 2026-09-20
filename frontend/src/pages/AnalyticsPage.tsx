import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ScanAnalytics } from '../types';
import { BarChart3, PieChart as PieIcon, ShieldAlert, Cpu } from 'lucide-react';

interface AnalyticsPageProps {
  analytics: ScanAnalytics | null;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="py-16 text-center text-xs font-mono text-slate-500">
        Loading analytics telemetry...
      </div>
    );
  }

  // OWASP Category Chart Data
  const owaspData = Object.entries(analytics.owasp_breakdown || {}).map(([cat, count]) => ({
    name: cat,
    count,
  }));

  // Severity Pie Data
  const sevData = [
    { name: 'Critical', value: analytics.severity_breakdown.critical || 0, color: '#EF4444' },
    { name: 'High', value: analytics.severity_breakdown.high || 0, color: '#F97316' },
    { name: 'Medium', value: analytics.severity_breakdown.medium || 0, color: '#F59E0B' },
    { name: 'Low', value: analytics.severity_breakdown.low || 0, color: '#10B981' },
  ].filter((d) => d.value > 0);

  // Source Breakdown Data
  const sourceData = Object.entries(analytics.source_breakdown || {}).map(([src, count]) => ({
    name: src,
    count,
  }));

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-electric" /> Security Analytics & Risk Distribution
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Aggregate posture metrics, OWASP Top 10:2025 categorizations, and scanner coverage.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-obsidian-700">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Composite Risk</span>
          <div className="text-2xl font-bold font-mono text-threat-critical mt-1">
            {analytics.overall_score.toFixed(1)} / 100
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-obsidian-700">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Total Findings</span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            {analytics.total_findings}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-obsidian-700">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Avg Exploitability</span>
          <div className="text-2xl font-bold font-mono text-cyan-electric mt-1">
            {(analytics.avg_exploitability * 100).toFixed(0)}%
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-obsidian-700">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Avg Threat Impact</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {(analytics.avg_impact * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OWASP 2025 Breakdown */}
        <div className="glass-panel p-5 rounded-xl border border-obsidian-700 space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            OWASP Top 10:2025 Category Frequency
          </h3>
          <div className="h-64 font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={owaspData}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070a0f', borderColor: '#212d45', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#00F2FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown Donut */}
        <div className="glass-panel p-5 rounded-xl border border-obsidian-700 space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Severity Proportions
          </h3>
          <div className="h-64 font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sevData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sevData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#070a0f', borderColor: '#212d45', color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
