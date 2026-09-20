import json
import os
from typing import Dict, Any, Optional

OWASP_MAPPING_PATH = os.path.join(os.path.dirname(__file__), "..", "rules", "owasp_2025.json")

class NormalizationService:
    _mappings: Optional[Dict[str, Dict[str, str]]] = None

    @classmethod
    def get_mappings(cls) -> Dict[str, Dict[str, str]]:
        if cls._mappings is None:
            try:
                with open(OWASP_MAPPING_PATH, "r", encoding="utf-8") as f:
                    cls._mappings = json.load(f)
            except Exception:
                cls._mappings = {}
        return cls._mappings

    @classmethod
    def resolve_owasp_category(cls, cwe: str, default: str = "A05:2025") -> str:
        mappings = cls.get_mappings()
        cwe_clean = cwe.strip().upper()
        if cwe_clean in mappings:
            return mappings[cwe_clean].get("owasp_category", default)
        
        # Heuristic fallback if direct CWE key not found
        if "89" in cwe_clean or "78" in cwe_clean or "79" in cwe_clean or "INJECTION" in cwe_clean:
            return "A05:2025"
        if "22" in cwe_clean or "ACCESS" in cwe_clean or "AUTHZ" in cwe_clean:
            return "A01:2025"
        if "798" in cwe_clean or "259" in cwe_clean or "AUTH" in cwe_clean or "CRED" in cwe_clean:
            return "A07:2025"
        if "1395" in cwe_clean or "1104" in cwe_clean or "SUPPLY" in cwe_clean:
            return "A03:2025"
        if "327" in cwe_clean or "328" in cwe_clean or "CRYPTO" in cwe_clean or "HASH" in cwe_clean:
            return "A02:2025"
        if "942" in cwe_clean or "16" in cwe_clean or "CORS" in cwe_clean:
            return "A06:2025"
        if "434" in cwe_clean or "UPLOAD" in cwe_clean:
            return "A08:2025"

        return default

    @classmethod
    def normalize_severity(cls, raw_severity: str) -> str:
        s = raw_severity.lower().strip()
        if s in ["critical", "crit", "blocker"]:
            return "critical"
        if s in ["high", "error", "severe"]:
            return "high"
        if s in ["medium", "med", "warning", "warn"]:
            return "medium"
        if s in ["low", "minor", "note"]:
            return "low"
        return "info"
