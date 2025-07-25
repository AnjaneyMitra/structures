import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"

# More integration tests would require a test database and user setup.
# Here is a placeholder for submission endpoint tests.

def test_submit_code_unauthenticated():
    resp = client.post("/api/submissions/", json={
        "problem_id": 1,
        "code": "print(42)",
        "language": "python"
    })
    assert resp.status_code == 401
    assert "Not authenticated" in resp.text 