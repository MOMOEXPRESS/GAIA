import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"


def test_safety_check_red_flag():
    res = client.post("/api/v1/safety/check", json={"text": "severe chest pain and shortness of breath"})
    assert res.status_code == 200
    data = res.json()
    assert data["has_red_flags"] is True
    assert len(data["flags"]) > 0


def test_safety_check_clean():
    res = client.post("/api/v1/safety/check", json={"text": "mild headache after long day"})
    assert res.status_code == 200
    assert res.json()["has_red_flags"] is False


def test_register_and_login():
    import secrets
    email = f"test_{secrets.token_hex(4)}@gaia.test"
    res = client.post("/api/v1/auth/register", json={"email": email, "password": "testpass123", "display_name": "Test"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    assert token

    res = client.post("/api/v1/auth/login", json={"email": email, "password": "testpass123"})
    assert res.status_code == 200
    assert res.json()["access_token"]


def test_symptoms_require_auth():
    res = client.get("/api/v1/symptoms")
    assert res.status_code == 401


def test_authenticated_symptom_flow():
    res = client.post("/api/v1/auth/demo")
    assert res.status_code == 200
    data = res.json()
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/api/v1/symptoms",
        json={"symptom_name": "headache", "severity": 3, "accompanying_symptoms": []},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json()["symptom_name"] == "headache"

    res = client.get("/api/v1/symptoms", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_briefing_requires_auth():
    res = client.get("/api/v1/briefing/today")
    assert res.status_code == 401


def test_briefing_for_demo_user():
    res = client.post("/api/v1/auth/demo")
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/briefing/today", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "greeting" in data
    assert "disclaimer" in data


def test_safety_gateway():
    from brain.safety_gateway import run_safety_gateway

    result = run_safety_gateway("I have chest pain and cannot breathe")
    assert result["blocked"] is True
    assert result["has_red_flags"] is True

    result = run_safety_gateway("I want to improve my sleep habits")
    assert result["blocked"] is False


def test_orchestrator():
    from brain.orchestrator import Orchestrator

    orch = Orchestrator()
    assert orch.classify_intent("I have a headache") == "symptom"
    assert orch.classify_intent("How can I sleep better") == "wellness"
