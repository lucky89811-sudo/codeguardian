import React from 'react';
import { Finding, FindingStatus } from '../types';
import { FindingInspector } from '../components/findings/FindingInspector';
import { ArrowLeft } from 'lucide-react';

interface FindingDetailPageProps {
  finding: Finding | null;
  onBack: () => void;
  onStatusChange: (findingId: string, status: FindingStatus) => void;
  onExplainRetry: (findingId: string) => void;
}

export const FindingDetailPage: React.FC<FindingDetailPageProps> = ({
  finding,
  onBack,
  onStatusChange,
  onExplainRetry,
}) => {
  if (!finding) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-sm font-mono text-slate-400">Finding not found.</p>
        <button
          onClick={onBack}
          className="text-xs font-mono text-cyan-electric hover:underline"
        >
          ← Return to Console
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-electric transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Findings</span>
      </button>

      <div className="h-[800px]">
        <FindingInspector
          finding={finding}
          onClose={onBack}
          onStatusChange={onStatusChange}
          onExplainRetry={onExplainRetry}
        />
      </div>
    </div>
  );
};
