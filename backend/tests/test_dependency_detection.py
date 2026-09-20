from app.services.dependency_service import DependencyService

def test_detect_missing_lockfile_and_unpinned_deps():
    files = {
        "requirements.txt": "fastapi\nuvicorn>=0.20.0\nrequests*",
    }
    findings = DependencyService.inspect_dependencies(files)
    assert len(findings) >= 2
    rule_ids = {f["rule_id"] for f in findings}
    assert "CG-DEP-001" in rule_ids  # Missing lockfile
    assert "CG-DEP-003" in rule_ids  # Unpinned dependency
    assert all(f["owasp_category"] == "A03:2025" for f in findings)
