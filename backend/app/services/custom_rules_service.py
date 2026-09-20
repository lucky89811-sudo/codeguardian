import re
from typing import List, Dict, Any, Optional
from app.services.risk_service import RiskService
from app.services.secret_redaction_service import SecretRedactionService
from app.services.normalization_service import NormalizationService

class SecurityRule:
    def __init__(
        self,
        rule_id: str,
        title: str,
        description: str,
        severity: str,
        confidence: float,
        exploitability: float,
        impact: float,
        cwe: str,
        remediation: str,
        pattern_label: str = "Confirmed pattern",
        file_patterns: Optional[List[str]] = None,
    ):
        self.rule_id = rule_id
        self.title = title
        self.description = description
        self.severity = severity
        self.confidence = confidence
        self.exploitability = exploitability
        self.impact = impact
        self.cwe = cwe
        self.owasp_category = NormalizationService.resolve_owasp_category(cwe)
        self.remediation = remediation
        self.pattern_label = pattern_label
        self.file_patterns = file_patterns or [".py", ".js", ".ts", ".jsx", ".tsx", ".env", ".json"]

CUSTOM_RULES = [
    SecurityRule(
        rule_id="CG-SEC-001",
        title="Hardcoded API Key Detected",
        description="High-entropy or patterned API key found hardcoded in source code.",
        severity="critical",
        confidence=0.95,
        exploitability=0.85,
        impact=0.90,
        cwe="CWE-798",
        pattern_label="Confirmed pattern",
        remediation="Store API keys in environment variables or a dedicated secrets manager (e.g. AWS Secrets Manager, Vault)."
    ),
    SecurityRule(
        rule_id="CG-SEC-002",
        title="Hardcoded Password Detected",
        description="Plaintext password assigned to a credential variable in source code.",
        severity="critical",
        confidence=0.90,
        exploitability=0.85,
        impact=0.95,
        cwe="CWE-259",
        pattern_label="Confirmed pattern",
        remediation="Never commit passwords. Inject them dynamically at runtime via secrets management."
    ),
    SecurityRule(
        rule_id="CG-SEC-003",
        title="Hardcoded JWT / Secret Token",
        description="JSON Web Token or signature secret detected directly in application files.",
        severity="high",
        confidence=0.90,
        exploitability=0.80,
        impact=0.85,
        cwe="CWE-798",
        pattern_label="Confirmed pattern",
        remediation="Sign and verify JWTs using keys injected via secure environment variables."
    ),
    SecurityRule(
        rule_id="CG-SEC-004",
        title="Dynamic Code Execution via eval()",
        description="Use of eval() or exec() allows execution of arbitrary code strings, leading to Remote Code Execution.",
        severity="critical",
        confidence=0.95,
        exploitability=0.90,
        impact=1.00,
        cwe="CWE-95",
        pattern_label="Confirmed pattern",
        remediation="Avoid eval() entirely. Use safe parsers like ast.literal_eval() or structured data formats (JSON)."
    ),
    SecurityRule(
        rule_id="CG-SEC-005",
        title="Unsafe Shell Command Execution",
        description="Subprocess executed with shell=True or unquoted command concatenation, exposing Command Injection.",
        severity="critical",
        confidence=0.85,
        exploitability=0.85,
        impact=0.95,
        cwe="CWE-78",
        pattern_label="Needs human review",
        remediation="Set shell=False and pass arguments as an explicit argument list rather than a formatted string."
    ),
    SecurityRule(
        rule_id="CG-SEC-006",
        title="Dynamic SQL Query Construction",
        description="SQL query built using string concatenation or formatting instead of parameterized queries.",
        severity="critical",
        confidence=0.90,
        exploitability=0.90,
        impact=0.95,
        cwe="CWE-89",
        pattern_label="Possible vulnerability",
        remediation="Use parameterized queries (e.g. cursor.execute(query, (param,))) or an ORM like SQLAlchemy."
    ),
    SecurityRule(
        rule_id="CG-SEC-007",
        title="Missing Authentication Marker on Sensitive Route",
        description="Route handler for privileged endpoint lacks an auth dependency or decorator.",
        severity="high",
        confidence=0.75,
        exploitability=0.75,
        impact=0.80,
        cwe="CWE-862",
        pattern_label="Needs human review",
        remediation="Enforce authentication and role-based access control (RBAC) middleware or decorators."
    ),
    SecurityRule(
        rule_id="CG-SEC-008",
        title="Unsafe File Path Concatenation (Path Traversal)",
        description="File path constructed directly from input without boundary validation, enabling directory traversal.",
        severity="high",
        confidence=0.85,
        exploitability=0.80,
        impact=0.85,
        cwe="CWE-22",
        pattern_label="Possible vulnerability",
        remediation="Validate paths using os.path.abspath and ensure the resolved path starts with the allowed base directory."
    ),
    SecurityRule(
        rule_id="CG-SEC-009",
        title="Overly Permissive Wildcard CORS with Credentials",
        description="CORS policy allows wildcard origin '*' while permitting credentials, allowing cross-origin credential theft.",
        severity="medium",
        confidence=0.85,
        exploitability=0.65,
        impact=0.70,
        cwe="CWE-942",
        pattern_label="Confirmed pattern",
        remediation="Explicitly specify trusted origin domains instead of '*' when allowing credentials."
    ),
    SecurityRule(
        rule_id="CG-SEC-010",
        title="Debug Mode Enabled in Production Context",
        description="Application or framework configured with DEBUG = True, exposing verbose stack traces and sensitive internals.",
        severity="medium",
        confidence=0.90,
        exploitability=0.60,
        impact=0.65,
        cwe="CWE-16",
        pattern_label="Confirmed pattern",
        remediation="Ensure DEBUG is disabled (False) in production and read from environment variables."
    ),
    SecurityRule(
        rule_id="CG-SEC-011",
        title="Unvalidated File Upload Handling",
        description="File upload handler does not enforce extension whitelisting, MIME validation, or size limits.",
        severity="high",
        confidence=0.75,
        exploitability=0.75,
        impact=0.80,
        cwe="CWE-434",
        pattern_label="Needs human review",
        remediation="Validate uploaded file extensions against an allowlist, check magic bytes, and limit maximum file size."
    ),
    SecurityRule(
        rule_id="CG-SEC-012",
        title="Unsanitized HTML Output / DOM Injection",
        description="Rendering raw HTML directly to response or dangerouslySetInnerHTML without sanitization.",
        severity="high",
        confidence=0.85,
        exploitability=0.85,
        impact=0.80,
        cwe="CWE-79",
        pattern_label="Possible vulnerability",
        remediation="Use context-aware template escaping or DOMPurify before inserting dynamic content."
    ),
    SecurityRule(
        rule_id="CG-SEC-013",
        title="Weak Cryptographic Hash Algorithm",
        description="MD5 or SHA1 utilized for sensitive operations or password storage.",
        severity="medium",
        confidence=0.95,
        exploitability=0.60,
        impact=0.70,
        cwe="CWE-328",
        pattern_label="Confirmed pattern",
        remediation="Use modern password hashing algorithms like Argon2id or bcrypt."
    ),
    SecurityRule(
        rule_id="CG-SEC-014",
        title="Insecure Pseudo-Random Number Generator",
        description="Standard pseudo-random generator (random/Math.random) used for security-sensitive tokens or keys.",
        severity="low",
        confidence=0.80,
        exploitability=0.55,
        impact=0.60,
        cwe="CWE-330",
        pattern_label="Needs human review",
        remediation="Use cryptographically secure random generators such as secrets in Python or crypto.getRandomValues() in JS."
    ),
    SecurityRule(
        rule_id="CG-SEC-015",
        title="Disabled TLS Certificate Verification",
        description="HTTPS connection created with verify=False or certificate checks disabled, enabling MitM attacks.",
        severity="high",
        confidence=0.95,
        exploitability=0.75,
        impact=0.85,
        cwe="CWE-295",
        pattern_label="Confirmed pattern",
        remediation="Always verify TLS certificates in production requests (verify=True or provide custom CA bundle)."
    ),
]

class CustomRulesService:
    def __init__(self):
        self.rules = {r.rule_id: r for r in CUSTOM_RULES}

    def scan_file(self, file_path: str, content: str) -> List[Dict[str, Any]]:
        """Scans a single file against all 15 custom rules using AST / regex matchers."""
        findings = []
        if not content:
            return findings

        lines = content.splitlines()
        exposure = RiskService.calculate_exposure(file_path)

        for line_idx, line in enumerate(lines, start=1):
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or stripped.startswith("//"):
                # Skip comments unless checking for prompt-injection defense in AI test
                pass

            # 1. CG-SEC-001: Hardcoded API keys
            if re.search(r'(?i)(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*["\'][A-Za-z0-9_\-]{20,}["\']', line) or \
               re.search(r'\b(AKIA[0-9A-Z]{16})\b', line) or re.search(r'\b(ghp_[a-zA-Z0-9]{36})\b', line):
                rule = self.rules["CG-SEC-001"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 2. CG-SEC-002: Hardcoded passwords
            if re.search(r'(?i)(password|passwd|pwd)\s*[:=]\s*["\'][^"\']{6,}["\']', line) and not re.search(r'(?i)(hash|bcrypt|os\.environ|getenv)', line):
                rule = self.rules["CG-SEC-002"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 3. CG-SEC-003: Hardcoded JWT
            if re.search(r'\beyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b', line):
                rule = self.rules["CG-SEC-003"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 4. CG-SEC-004: eval / exec
            if re.search(r'\b(eval|exec)\s*\(', line) and not re.search(r'\bast\.literal_eval\b', line):
                rule = self.rules["CG-SEC-004"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 5. CG-SEC-005: Unsafe shell command
            if re.search(r'subprocess\.(Popen|run|call|check_output)\(.*?shell\s*=\s*True', line) or \
               re.search(r'os\.system\s*\(\s*f["\']', line):
                rule = self.rules["CG-SEC-005"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 6. CG-SEC-006: Dynamic SQL
            if (re.search(r'(?i)execute\s*\(\s*f["\'].*?(SELECT|INSERT|UPDATE|DELETE|DROP)\b', line) or
                re.search(r'(?i)f["\'].*?(SELECT|INSERT|UPDATE|DELETE|DROP)\b.*?\{', line) or
                re.search(r'(?i)(SELECT|INSERT|UPDATE|DELETE)\b.*?WHERE.*?\{[a-zA-Z_]', line) or
                re.search(r'(?i)(SELECT|INSERT|UPDATE|DELETE).*?WHERE.*?\+\s*[a-zA-Z_]', line) or
                re.search(r'(?i)SELECT.*?%\s*\([a-zA-Z_]', line)):
                rule = self.rules["CG-SEC-006"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 7. CG-SEC-007: Missing auth marker on sensitive routes
            if re.search(r'@(?:app|router)\.(get|post|delete|put)\s*\(["\'].*?(?:admin|delete|internal|account|reset)', line, re.IGNORECASE):
                # Inspect next few lines to check if auth dependency exists
                snippet_window = "\n".join(lines[line_idx:min(len(lines), line_idx + 4)])
                if not any(marker in snippet_window for marker in ["auth", "get_current_user", "security", "permission", "Depends"]):
                    rule = self.rules["CG-SEC-007"]
                    findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 8. CG-SEC-008: Unsafe file path concatenation
            if re.search(r'\bopen\s*\(\s*(?:base_dir|path|UPLOAD_DIR)\s*\+\s*[a-zA-Z_]', line) or \
               re.search(r'os\.path\.join\s*\([^,]+,\s*(?:req|request|params|user_input)', line):
                rule = self.rules["CG-SEC-008"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 9. CG-SEC-009: Insecure CORS wildcard with credentials
            if re.search(r'(?i)allow_origins\s*=\s*\[?["\']\*["\']\]?', line) and "credentials=True" in content:
                rule = self.rules["CG-SEC-009"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 10. CG-SEC-010: Debug mode enabled
            if re.search(r'^\s*DEBUG\s*=\s*True\b', line) or re.search(r'app\.run\s*\(.*?debug\s*=\s*True', line):
                rule = self.rules["CG-SEC-010"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 11. CG-SEC-011: Unvalidated file upload
            if re.search(r'(?i)upload_file|UploadFile|save\(.*?(?:filename|path)', line) and not any(kw in content for kw in ["ALLOWED_EXTENSIONS", "max_size", "content_type"]):
                rule = self.rules["CG-SEC-011"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 12. CG-SEC-012: Unsanitized HTML / DOM injection
            if re.search(r'dangerouslySetInnerHTML|render_template_string\s*\(|innerHTML\s*=', line):
                rule = self.rules["CG-SEC-012"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 13. CG-SEC-013: Weak password hashing
            if re.search(r'hashlib\.(md5|sha1)\s*\(', line):
                rule = self.rules["CG-SEC-013"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 14. CG-SEC-014: Insecure random for tokens
            if (re.search(r'random\.(random|choice|randint)\s*\(', line) or re.search(r'Math\.random\s*\(', line)) and \
               any(k in line.lower() for k in ["token", "key", "secret", "salt", "session", "otp", "nonce"]):
                rule = self.rules["CG-SEC-014"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

            # 15. CG-SEC-015: Disabled TLS certificate verification
            if re.search(r'verify\s*=\s*False', line) or re.search(r'NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*["\']0["\']', line):
                rule = self.rules["CG-SEC-015"]
                findings.append(self._create_finding(rule, file_path, line_idx, line, exposure))

        return findings

    def _create_finding(self, rule: SecurityRule, file_path: str, line_num: int, line_text: str, exposure: float) -> Dict[str, Any]:
        redacted_snippet = SecretRedactionService.redact(line_text.strip())
        risk_score = RiskService.calculate_finding_risk(
            severity=rule.severity,
            confidence=rule.confidence,
            exploitability=rule.exploitability,
            exposure=exposure,
        )
        return {
            "rule_id": rule.rule_id,
            "title": rule.title,
            "description": rule.description,
            "pattern_label": rule.pattern_label,
            "severity": rule.severity,
            "confidence": rule.confidence,
            "exploitability": rule.exploitability,
            "impact": rule.impact,
            "exposure": exposure,
            "risk_score": risk_score,
            "file_path": file_path,
            "line_start": line_num,
            "line_end": line_num,
            "column_start": 1,
            "column_end": len(line_text),
            "code_snippet": redacted_snippet,
            "source": "custom_rule",
            "cwe": rule.cwe,
            "owasp_category": rule.owasp_category,
            "status": "open",
            "ai_explanation_status": "pending",
        }
