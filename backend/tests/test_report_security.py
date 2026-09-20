from datetime import datetime, timezone
from app.services.report_service import ReportService

class DummyScan:
    started_at = datetime.now(timezone.utc)
    overall_score = 85.0
    critical_count = 2
    high_count = 3
    medium_count = 1
    low_count = 0
    info_count = 0
    files_analyzed = 5
    scanner_version = "CodeGuardian-v1.0"
    owasp_version = "2025"
    status = "completed"
    total_findings = 6

def test_report_contains_mandatory_disclaimer_and_html_escaping():
    scan = DummyScan()
    pr_info = {
        "repo_name": "test-repo<script>alert(1)</script>",
        "repo_owner": "test-owner",
        "number": 99,
        "title": "Fix <img src=x onerror=alert(1)>",
    }
    
    html = ReportService.generate_html_report(scan, [], pr_info)
    
    # 1. Mandatory audit disclaimer must be present
    assert "This report is an automated aid and does not constitute a complete security audit." in html
    
    # 2. XSS payload must be escaped
    assert "<script>alert(1)</script>" not in html
    assert "&lt;script&gt;alert(1)&lt;/script&gt;" in html
