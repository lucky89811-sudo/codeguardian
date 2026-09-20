from app.services.secret_redaction_service import SecretRedactionService

def test_redact_aws_key():
    raw = "aws_key = 'AKIA1234567890ABCDEF'"
    redacted = SecretRedactionService.redact(raw)
    assert "AKIA1234567890ABCDEF" not in redacted
    assert "[REDACTED_SECRET:AWS_ACCESS_KEY]" in redacted

def test_redact_github_pat():
    raw = "token = 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'"
    redacted = SecretRedactionService.redact(raw)
    assert "ghp_" not in redacted
    assert "[REDACTED_SECRET:GITHUB_PAT]" in redacted

def test_redact_passwords():
    raw = "password = 'SuperSecretString123!'"
    redacted = SecretRedactionService.redact(raw)
    assert "SuperSecretString123!" not in redacted
    assert "[REDACTED_SECRET:PASSWORD]" in redacted
