import {
  HealthCheckResponse,
  Scan,
  ScanProgress,
  Finding,
  FileHotspot,
  ScanTimelineItem,
  ScanAnalytics,
} from '../types';

const rawApiUrl = (import.meta as any)?.env?.VITE_API_URL;
const API_BASE = rawApiUrl ? `${rawApiUrl.replace(/\/+$/, '')}/api` : '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) {
        errMsg = errJson.error.message;
      } else if (errJson?.detail) {
        errMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new ApiError(res.status, errMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async getHealth(): Promise<HealthCheckResponse> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<HealthCheckResponse>(res);
  },

  async loadDemo(): Promise<{ scan_id: string; mode: string; findings_count: number; overall_score: number }> {
    const res = await fetch(`${API_BASE}/demo/load`, { method: 'POST' });
    return handleResponse(res);
  },

  async listScans(): Promise<Scan[]> {
    const res = await fetch(`${API_BASE}/scans`);
    return handleResponse<Scan[]>(res);
  },

  async getScan(scanId: string): Promise<Scan> {
    const res = await fetch(`${API_BASE}/scans/${scanId}`);
    return handleResponse<Scan>(res);
  },

  async getScanProgress(scanId: string): Promise<ScanProgress> {
    const res = await fetch(`${API_BASE}/scans/${scanId}/progress`);
    return handleResponse<ScanProgress>(res);
  },

  async getScanFindings(
    scanId: string,
    filters?: { severity?: string; owasp?: string; status?: string }
  ): Promise<Finding[]> {
    const params = new URLSearchParams();
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.owasp) params.append('owasp', filters.owasp);
    if (filters?.status) params.append('status', filters.status);
    const res = await fetch(`${API_BASE}/scans/${scanId}/findings?${params.toString()}`);
    return handleResponse<Finding[]>(res);
  },

  async getScanFiles(scanId: string): Promise<FileHotspot[]> {
    const res = await fetch(`${API_BASE}/scans/${scanId}/files`);
    return handleResponse<FileHotspot[]>(res);
  },

  async getScanTimeline(scanId: string): Promise<ScanTimelineItem[]> {
    const res = await fetch(`${API_BASE}/scans/${scanId}/timeline`);
    return handleResponse<ScanTimelineItem[]>(res);
  },

  async getScanAnalytics(scanId: string): Promise<ScanAnalytics> {
    const res = await fetch(`${API_BASE}/scans/${scanId}/analytics`);
    return handleResponse<ScanAnalytics>(res);
  },

  async updateFindingStatus(
    findingId: string,
    status: 'open' | 'reviewed' | 'false_positive' | 'resolved',
    note?: string
  ): Promise<Finding> {
    const res = await fetch(`${API_BASE}/findings/${findingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    return handleResponse<Finding>(res);
  },

  async explainFinding(findingId: string): Promise<Finding> {
    const res = await fetch(`${API_BASE}/findings/${findingId}/explain`, {
      method: 'POST',
    });
    return handleResponse<Finding>(res);
  },

  async parseGitHubUrl(url: string): Promise<{ is_valid: boolean; url_type: string; owner?: string; repo?: string; pull_number?: number; error?: string }> {
    const res = await fetch(`${API_BASE}/github/parse-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return handleResponse(res);
  },

  async createScan(pullRequestUrl: string): Promise<ScanProgress> {
    const res = await fetch(`${API_BASE}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pull_request_url: pullRequestUrl }),
    });
    return handleResponse<ScanProgress>(res);
  },
};
