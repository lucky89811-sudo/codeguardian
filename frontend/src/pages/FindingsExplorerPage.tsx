import React, { useState } from 'react';
import { Finding } from '../types';
import { FindingCard } from '../components/findings/FindingCard';
import { FindingTable } from '../components/findings/FindingTable';
import { Search, Filter, Table, Layers, AlertOctagon } from 'lucide-react';

interface FindingsExplorerPageProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

export const FindingsExplorerPage: React.FC<FindingsExplorerPageProps> = ({
  findings,
  onSelectFinding,
}) => {
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState('all');
  const [owaspFilter, setOwaspFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isTableView, setIsTableView] = useState(false);

  const filtered = findings.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.file_path.toLowerCase().includes(search.toLowerCase()) ||
      f.cwe.toLowerCase().includes(search.toLowerCase()) ||
      f.rule_id.toLowerCase().includes(search.toLowerCase());

    const matchesSev = sevFilter === 'all' || f.severity === sevFilter;
    const matchesOwasp = owaspFilter === 'all' || f.owasp_category.includes(owaspFilter);
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;

    return matchesSearch && matchesSev && matchesOwasp && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-threat-critical" /> Findings Explorer
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Search, filter, and inspect normalized security findings detected across the pull request.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-obsidian-700 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, rule, CWE, file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-electric"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap font-mono text-xs">
          <select
            value={sevFilter}
            onChange={(e) => setSevFilter(e.target.value)}
            className="bg-obsidian-950 border border-obsidian-700 text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-electric"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={owaspFilter}
            onChange={(e) => setOwaspFilter(e.target.value)}
            className="bg-obsidian-950 border border-obsidian-700 text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-electric"
          >
            <option value="all">All OWASP 2025</option>
            <option value="A05">A05: Injection</option>
            <option value="A01">A01: Broken Access</option>
            <option value="A07">A07: Auth Failures</option>
            <option value="A03">A03: Supply Chain</option>
            <option value="A02">A02: Cryptography</option>
            <option value="A06">A06: Misconfig</option>
          </select>

          <button
            onClick={() => setIsTableView(!isTableView)}
            className="p-1.5 rounded bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700 ml-auto"
            title="Toggle View Mode"
          >
            {isTableView ? <Layers className="w-4 h-4 text-cyan-electric" /> : <Table className="w-4 h-4 text-cyan-electric" />}
          </button>
        </div>
      </div>

      <div className="text-xs font-mono text-slate-400">
        Displaying {filtered.length} of {findings.length} findings
      </div>

      {isTableView ? (
        <FindingTable findings={filtered} onSelectFinding={onSelectFinding} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((f) => (
            <FindingCard key={f.id} finding={f} onSelect={onSelectFinding} />
          ))}
        </div>
      )}
    </div>
  );
};
