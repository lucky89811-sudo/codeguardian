# CodeGuardian — Benchmark & Evaluation Methodology

## 1. Evaluation Fixtures

CodeGuardian is evaluated against representative synthetic codebases located in `sample-repositories/`:

1. `vulnerable-python/app.py`: Contains 11 distinct vulnerability classes including raw SQL injection, hardcoded stripe keys, `eval()` execution, `subprocess` shell injection, weak MD5 hashing, unpinned dependencies, and disabled TLS verification.
2. `vulnerable-javascript/server.js`: Contains wildcard CORS with credentials, unescaped DOM/HTML injection, and unseeded pseudo-random generators.
3. `secure-examples/safe_app.py`: Contains modern defensive paradigms (parameterized queries, secrets module, argon2, environment-based credentials).
4. `prompt-injection/`: Contains adversarial comments and strings designed to test prompt-injection defenses.

## 2. Test Execution & Coverage

The automated test suite in `backend/tests/` verifies:
- **Accuracy**: Detection of all 15 custom rules without false alarms on secure examples.
- **Deduplication**: Merging of identical findings between Semgrep and custom rules into unified entries with combined sources.
- **Redaction**: Zero high-entropy keys or passwords exposed in telemetry or snippets.
- **Resilience**: Graceful recovery during subprocess timeouts, GitHub API rate limits, or missing external credentials.
