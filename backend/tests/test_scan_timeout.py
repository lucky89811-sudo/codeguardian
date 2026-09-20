import subprocess
from unittest.mock import patch
from app.services.semgrep_service import SemgrepService

def test_semgrep_timeout_graceful_handling():
    with patch("subprocess.run", side_effect=subprocess.TimeoutExpired(cmd="semgrep", timeout=1)):
        with patch.object(SemgrepService, "is_available", return_value=True):
            # Must return empty list rather than crashing
            results = SemgrepService.scan_directory(".")
            assert results == []
