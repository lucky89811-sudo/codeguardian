# CodeGuardian — Explainable AI Safety & Governance

## 1. Role of AI in CodeGuardian

In CodeGuardian, AI serves exclusively as an **interpretive and assistive layer**, never as an autonomous security authority.

```
Deterministic Static Analyzers  -->  Code Context + Secret Masking  -->  Structured Gemini Explanation
(Semgrep + 15 Custom Rules)          (Untrusted Passive Context)         (Verified Pydantic Schema)
```

## 2. Strict Technical Controls

1. **Deterministic Primacy**:
   - The scanner identifies vulnerabilities using deterministic AST and regex logic. If Gemini fails or is unreachable, **findings are never deleted or hidden**.
2. **Schema Enforcement**:
   - Structured JSON schema enforcement guarantees that models cannot output arbitrary unvalidated text or manipulate database flags.
3. **Untrusted Code Context**:
   - Source code comments and strings are strictly isolated inside system instructions. Prompt-injection attempts to declare files as "secure" are neutralized.
4. **Pre-Dispatch Secret Redaction**:
   - API tokens, passwords, and private keys are redacted using `SecretRedactionService` before code reaches the LLM API.
5. **Human Confirmation Requirement**:
   - Every explanation object has `needs_human_review = True`. Suggested code fixes must be tested and verified by human engineers.
