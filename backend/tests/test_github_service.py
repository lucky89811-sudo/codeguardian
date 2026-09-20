from app.services.github_service import GitHubService

def test_parse_valid_pull_request_url():
    url = "https://github.com/facebook/react/pull/28000"
    res = GitHubService.parse_url(url)
    assert res["is_valid"] is True
    assert res["url_type"] == "pull_request"
    assert res["owner"] == "facebook"
    assert res["repo"] == "react"
    assert res["pull_number"] == 28000
    assert res["normalized_url"] == "https://github.com/facebook/react/pull/28000"

def test_parse_valid_repo_url():
    url = "https://github.com/fastapi/fastapi"
    res = GitHubService.parse_url(url)
    assert res["is_valid"] is True
    assert res["url_type"] == "repository"
    assert res["owner"] == "fastapi"
    assert res["repo"] == "fastapi"
    assert res["pull_number"] is None

def test_parse_invalid_url():
    res = GitHubService.parse_url("https://notgithub.com/org/repo")
    assert res["is_valid"] is False
    assert res["url_type"] == "invalid"

    res_empty = GitHubService.parse_url("")
    assert res_empty["is_valid"] is False

    res_special = GitHubService.parse_url("https://github.com/pricing")
    assert res_special["is_valid"] is False
