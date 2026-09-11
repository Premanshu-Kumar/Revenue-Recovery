import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.models.entities import Customer, RecoveryCase, Invoice, Payment, AuditEvent, get_utc_now
from app.ml.model_pipeline import recovery_ml_pipeline
from app.services.scoring_engine import scoring_engine
from app.policies.policy_engine import policy_engine
from app.workflows.recovery_simulator import recovery_simulator
from app.services.risk_detector import risk_detector

TEST_DB_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_ml_recovery_probability_bounds():
    """Verify ML model returns valid probabilities in [0.0, 1.0]."""
    test_features = {
        "amount_at_risk": 84500.0,
        "days_overdue": 18,
        "customer_ltv": 840000.0,
        "payment_success_rate": 0.93,
        "previous_failure_count": 1,
        "previous_recovery_count": 12,
        "average_payment_delay": 5,
        "communication_engagement": 0.85,
        "failure_reason": "LATE_B2B_PAYMENT_CYCLE",
        "customer_segment": "Enterprise",
        "customer_health": "Healthy",
        "source_type": "OVERDUE_INVOICE"
    }
    prob = recovery_ml_pipeline.predict_probability(test_features)
    assert 0.05 <= prob <= 0.98
    # For a high LTV, healthy enterprise client with 93% success rate, probability should be high
    assert prob >= 0.70

def test_expected_recovery_calculation():
    """Verify Expected Recovery = Amount * Probability."""
    amount = 84500.0
    prob = 0.82
    expected = scoring_engine.calculate_expected_recovery(amount, prob)
    assert expected == 69290.0

def test_policy_engine_financial_guardrails():
    """Verify Policy Engine rules for auto vs high-value approval."""
    # Under ₹10k -> ALLOWED
    low_case = {"amount_at_risk": 4500.0, "outreach_attempts": 0, "retry_attempts": 0}
    res_low = policy_engine.evaluate(low_case, "PAYMENT_RETRY")
    assert res_low.status == "ALLOWED"
    assert not res_low.requires_approval

    # Over ₹50k -> APPROVAL_REQUIRED (ABC Technologies scenario)
    high_case = {"amount_at_risk": 84500.0, "outreach_attempts": 0, "retry_attempts": 0}
    res_high = policy_engine.evaluate(high_case, "EMAIL_REMINDER")
    assert res_high.status == "APPROVAL_REQUIRED"
    assert res_high.requires_approval

    # Max retry stopping rule
    max_retry_case = {"amount_at_risk": 5000.0, "retry_attempts": 3}
    res_max_retry = policy_engine.evaluate(max_retry_case, "PAYMENT_RETRY")
    assert res_max_retry.status == "BLOCKED"

def test_canonical_abc_technologies_flow(db_session):
    """End-to-end verification of ABC Technologies scenario."""
    # 1. Create Customer
    customer = Customer(
        name="Rajesh Khanna",
        company="ABC Technologies",
        email="finance@abctechnologies.in",
        industry="Enterprise SaaS",
        segment="Enterprise",
        lifetime_value=840000.0,
        payment_success_rate=0.93,
        customer_health="Healthy",
        status="ACTIVE"
    )
    db_session.add(customer)
    db_session.commit()

    # 2. Process Overdue Invoice Risk
    case = risk_detector.process_event(
        db=db_session,
        customer_id=customer.id,
        source_type="OVERDUE_INVOICE",
        source_id="INV-4821",
        amount=84500.0,
        days_overdue=18,
        failure_reason="LATE_PAYMENT"
    )
    assert case is not None
    assert case.amount_at_risk == 84500.0
    assert case.days_overdue == 18
    assert case.policy_status == "APPROVAL_REQUIRED"
    assert case.status in ["Approval Required", "Detected"]

    # 3. Simulate Human Approval & Execution
    case.status = "Approved"
    db_session.commit()

    exec_res = recovery_simulator.execute_single_case(
        db=db_session,
        case=case,
        override_approval=True
    )
    assert exec_res["success"] is True
    
    # 4. Verify Audit Event was created
    audits = db_session.query(AuditEvent).filter(AuditEvent.case_id == case.id).all()
    assert len(audits) >= 1
