# CodeGuardian — REST API Reference

The CodeGuardian backend provides a RESTful interface mounted at `/api`. Interactive OpenAPI documentation is available locally at `http://localhost:8000/docs`.

---

## 1. System Health & Diagnostics

### `GET /api/health`
Returns system status, version, OWASP standard alignment, and scanner capability flags.

**Response:**
```json
{
  "status": "healthy",
  "service": "CodeGuardian",
  "version": "1.0.0",
  "owasp_standard": "2025",
  "capabilities": {
    "semgrep_installed": true,
    "gemini_configured": true,
    "github_token_configured": false,
    "custom_rules_count": 15,
    "demo_mode_ready": true
  }
}
```

---

## 2. Demo Engine

### `POST /api/demo/load`
Ingests bundled static sample repository, PR #42, and 11 realistic findings. Operates 100% offline without external credentials.

---

## 3. Scans & Progress Polling

### `POST /api/scans`
Initiates an asynchronous security scan.
**Request Payload:**
```json
{
  "pull_request_url": "https://github.com/owner/repo/pull/123"
}
```

### `GET /api/scans/{scan_id}`
Returns complete scan record, risk score, severity counts, and PR metadata.

### `GET /api/scans/{scan_id}/progress`
Pollable endpoint tracking stage execution and completion percentage:
- Stages: `queued` &bull; `fetching_files` &bull; `running_semgrep` &bull; `running_custom_rules` &bull; `normalizing_findings` &bull; `generating_ai_explanations` &bull; `completed` &bull; `failed`

### `GET /api/scans/{scan_id}/findings`
Returns list of normalized findings. Supports query filters: `?severity=critical&owasp=A05&status=open`.

### `GET /api/scans/{scan_id}/files`
Aggregated hotspot metrics per file (findings count, highest severity, file risk score).

### `GET /api/scans/{scan_id}/timeline`
Chronological audit journey events from PR ingestion to review completion.

### `GET /api/scans/{scan_id}/analytics`
OWASP 2025 distribution, severity breakdowns, and average exploitability/impact metrics.

---

## 4. Findings & Review Actions

### `GET /api/findings/{finding_id}`
Retrieves a single finding with attached `AIExplanation` and audit actions.

### `PATCH /api/findings/{finding_id}/status`
Updates finding review status (`open`, `reviewed`, `false_positive`, `resolved`) and writes an audit log action.

### `POST /api/findings/{finding_id}/explain`
Triggers or retries Google Gemini structured explanation synthesis.

---

## 5. Security Reports

### `GET /api/reports/{scan_id}`
Returns responsive, printable HTML report.

### `GET /api/reports/{scan_id}/download`
Serves HTML report as a downloadable attachment with the mandatory human audit disclaimer.
