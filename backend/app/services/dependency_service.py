import re
import json
from typing import List, Dict, Any
from app.services.risk_service import RiskService

class DependencyService:
    @staticmethod
    def inspect_dependencies(files: Dict[str, str]) -> List[Dict[str, Any]]:
        """
        Scans repository manifest files (requirements.txt, package.json, etc.)
        for software supply chain risks (A03:2025 / CWE-1104 / CWE-1395).
        """
        findings = []
        has_python_manifest = any("requirements" in f or "pyproject.toml" in f for f in files)
        has_python_lock = any("poetry.lock" in f or "Pipfile.lock" in f for f in files)
        has_js_manifest = any("package.json" in f for f in files)
        has_js_lock = any("package-lock.json" in f or "yarn.lock" in f or "pnpm-lock.yaml" in f for f in files)

        # 1. Missing lockfile warning
        if has_python_manifest and not has_python_lock:
            findings.append({
                "rule_id": "CG-DEP-001",
                "title": "Missing Python Lockfile in Repository",
                "description": "Python dependencies specified without a lockfile (poetry.lock / Pipfile.lock / requirements.txt with hashes), increasing exposure to supply-chain tampering.",
                "pattern_label": "Possible vulnerability",
                "severity": "medium",
                "confidence": 0.85,
                "exploitability": 0.60,
                "impact": 0.65,
                "exposure": 0.50,
                "risk_score": RiskService.calculate_finding_risk("medium", 0.85, 0.60, 0.50),
                "file_path": next(f for f in files if "requirements" in f or "pyproject.toml" in f),
                "line_start": 1,
                "line_end": 1,
                "column_start": 1,
                "column_end": 1,
                "code_snippet": "# Missing dependency lockfile",
                "source": "dependency",
                "cwe": "CWE-1104",
                "owasp_category": "A03:2025",
                "status": "open",
                "ai_explanation_status": "pending",
            })

        if has_js_manifest and not has_js_lock:
            findings.append({
                "rule_id": "CG-DEP-002",
                "title": "Missing JavaScript/Node Lockfile in Repository",
                "description": "package.json committed without package-lock.json or yarn.lock. Builds may resolve unexpected upstream patch versions with malicious code.",
                "pattern_label": "Possible vulnerability",
                "severity": "medium",
                "confidence": 0.85,
                "exploitability": 0.60,
                "impact": 0.65,
                "exposure": 0.50,
                "risk_score": RiskService.calculate_finding_risk("medium", 0.85, 0.60, 0.50),
                "file_path": next(f for f in files if "package.json" in f),
                "line_start": 1,
                "line_end": 1,
                "column_start": 1,
                "column_end": 1,
                "code_snippet": '"name": "app" (Missing package-lock.json)',
                "source": "dependency",
                "cwe": "CWE-1104",
                "owasp_category": "A03:2025",
                "status": "open",
                "ai_explanation_status": "pending",
            })

        # 2. Inspect individual requirements.txt lines for wildcard / unpinned dependencies
        for file_path, content in files.items():
            if "requirements" in file_path.lower() and content:
                for line_idx, line in enumerate(content.splitlines(), start=1):
                    line_clean = line.strip()
                    if line_clean and not line_clean.startswith("#"):
                        # Unpinned or wildcard
                        if re.match(r'^[a-zA-Z0-9_\-]+$', line_clean) or ">=" in line_clean or line_clean.endswith("*"):
                            findings.append({
                                "rule_id": "CG-DEP-003",
                                "title": f"Unpinned Dependency in {file_path}",
                                "description": f"Dependency '{line_clean}' lacks exact pinning (==), which may automatically fetch compromised future versions.",
                                "pattern_label": "Needs human review",
                                "severity": "low",
                                "confidence": 0.80,
                                "exploitability": 0.50,
                                "impact": 0.55,
                                "exposure": 0.50,
                                "risk_score": RiskService.calculate_finding_risk("low", 0.80, 0.50, 0.50),
                                "file_path": file_path,
                                "line_start": line_idx,
                                "line_end": line_idx,
                                "column_start": 1,
                                "column_end": len(line_clean),
                                "code_snippet": line_clean,
                                "source": "dependency",
                                "cwe": "CWE-1395",
                                "owasp_category": "A03:2025",
                                "status": "open",
                                "ai_explanation_status": "pending",
                            })

            # 3. Inspect package.json for wildcard versions
            if "package.json" in file_path.lower() and content:
                try:
                    pkg_data = json.loads(content)
                    deps = {**pkg_data.get("dependencies", {}), **pkg_data.get("devDependencies", {})}
                    for dep_name, dep_ver in deps.items():
                        if dep_ver.startswith("*") or dep_ver.startswith(">="):
                            findings.append({
                                "rule_id": "CG-DEP-004",
                                "title": f"Permissive Dependency Version Range for '{dep_name}'",
                                "description": f"Dependency '{dep_name}': '{dep_ver}' uses permissive wildcard range rather than strict semver or locked resolution.",
                                "pattern_label": "Needs human review",
                                "severity": "low",
                                "confidence": 0.80,
                                "exploitability": 0.50,
                                "impact": 0.55,
                                "exposure": 0.50,
                                "risk_score": RiskService.calculate_finding_risk("low", 0.80, 0.50, 0.50),
                                "file_path": file_path,
                                "line_start": 1,
                                "line_end": 1,
                                "column_start": 1,
                                "column_end": len(dep_name),
                                "code_snippet": f'"{dep_name}": "{dep_ver}"',
                                "source": "dependency",
                                "cwe": "CWE-1395",
                                "owasp_category": "A03:2025",
                                "status": "open",
                                "ai_explanation_status": "pending",
                            })
                except Exception:
                    pass

        return findings
