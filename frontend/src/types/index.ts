export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type FindingStatus = 'open' | 'reviewed' | 'false_positive' | 'resolved';

export interface AIExplanation {
  id: string;
  finding_id: string;
  model_name: string;
  prompt_version: string;
  summary: string;
  impact: string;
  why_flagged: string;
  recommended_fix: string;
  patched_code: string;
  attack_scenario: string;
  confidence: number;
  needs_human_review: boolean;
  limitations: string[];
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  attempt_count: number;
  provider_status: string;
  created_at: string;
}

export interface Finding {
  id: string;
  scan_id: string;
  rule_id: string;
  title: string;
  description: string;
  pattern_label: string; // "Confirmed pattern", "Possible vulnerability", "Needs human review"
  severity: SeverityLevel;
  confidence: number;
  exploitability: number;
  impact: number;
  exposure: number;
  risk_score: number;
  file_path: string;
  line_start: number;
  line_end: number;
  column_start?: number;
  column_end?: number;
  code_snippet: string;
  source: string;
  cwe: string;
  owasp_category: string;
  status: FindingStatus;
  ai_explanation_status: 'pending' | 'complete' | 'failed' | 'none';
  created_at: string;
  ai_explanation?: AIExplanation | null;
}

export interface PullRequestInfo {
  id: string;
  number: number;
  title: string;
  author: string;
  source_branch: string;
  target_branch: string;
  additions: number;
  deletions: number;
  changed_files: number;
  github_url: string;
  repo_name: string;
  repo_owner: string;
}

export interface Scan {
  id: string;
  pull_request_id: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  overall_score: number;
  total_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  files_analyzed: number;
  duration_ms: number;
  scanner_version: string;
  owasp_version: string;
  is_demo: number;
  started_at: string;
  completed_at?: string | null;
  error_message?: string | null;
  pull_request?: PullRequestInfo | null;
  findings?: Finding[];
}

export interface ScanProgress {
  scan_id: string;
  status: string;
  current_stage: string;
  progress_percent: number;
  error_message?: string | null;
}

export interface ScanTimelineItem {
  id: string;
  stage: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
}

export interface FileHotspot {
  file_path: string;
  findings_count: number;
  highest_severity: SeverityLevel;
  risk_score: number;
  lines_changed: number;
}

export interface ScanAnalytics {
  scan_id: string;
  overall_score: number;
  total_findings: number;
  severity_breakdown: Record<string, number>;
  owasp_breakdown: Record<string, number>;
  source_breakdown: Record<string, number>;
  file_hotspots: FileHotspot[];
  avg_exploitability: number;
  avg_impact: number;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  owasp_standard: string;
  capabilities: {
    semgrep_installed: boolean;
    gemini_configured: boolean;
    github_token_configured: boolean;
    custom_rules_count: number;
    demo_mode_ready: boolean;
  };
}
