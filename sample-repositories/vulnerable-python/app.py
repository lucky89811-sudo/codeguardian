import os
import subprocess
import hashlib
import random
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Vulnerability 1: Insecure CORS wildcard with credentials (CG-SEC-009 / A06:2025)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
)

# Vulnerability 2: Hardcoded API Key (CG-SEC-001 / A07:2025)
SECRET_API_KEY = "mock_sec_key_99887766554433221100aabbccddeeff"

# Vulnerability 3: Hardcoded Password (CG-SEC-002 / A07:2025)
DB_PASSWORD = "SuperSecretProductionPassword123!"

# Vulnerability 4: Debug mode enabled in production code (CG-SEC-010 / A06:2025)
DEBUG = True

@app.get("/search")
def search_users(query: str, cursor):
    # Vulnerability 5: Dynamic SQL injection (CG-SEC-006 / A05:2025)
    sql = f"SELECT * FROM users WHERE username = '{query}'"
    cursor.execute(sql)
    return cursor.fetchall()

@app.post("/execute")
def calculate_discount(formula: str):
    # Vulnerability 6: Dynamic code execution via eval() (CG-SEC-004 / A05:2025)
    result = eval(formula)
    return {"result": result}

@app.post("/print-receipt")
def print_receipt(receipt_id: str):
    # Vulnerability 7: Unsafe shell command execution (CG-SEC-005 / A05:2025)
    cmd = f"lp -d receipt_printer /tmp/{receipt_id}.pdf"
    subprocess.Popen(cmd, shell=True)
    return {"status": "sent"}

@app.get("/download")
def download_file(filename: str):
    # Vulnerability 8: Path traversal via unsafe concatenation (CG-SEC-008 / A01:2025)
    base_dir = "/var/data/uploads/"
    with open(base_dir + filename, "rb") as f:
        return f.read()

@app.post("/auth/legacy-hash")
def hash_password(pwd: str):
    # Vulnerability 9: Weak MD5 hashing (CG-SEC-013 / A02:2025)
    return {"hash": hashlib.md5(pwd.encode()).hexdigest()}

@app.get("/auth/reset-token")
def generate_token():
    # Vulnerability 10: Insecure random for token (CG-SEC-014 / A09:2025)
    token = str(random.randint(100000, 999999))
    return {"reset_token": token}

@app.post("/notify-webhook")
def call_webhook(url: str):
    # Vulnerability 11: Disabled TLS verification (CG-SEC-015 / A02:2025)
    requests.post(url, json={"event": "ping"}, verify=False)
    return {"status": "dispatched"}
