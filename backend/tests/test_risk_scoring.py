from app.services.risk_service import RiskService

def test_risk_formula_calculation():
    # critical severity = 1.0, confidence = 0.9, exploitability = 0.8, exposure = 1.0
    # score = (1.0*0.40 + 0.9*0.25 + 0.8*0.20 + 1.0*0.15) * 100
    # score = (0.40 + 0.225 + 0.16 + 0.15) * 100 = 0.935 * 100 = 93.5
    score = RiskService.calculate_finding_risk(
        severity="critical",
        confidence=0.9,
        exploitability=0.8,
        exposure=1.0
    )
    assert score == 93.5
    assert RiskService.get_risk_tier(score) == "Critical"

def test_low_severity_risk_calculation():
    score = RiskService.calculate_finding_risk(
        severity="low",
        confidence=0.5,
        exploitability=0.4,
        exposure=0.2
    )
    # (0.30*0.40 + 0.5*0.25 + 0.4*0.20 + 0.2*0.15) * 100 = (0.12 + 0.125 + 0.08 + 0.03) * 100 = 35.5
    assert score == 35.5
    assert RiskService.get_risk_tier(score) == "Low"
