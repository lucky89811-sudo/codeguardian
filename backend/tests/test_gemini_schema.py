import pytest
from pydantic import ValidationError
from app.schemas.ai_explanation import GeminiExplanationSchema

def test_valid_gemini_schema():
    payload = {
        "summary": "Untrusted input directly formatted into query.",
        "impact": "Database extraction.",
        "why_flagged": "String interpolation in cursor.execute.",
        "recommended_fix": "Use parameterized queries.",
        "patched_code": "cursor.execute(sql, (param,))",
        "attack_scenario": "Attacker passes quotes.",
        "confidence": 0.95,
        "needs_human_review": True,
        "limitations": ["Requires dialect verification."]
    }
    schema = GeminiExplanationSchema(**payload)
    assert schema.confidence == 0.95
    assert schema.needs_human_review is True

def test_invalid_gemini_schema_missing_fields():
    with pytest.raises(ValidationError):
        GeminiExplanationSchema(summary="Incomplete")
