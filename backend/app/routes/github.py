from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.github import (
    ParseUrlRequest,
    ParseUrlResponse,
    GitHubPRResponse,
    ReviewCommentRequest
)
from app.services.github_service import GitHubService
from app.config import settings

router = APIRouter(prefix="/github", tags=["GitHub"])

@router.post("/parse-url", response_model=ParseUrlResponse)
def parse_github_url(payload: ParseUrlRequest):
    result = GitHubService.parse_url(payload.url)
    return ParseUrlResponse(**result)

@router.get("/pulls/{owner}/{repo}/{pull_number}", response_model=GitHubPRResponse)
async def get_pull_request_details(owner: str, repo: str, pull_number: int):
    svc = GitHubService()
    try:
        data = await svc.get_pull_request(owner, repo, pull_number)
        files = await svc.get_pull_request_files(owner, repo, pull_number)
        return GitHubPRResponse(
            owner=owner,
            repo=repo,
            pull_number=pull_number,
            title=data.get("title", ""),
            author=data.get("user", {}).get("login", "unknown"),
            body=data.get("body"),
            state=data.get("state", "open"),
            created_at=data.get("created_at", ""),
            source_branch=data.get("head", {}).get("ref", ""),
            target_branch=data.get("base", {}).get("ref", ""),
            additions=data.get("additions", 0),
            deletions=data.get("deletions", 0),
            changed_files=data.get("changed_files", len(files)),
            files=files
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/pulls/{owner}/{repo}/{pull_number}/files")
async def get_pull_request_files(owner: str, repo: str, pull_number: int):
    svc = GitHubService()
    try:
        files = await svc.get_pull_request_files(owner, repo, pull_number)
        return files
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/pulls/{owner}/{repo}/{pull_number}/review-comments")
async def post_review_comment(
    owner: str,
    repo: str,
    pull_number: int,
    payload: ReviewCommentRequest
):
    """
    Safely publishes a review comment to GitHub PR.
    Requires ENABLE_GITHUB_COMMENTS=true and explicit confirm_publish=True.
    """
    if not payload.confirm_publish:
        raise HTTPException(
            status_code=400,
            detail="Explicit confirmation (confirm_publish: true) is required before publishing comments to GitHub."
        )

    svc = GitHubService()
    try:
        res = await svc.publish_review_comment(
            owner=owner,
            repo=repo,
            pull_number=pull_number,
            finding_id=payload.finding_id,
            body=payload.body,
            path=payload.path,
            line=payload.line,
            confirm=payload.confirm_publish
        )
        return {"status": "published", "github_response": res}
    except Exception as e:
        raise HTTPException(status_code=403, detail=str(e))
