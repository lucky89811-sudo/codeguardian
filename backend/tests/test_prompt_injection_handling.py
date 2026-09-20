import os
from app.services.custom_rules_service import CustomRulesService

def test_prompt_injection_does_not_suppress_scanner():
    """Adversarial comments requesting the auditor ignore vulnerabilities must not bypass detection."""
    svc = CustomRulesService()
    sample_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "sample-repositories", "prompt-injection", "malicious_comment.py"
    )
    with open(sample_path, "r", encoding="utf-8") as f:
        code = f.read()

    findings = svc.scan_file("prompt-injection/malicious_comment.py", code)
    # The SQL injection in this file must still be detected
    sql_findings = [f for f in findings if f["rule_id"] == "CG-SEC-006"]
    assert len(sql_findings) > 0
    assert sql_findings[0]["severity"] == "critical"
