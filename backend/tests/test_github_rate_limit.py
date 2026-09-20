import pytest
from unittest.mock import patch, AsyncMock
from app.services.github_service import GitHubService

@pytest.mark.asyncio
async def test_github_rate_limit_handling():
    svc = GitHubService()
    
    mock_resp = AsyncMock()
    mock_resp.status_code = 403
    mock_resp.text = "API rate limit exceeded for IP."

    with patch("httpx.AsyncClient.get", return_value=mock_resp):
        with pytest.raises(PermissionError) as exc_info:
            await svc.get_pull_request("testowner", "testrepo", 1)
        assert "rate limit exceeded" in str(exc_info.value).lower()
