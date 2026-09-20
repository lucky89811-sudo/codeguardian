import React from 'react';
import { Scan } from '../types';
import { FileText, Download, Printer, Shield, AlertTriangle } from 'lucide-react';

interface ReportsPageProps {
  scan: Scan | null;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ scan }) => {
  if (!scan) {
    return (
      <div className="py-16 text-center text-xs font-mono text-slate-500">
        No active scan report available. Run a scan or load demo mode.
      </div>
    );
  }

  const reportUrl = `/api/reports/${scan.id}`;
  const downloadUrl = `/api/reports/${scan.id}/download`;

  const handlePrint = () => {
    const printWindow = window.open(reportUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-electric" /> Pull Request Security Audit Report
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Executive summary and standalone exportable compliance document.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-200 border border-obsidian-700 text-xs font-mono transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print / Save PDF</span>
          </button>
          <a
            href={downloadUrl}
            download
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-electric text-obsidian-950 font-mono font-bold text-xs shadow-cyan-glow hover:bg-cyan-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download HTML Report</span>
          </a>
        </div>
      </div>

      {/* Mandatory Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong>Mandatory Notice:</strong> This report is an automated aid and does not constitute a complete security audit. Human verification and penetration testing remain required before production deployment.
        </div>
      </div>

      {/* Embedded Live Report Frame */}
      <div className="glass-panel rounded-xl border border-obsidian-700 overflow-hidden shadow-2xl">
        <iframe
          src={reportUrl}
          title="Security Report Preview"
          className="w-full h-[700px] border-none bg-obsidian-950"
        />
      </div>
    </div>
  );
};
