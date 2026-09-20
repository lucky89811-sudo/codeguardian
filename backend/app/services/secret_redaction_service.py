import re
from typing import Tuple

SECRET_PATTERNS = [
    # AWS Access Key
    (re.compile(r'\b(AKIA[0-9A-Z]{16})\b'), "[REDACTED_SECRET:AWS_ACCESS_KEY]"),
    # AWS Secret Key
    (re.compile(r'(?i)aws_secret_access_key\s*=\s*["\']([a-zA-Z0-9/+=]{40})["\']'), 'aws_secret_access_key = "[REDACTED_SECRET:AWS_SECRET_KEY]"'),
    # GitHub Personal Access Token (classic & fine-grained)
    (re.compile(r'\b(ghp_[a-zA-Z0-9]{36})\b'), "[REDACTED_SECRET:GITHUB_PAT]"),
    (re.compile(r'\b(github_pat_[a-zA-Z0-9_]{82})\b'), "[REDACTED_SECRET:GITHUB_FINE_GRAINED_PAT]"),
    # JWT Tokens
    (re.compile(r'\beyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b'), "[REDACTED_SECRET:JWT_TOKEN]"),
    # Generic Private Key
    (re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'), "[REDACTED_SECRET:PRIVATE_KEY]"),
    # Bearer Tokens in headers
    (re.compile(r'(?i)Bearer\s+([a-zA-Z0-9\-._~+/]+=*)'), "Bearer [REDACTED_SECRET:BEARER_TOKEN]"),
    # Generic API Keys / Secrets assignments
    (re.compile(r'(?i)(api[_-]?key|secret[_-]?key|auth[_-]?token|app[_-]?secret)\s*[:=]\s*["\']([a-zA-Z0-9_\-]{16,})["\']'), r'\1 = "[REDACTED_SECRET:API_KEY]"'),
    # Hardcoded passwords in common config
    (re.compile(r'(?i)(password|passwd|pwd)\s*[:=]\s*["\']([^"\']{6,})["\']'), r'\1 = "[REDACTED_SECRET:PASSWORD]"'),
]

class SecretRedactionService:
    @staticmethod
    def redact(text: str) -> str:
        """Redacts sensitive credentials, tokens, keys, and passwords from code or text."""
        if not text:
            return ""
        
        redacted = text
        for pattern, replacement in SECRET_PATTERNS:
            redacted = pattern.sub(replacement, redacted)
            
        return redacted

    @staticmethod
    def contains_secret(text: str) -> bool:
        """Checks if text contains high-confidence secret patterns."""
        if not text:
            return False
        for pattern, _ in SECRET_PATTERNS:
            if pattern.search(text):
                return True
        return False
