from app.services.deduplication_service import FindingDeduplicationService

def test_deduplicate_overlapping_findings():
    f1 = {
        "rule_id": "semgrep-sql-injection",
        "title": "SQL Injection",
        "file_path": "app/db.py",
        "line_start": 42,
        "cwe": "CWE-89",
        "source": "semgrep",
        "confidence": 0.85,
        "risk_score": 80.0,
        "code_snippet": "cursor.execute(f'SELECT...')"
    }
    f2 = {
        "rule_id": "CG-SEC-006",
        "title": "Dynamic SQL Query",
        "file_path": "app/db.py",
        "line_start": 42,
        "cwe": "CWE-89",
        "source": "custom_rule",
        "confidence": 0.95,
        "risk_score": 92.0,
        "code_snippet": "cursor.execute(f'SELECT...')"
    }

    deduped = FindingDeduplicationService.deduplicate([f1, f2])
    assert len(deduped) == 1
    item = deduped[0]
    # Sources merged
    assert "custom_rule" in item["source"]
    assert "semgrep" in item["source"]
    # Retained higher confidence and risk score
    assert item["confidence"] == 0.95
    assert item["risk_score"] == 92.0
