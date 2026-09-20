def test_load_demo_data_and_verify_entities(client):
    res = client.post("/api/demo/load")
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "DEMO MODE — STATIC SAMPLE DATA"
    assert data["findings_count"] >= 10
    
    scan_id = data["scan_id"]
    
    # Check scan summary
    scan_res = client.get(f"/api/scans/{scan_id}")
    assert scan_res.status_code == 200
    scan_data = scan_res.json()
    assert scan_data["owasp_version"] == "2025"
    assert scan_data["is_demo"] == 1
    assert scan_data["overall_score"] > 80.0
    
    # Check progress endpoint
    prog_res = client.get(f"/api/scans/{scan_id}/progress")
    assert prog_res.status_code == 200
    assert prog_res.json()["progress_percent"] == 100
    
    # Check findings endpoint
    findings_res = client.get(f"/api/scans/{scan_id}/findings")
    assert findings_res.status_code == 200
    findings = findings_res.json()
    assert len(findings) >= 10
    
    # Verify deterministic finding is enriched with AI explanation object
    has_ai = any(f.get("ai_explanation") is not None for f in findings)
    assert has_ai is True

    # Test status update on finding
    first_id = findings[0]["id"]
    update_res = client.patch(f"/api/findings/{first_id}/status", json={"status": "reviewed", "note": "Verified by lead dev"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "reviewed"
