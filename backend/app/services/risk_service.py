from typing import List, Dict, Any

SEVERITY_WEIGHTS = {
    "critical": 1.00,
    "high": 0.80,
    "medium": 0.55,
    "low": 0.30,
    "info": 0.10,
}

class RiskService:
    @staticmethod
    def calculate_exposure(file_path: str) -> float:
        """Determines exposure weight based on file path and context."""
        path_lower = file_path.lower()
        if any(term in path_lower for term in ["test", "spec", "mock", "fixture", "doc", "docs", "readme"]):
            return 0.20
        if any(term in path_lower for term in ["util", "helper", "tool", "script"]):
            return 0.50
        if any(term in path_lower for term in ["route", "controller", "api", "auth", "login", "endpoint", "views", "server"]):
            return 1.00
        # Default backend business logic
        return 0.80

    @classmethod
    def calculate_finding_risk(
        cls,
        severity: str,
        confidence: float,
        exploitability: float,
        exposure: float,
    ) -> float:
        """
        Calculates transparent risk score (0-100) using the canonical formula:
        risk_score = (severity_score * 0.40 + confidence * 0.25 + exploitability * 0.20 + exposure * 0.15) * 100
        """
        sev_score = SEVERITY_WEIGHTS.get(severity.lower(), 0.55)
        raw_score = (
            sev_score * 0.40
            + max(0.0, min(1.0, confidence)) * 0.25
            + max(0.0, min(1.0, exploitability)) * 0.20
            + max(0.0, min(1.0, exposure)) * 0.15
        ) * 100
        return round(min(100.0, max(0.0, raw_score)), 1)

    @staticmethod
    def get_risk_tier(score: float) -> str:
        """Maps score to human-readable tier."""
        if score >= 85.0:
            return "Critical"
        if score >= 70.0:
            return "High"
        if score >= 40.0:
            return "Moderate"
        if score >= 20.0:
            return "Low"
        return "Informational"

    @classmethod
    def calculate_overall_scan_score(cls, findings: List[Any]) -> float:
        """
        Calculates composite overall scan risk score (0-100) factoring severity density
        and top individual finding risks.
        """
        if not findings:
            return 0.0

        scores = [f.risk_score for f in findings]
        max_score = max(scores)
        avg_score = sum(scores) / len(scores)

        # Weight highest individual risk heavily, augmented by volume
        critical_count = sum(1 for f in findings if f.severity == "critical")
        high_count = sum(1 for f in findings if f.severity == "high")

        volume_penalty = min(20.0, (critical_count * 5.0) + (high_count * 2.5))
        composite = (max_score * 0.65) + (avg_score * 0.20) + volume_penalty
        return round(min(100.0, max(0.0, composite)), 1)
