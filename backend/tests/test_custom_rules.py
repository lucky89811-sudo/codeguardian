import os
from app.services.custom_rules_service import CustomRulesService

def test_detect_vulnerabilities_in_sample_python():
    svc = CustomRulesService()
    sample_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "sample-repositories", "vulnerable-python", "app.py"
    )
    with open(sample_path, "r", encoding="utf-8") as f:
        code = f.read()

    findings = svc.scan_file("backend/app.py", code)
    assert len(findings) >= 8

    rule_ids = {f["rule_id"] for f in findings}
    assert "CG-SEC-001" in rule_ids  # Hardcoded API key
    assert "CG-SEC-002" in rule_ids  # Hardcoded password
    assert "CG-SEC-004" in rule_ids  # eval()
    assert "CG-SEC-005" in rule_ids  # shell=True
    assert "CG-SEC-006" in rule_ids  # SQL injection
    assert "CG-SEC-008" in rule_ids  # Path traversal
    assert "CG-SEC-009" in rule_ids  # Insecure CORS
    assert "CG-SEC-010" in rule_ids  # Debug mode
    assert "CG-SEC-013" in rule_ids  # Weak MD5 hash
    assert "CG-SEC-015" in rule_ids  # Disabled TLS verify

def test_secure_example_zero_critical_findings():
    svc = CustomRulesService()
    sample_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "sample-repositories", "secure-examples", "safe_app.py"
    )
    with open(sample_path, "r", encoding="utf-8") as f:
        code = f.read()

    findings = svc.scan_file("backend/safe_app.py", code)
    # Safe code should have zero critical / high findings
    critical_or_high = [f for f in findings if f["severity"] in ["critical", "high"]]
    assert len(critical_or_high) == 0
