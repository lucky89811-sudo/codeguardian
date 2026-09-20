import re
from typing import Dict, Any, Optional, List, Tuple
import httpx
from app.config import settings

GITHUB_PR_REGEX = re.compile(
    r'^https?://github\.com/([a-zA-Z0-9_\-\.]+)/([a-zA-Z0-9_\-\.]+)/pull/(\d+)(?:/.*)?$'
)
GITHUB_REPO_REGEX = re.compile(
    r'^https?://github\.com/([a-zA-Z0-9_\-\.]+)/([a-zA-Z0-9_\-\.]+)(?:/.*)?$'
)

class GitHubService:
    def __init__(self, token: Optional[str] = None):
        self.token = token or settings.GITHUB_TOKEN
        self.base_url = "https://api.github.com"

    def _headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "CodeGuardian-Security-Scanner/1.0",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    @staticmethod
    def parse_url(url: str) -> Dict[str, Any]:
        """Validates and extracts owner, repo, and PR number from GitHub URLs."""
        if not url or not isinstance(url, str):
            return {
                "is_valid": False,
                "url_type": "invalid",
                "error": "URL cannot be empty."
            }

        url_clean = url.strip()
        pr_match = GITHUB_PR_REGEX.match(url_clean)
        if pr_match:
            owner, repo, pr_num = pr_match.groups()
            return {
                "is_valid": True,
                "url_type": "pull_request",
                "owner": owner,
                "repo": repo,
                "pull_number": int(pr_num),
                "normalized_url": f"https://github.com/{owner}/{repo}/pull/{pr_num}"
            }

        repo_match = GITHUB_REPO_REGEX.match(url_clean)
        if repo_match:
            owner, repo = repo_match.groups()
            # Ignore special paths like 'settings', 'organizations'
            if owner.lower() in ["settings", "organizations", "features", "marketplace", "pricing"]:
                return {"is_valid": False, "url_type": "invalid", "error": "Invalid GitHub repository path."}
            return {
                "is_valid": True,
                "url_type": "repository",
                "owner": owner,
                "repo": repo,
                "pull_number": None,
                "normalized_url": f"https://github.com/{owner}/{repo}"
            }

        return {
            "is_valid": False,
            "url_type": "invalid",
            "error": "The provided URL is not a valid GitHub repository or pull-request URL."
        }

    async def get_pull_request(self, owner: str, repo: str, pull_number: int) -> Dict[str, Any]:
        """Fetches PR metadata from GitHub API."""
        endpoint = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pull_number}"
        async with httpx.AsyncClient(timeout=15.0, trust_env=False) as client:
            resp = await client.get(endpoint, headers=self._headers())
            if resp.status_code == 404:
                raise ValueError(f"Pull request #{pull_number} in repository {owner}/{repo} not found.")
            if resp.status_code == 403 and "rate limit" in resp.text.lower():
                raise PermissionError("GitHub API rate limit exceeded. Please configure GITHUB_TOKEN.")
            if resp.status_code != 200:
                raise RuntimeError(f"GitHub API returned error {resp.status_code}: {resp.text}")
            return resp.json()

    async def get_pull_request_files(self, owner: str, repo: str, pull_number: int) -> List[Dict[str, Any]]:
        """Fetches list of changed files for a PR."""
        endpoint = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pull_number}/files"
        async with httpx.AsyncClient(timeout=15.0, trust_env=False) as client:
            resp = await client.get(endpoint, headers=self._headers())
            if resp.status_code != 200:
                raise RuntimeError(f"Failed to fetch PR files: {resp.status_code}")
            return resp.json()

    async def get_file_content_by_url(self, raw_url: str) -> str:
        """Safely fetches file content from raw GitHub URL within size limit."""
        async with httpx.AsyncClient(timeout=15.0, trust_env=False) as client:
            resp = await client.get(raw_url, headers=self._headers())
            if resp.status_code != 200:
                return ""
            if len(resp.content) > settings.MAX_FILE_SIZE_BYTES:
                return f"# File exceeded maximum allowed scan size ({settings.MAX_FILE_SIZE_BYTES} bytes)"
            return resp.text

    async def publish_review_comment(
        self,
        owner: str,
        repo: str,
        pull_number: int,
        finding_id: str,
        body: str,
        path: str,
        line: int,
        confirm: bool = False
    ) -> Dict[str, Any]:
        """
        Publishes a review comment to GitHub PR.
        Strictly requires settings.ENABLE_GITHUB_COMMENTS=True and confirm=True.
        """
        if not settings.ENABLE_GITHUB_COMMENTS:
            raise PermissionError("GitHub comment publishing is disabled in server configuration (ENABLE_GITHUB_COMMENTS=false).")
        if not confirm:
            raise ValueError("Explicit confirmation is required before posting comments to GitHub.")
        if not self.token:
            raise PermissionError("GITHUB_TOKEN is required to publish review comments.")

        endpoint = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pull_number}/comments"
        payload = {
            "body": f"🛡️ **CodeGuardian Finding**\n\n{body}\n\n*Note: This is an automated security advisory requiring human review.*",
            "path": path,
            "line": line,
            "side": "RIGHT"
        }
        async with httpx.AsyncClient(timeout=15.0, trust_env=False) as client:
            resp = await client.post(endpoint, json=payload, headers=self._headers())
            if resp.status_code not in [200, 201]:
                raise RuntimeError(f"GitHub review comment failed: {resp.status_code} - {resp.text}")
            return resp.json()
