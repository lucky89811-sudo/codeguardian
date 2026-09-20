from typing import List, Dict, Any

class FindingDeduplicationService:
    @staticmethod
    def deduplicate(findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Deduplicates overlapping findings between Semgrep, custom rules, and dependency scans.
        Clusters by (file_path, line_start, CWE/normalized category).
        Combines sources (e.g. 'semgrep+custom_rule') and retains the highest confidence & risk score.
        """
        if not findings:
            return []

        dedup_map: Dict[str, Dict[str, Any]] = {}

        for f in findings:
            file_path = f.get("file_path", "").strip()
            line_start = f.get("line_start", 0)
            cwe = f.get("cwe", "").strip().upper()
            
            # Key groups issues in the same file around the same line with same CWE or category
            key = f"{file_path}::{line_start}::{cwe}"
            
            if key not in dedup_map:
                dedup_map[key] = dict(f)
            else:
                existing = dedup_map[key]
                # Merge sources
                existing_src = existing.get("source", "")
                new_src = f.get("source", "")
                sources = set(existing_src.split("+"))
                sources.update(new_src.split("+"))
                existing["source"] = "+".join(sorted(sources))
                
                # Retain higher confidence, risk score, and more comprehensive snippet
                if f.get("confidence", 0.0) > existing.get("confidence", 0.0):
                    existing["confidence"] = f.get("confidence")
                if f.get("risk_score", 0.0) > existing.get("risk_score", 0.0):
                    existing["risk_score"] = f.get("risk_score")
                    existing["severity"] = f.get("severity")
                if len(f.get("code_snippet", "")) > len(existing.get("code_snippet", "")):
                    existing["code_snippet"] = f.get("code_snippet")
                if f.get("pattern_label") == "Confirmed pattern":
                    existing["pattern_label"] = "Confirmed pattern"

        return list(dedup_map.values())
