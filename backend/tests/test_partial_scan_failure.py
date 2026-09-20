import pytest
from app.services.custom_rules_service import CustomRulesService
from app.services.dependency_service import DependencyService
from app.services.deduplication_service import FindingDeduplicationService

def test_partial_scanner_resilience():
    """If Semgrep fails or is unavailable, custom rules and dependency scanner still yield findings."""
    custom_svc = CustomRulesService()
    findings = custom_svc.scan_file("test.py", "eval('1+1')")
    assert len(findings) == 1
    
    dep_findings = DependencyService.inspect_dependencies({"requirements.txt": "fastapi*"})
    assert len(dep_findings) >= 1
    
    merged = FindingDeduplicationService.deduplicate(findings + dep_findings)
    assert len(merged) == len(findings) + len(dep_findings)
