import os
import secrets
import subprocess
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Strict, explicit CORS policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://secure.example.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# Secrets retrieved strictly from environment
STRIPE_KEY = os.getenv("STRIPE_SECRET_KEY")

@app.get("/users/{user_id}")
def get_user(user_id: int, cursor):
    # Parameterized SQL query
    query = "SELECT id, username, email FROM users WHERE id = %s"
    cursor.execute(query, (user_id,))
    return cursor.fetchone()

@app.post("/print")
def safe_print(doc_id: str):
    # Process invocation without shell, arguments passed as discrete validated list
    if not doc_id.isalnum():
        raise HTTPException(status_code=400, detail="Invalid doc ID")
    subprocess.run(["lp", "-d", "printer", f"/tmp/{doc_id}.pdf"], check=True, shell=False)
    return {"status": "dispatched"}

@app.get("/auth/crypto-token")
def get_secure_token():
    # Cryptographically secure random token
    return {"token": secrets.token_urlsafe(32)}
