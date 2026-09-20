import html
from typing import Dict, Any, List
from datetime import datetime

class ReportService:
    @staticmethod
    def generate_html_report(scan: Any, findings: List[Any], pr_info: Dict[str, Any]) -> str:
        """
        Renders a self-contained, responsive, printable HTML security report
        with deterministic findings, AI explanations, OWASP 2025 mappings, and mandatory disclaimer.
        """
        timestamp_str = scan.started_at.strftime("%Y-%m-%d %H:%M:%S UTC") if scan.started_at else datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Build severity badges
        sev_counts = {
            "critical": scan.critical_count,
            "high": scan.high_count,
            "medium": scan.medium_count,
            "low": scan.low_count,
            "info": scan.info_count
        }

        # Build findings rows
        findings_html = ""
        for idx, f in enumerate(findings, start=1):
            expl = getattr(f, "ai_explanation", None)
            expl_html = ""
            if expl:
                expl_html = f"""
                <div class="ai-box">
                    <div class="ai-badge">🤖 AI Explanation ({html.escape(expl.model_name)})</div>
                    <p><strong>Summary:</strong> {html.escape(expl.summary)}</p>
                    <p><strong>Impact:</strong> {html.escape(expl.impact)}</p>
                    <p><strong>Attack Scenario:</strong> {html.escape(expl.attack_scenario)}</p>
                    <p><strong>Recommended Fix:</strong> {html.escape(expl.recommended_fix)}</p>
                    <pre class="code-patch"><code>{html.escape(expl.patched_code)}</code></pre>
                </div>
                """
            
            sev_class = f"sev-{f.severity.lower()}"
            findings_html += f"""
            <div class="finding-card {sev_class}">
                <div class="finding-header">
                    <span class="finding-num">#{idx}</span>
                    <span class="badge {sev_class}">{html.escape(f.severity.upper())}</span>
                    <span class="badge source-badge">{html.escape(f.source)}</span>
                    <span class="badge cat-badge">{html.escape(f.owasp_category)}</span>
                    <span class="badge cwe-badge">{html.escape(f.cwe)}</span>
                    <span class="risk-pill">Risk: {f.risk_score}/100</span>
                </div>
                <h3 class="finding-title">{html.escape(f.title)}</h3>
                <p class="file-loc"><strong>Location:</strong> <code>{html.escape(f.file_path)}:{f.line_start}</code></p>
                <p class="finding-desc">{html.escape(f.description)}</p>
                <div class="code-block">
                    <div class="code-label">Flagged Snippet:</div>
                    <pre><code>{html.escape(f.code_snippet)}</code></pre>
                </div>
                {expl_html}
            </div>
            """

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeGuardian Security Report - {html.escape(pr_info.get("repo_name", "Repo"))} PR #{pr_info.get("number", 0)}</title>
    <style>
        :root {{
            --bg-color: #0d1117;
            --card-bg: #161b22;
            --text-color: #c9d1d9;
            --text-muted: #8b949e;
            --border-color: #30363d;
            --accent-cyan: #58a6ff;
            --critical: #f85149;
            --high: #ff7b72;
            --medium: #d29922;
            --low: #3fb950;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 2rem;
            line-height: 1.6;
        }}
        .container {{
            max-width: 1000px;
            margin: 0 auto;
        }}
        .header {{
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 1.5rem;
            margin-bottom: 2rem;
        }}
        .brand {{
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--accent-cyan);
            letter-spacing: -0.5px;
        }}
        .disclaimer-banner {{
            background: rgba(210, 153, 34, 0.15);
            border-left: 4px solid var(--medium);
            padding: 1rem 1.5rem;
            border-radius: 4px;
            margin-bottom: 2rem;
            font-weight: 500;
        }}
        .meta-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }}
        .meta-card {{
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 1rem;
        }}
        .meta-card .label {{
            font-size: 0.8rem;
            color: var(--text-muted);
            text-transform: uppercase;
        }}
        .meta-card .val {{
            font-size: 1.4rem;
            font-weight: 700;
            margin-top: 0.2rem;
        }}
        .score-critical {{ color: var(--critical); }}
        .score-high {{ color: var(--high); }}
        .score-medium {{ color: var(--medium); }}
        .score-low {{ color: var(--low); }}
        
        .finding-card {{
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            page-break-inside: avoid;
        }}
        .finding-card.sev-critical {{ border-left: 5px solid var(--critical); }}
        .finding-card.sev-high {{ border-left: 5px solid var(--high); }}
        .finding-card.sev-medium {{ border-left: 5px solid var(--medium); }}
        .finding-card.sev-low {{ border-left: 5px solid var(--low); }}

        .finding-header {{
            display: flex;
            align-items: center;
            gap: 0.6rem;
            flex-wrap: wrap;
            margin-bottom: 0.8rem;
        }}
        .badge {{
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            text-transform: uppercase;
        }}
        .badge.sev-critical {{ background: rgba(248, 81, 73, 0.2); color: var(--critical); }}
        .badge.sev-high {{ background: rgba(255, 123, 114, 0.2); color: var(--high); }}
        .badge.sev-medium {{ background: rgba(210, 153, 34, 0.2); color: var(--medium); }}
        .badge.sev-low {{ background: rgba(63, 185, 80, 0.2); color: var(--low); }}
        .source-badge {{ background: #21262d; color: var(--text-color); }}
        .cat-badge {{ background: #388bfd26; color: #58a6ff; }}
        .cwe-badge {{ background: #8957e526; color: #bc8cff; }}
        .risk-pill {{ margin-left: auto; font-weight: bold; color: var(--text-muted); font-size: 0.85rem; }}

        .code-block {{
            background: #090d13;
            border: 1px solid #21262d;
            border-radius: 4px;
            padding: 0.8rem;
            margin: 1rem 0;
            overflow-x: auto;
        }}
        pre {{ margin: 0; font-family: monospace; font-size: 0.85rem; }}
        .ai-box {{
            background: #1c182b;
            border: 1px solid #8957e550;
            border-radius: 6px;
            padding: 1.2rem;
            margin-top: 1rem;
        }}
        .ai-badge {{
            color: #d2a8ff;
            font-weight: bold;
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
        }}
        .code-patch {{
            background: #090d13;
            padding: 0.8rem;
            border-radius: 4px;
            border-left: 3px solid #3fb950;
        }}
        @media print {{
            body {{ background: #fff; color: #111; }}
            .meta-card, .finding-card, .ai-box, .code-block {{ background: #fff; border-color: #ccc; color: #111; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="brand">🛡️ CodeGuardian Security Review</div>
            <h2>Security Evaluation for Pull Request #{pr_info.get("number", "N/A")}</h2>
            <p><strong>Repository:</strong> {html.escape(pr_info.get("repo_owner", ""))}/{html.escape(pr_info.get("repo_name", ""))} &nbsp;|&nbsp; 
               <strong>Title:</strong> {html.escape(pr_info.get("title", "Pull Request"))} &nbsp;|&nbsp; 
               <strong>Scan Date:</strong> {timestamp_str}</p>
        </div>

        <div class="disclaimer-banner">
            ⚠️ <strong>Notice:</strong> This report is an automated aid and does not constitute a complete security audit. Human review is required before merging or deploying changes.
        </div>

        <div class="meta-grid">
            <div class="meta-card">
                <div class="label">Overall Risk Score</div>
                <div class="val score-{scan.status}">{scan.overall_score} / 100</div>
            </div>
            <div class="meta-card">
                <div class="label">Total Findings</div>
                <div class="val">{scan.total_findings}</div>
            </div>
            <div class="meta-card">
                <div class="label">Critical / High</div>
                <div class="val score-critical">{scan.critical_count} / {scan.high_count}</div>
            </div>
            <div class="meta-card">
                <div class="label">Files Analyzed</div>
                <div class="val">{scan.files_analyzed}</div>
            </div>
            <div class="meta-card">
                <div class="label">OWASP Standard</div>
                <div class="val">{html.escape(scan.owasp_version or "2025")}</div>
            </div>
        </div>

        <h2>Detailed Security Findings</h2>
        {findings_html if findings else "<p>No security findings identified in analyzed changes.</p>"}

        <div style="margin-top: 3rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            Generated by CodeGuardian Security Engine {html.escape(scan.scanner_version)} | OWASP Top 10:2025 Aligned
        </div>
    </div>
</body>
</html>"""
        return html_content
