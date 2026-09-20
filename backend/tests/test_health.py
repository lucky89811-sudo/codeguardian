def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "CodeGuardian"
    assert data["owasp_standard"] == "2025"
    assert "capabilities" in data
    assert data["capabilities"]["custom_rules_count"] == 15
    assert data["capabilities"]["demo_mode_ready"] is True
