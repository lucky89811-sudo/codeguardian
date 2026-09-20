# CodeGuardian — Technical Architecture

CodeGuardian is an explainable AI security review platform designed for GitHub Pull Requests. It orchestrates static analysis, custom AST rules, software supply-chain inspections, deterministic risk calculations, and Google Gemini explainable AI enrichments.

## System Topology

```mermaid
flowchart TB
    subgraph Client Layer
        Browser[Developer Web Browser]
        Console[Guardian Console - React / Vite]
    end

    subgraph API & Ingestion
        FastAPI[FastAPI Backend - Port 8000]
        GH[GitHub API Client - REST / GraphQL]
    end

    subgraph Security Engines
        Semgrep[Semgrep Subprocess Engine]
        CustomRules[15 Custom Python AST/Regex Rules]
        SupplyChain[A03:2025 Dependency Inspector]
    end

    subgraph Normalization & Enrichment
        Dedup[Deduplication Service]
        OWASP[OWASP Top 10:2025 Normalizer]
        Redact[Secret Redaction & Context Windowing]
        Gemini[Google Gemini API - google-genai]
    end

    subgraph Persistence & Reporting
        DB[(SQLite / PostgreSQL DB)]
        Reports[Standalone HTML Report Generator]
    end

    Browser --> Console
    Console -->|REST API / Async Progress| FastAPI
    FastAPI --> GH
    FastAPI --> Semgrep
    FastAPI --> CustomRules
    FastAPI --> SupplyChain
    Semgrep --> Dedup
    CustomRules --> Dedup
    SupplyChain --> Dedup
    Dedup --> OWASP
    OWASP --> Redact
    Redact --> Gemini
    Gemini --> DB
    FastAPI --> DB
    FastAPI --> Reports
```

## Data Lifecycle & Decoupling

1. **Deterministic Finding Identification**:
   - Static analysis outputs raw patterns from Semgrep CLI and custom AST rules.
   - Findings are deduplicated based on `(file_path, line_start, CWE)`.
   - Overlapping detections combine sources (e.g. `source: "semgrep+custom_rule"`).
2. **Secret Masking**:
   - `SecretRedactionService` evaluates tokens, AWS keys, passwords, and private keys via regex before code reaches external APIs or UI displays.
3. **Structured AI Enrichment**:
   - Decoupled `AIExplanation` objects are synthesized by Gemini using Pydantic JSON schemas.
   - Telemetry tracks `input_tokens`, `output_tokens`, `latency_ms`, and `provider_status`.
   - Deterministic findings remain accessible even if AI synthesis is unavailable.
4. **Transparent Risk Scoring**:
   - Score formula: `risk_score = (severity * 0.40 + confidence * 0.25 + exploitability * 0.20 + exposure * 0.15) * 100`.
   - Aggregate scan score factors highest individual risks and critical severity counts.
