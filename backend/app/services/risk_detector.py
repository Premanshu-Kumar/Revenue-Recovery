import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.entities import RecoveryCase, AIRecommendation, Customer, Payment, Invoice, get_utc_now
from app.services.root_cause import RootCauseClassifier
from app.ml.model_pipeline import recovery_ml_pipeline
from app.services.scoring_engine import scoring_engine
from app.agents.recovery_agent import recovery_agent
from app.policies.policy_engine import policy_engine
from app.services.audit_service import audit_service

class RevenueRiskDetector:
    """
    Deterministic risk detection and case creation engine with deduplication to prevent double counting.
    """

    @staticmethod
    def process_event(
        db: Session,
        customer_id: str,
        source_type: str,
        source_id: str,
        amount: float,
        days_overdue: int = 0,
        failure_reason: Optional[str] = None,
        extra_details: Optional[Dict[str, Any]] = None
    ) -> Optional[RecoveryCase]:
        # 1. Deduplication check: Do not create duplicate active cases for the same source entity
        existing_case = db.query(RecoveryCase).filter(
            RecoveryCase.source_id == source_id,
            RecoveryCase.status.notin_(["Closed", "Unrecoverable", "Recovered"])
        ).first()
        
        if existing_case:
            return existing_case

        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            return None

        # 2. Extract context features
        details = extra_details or {}
        details.update({
            "failure_reason": failure_reason or "UNKNOWN",
            "days_overdue": days_overdue,
            "payment_success_rate": customer.payment_success_rate,
            "customer_health": customer.customer_health,
            "average_payment_delay": customer.average_payment_delay,
            "total_transactions": customer.total_transactions,
            "lifetime_value": customer.lifetime_value,
            "customer_segment": customer.segment,
            "amount_at_risk": amount,
            "source_type": source_type
        })

        # 3. Root Cause Classification
        root_cause_res = RootCauseClassifier.classify(source_type, details)

        # 4. ML Recovery Probability
        ml_features = {
            "amount_at_risk": amount,
            "days_overdue": days_overdue,
            "customer_ltv": customer.lifetime_value,
            "payment_success_rate": customer.payment_success_rate,
            "previous_failure_count": customer.failed_transactions,
            "previous_recovery_count": max(0, customer.successful_transactions - 1),
            "average_payment_delay": customer.average_payment_delay,
            "communication_engagement": 0.85 if customer.customer_health == "Healthy" else 0.45,
            "failure_reason": failure_reason or root_cause_res.root_cause,
            "customer_segment": customer.segment,
            "customer_health": customer.customer_health,
            "source_type": source_type
        }
        
        rec_prob = recovery_ml_pipeline.predict_probability(ml_features)

        # 5. Expected Recovery & Recovery Score
        expected_rec = scoring_engine.calculate_expected_recovery(amount, rec_prob)
        rec_score = scoring_engine.calculate_recovery_score(
            amount_at_risk=amount,
            recovery_probability=rec_prob,
            customer_ltv=customer.lifetime_value,
            payment_success_rate=customer.payment_success_rate,
            days_overdue=days_overdue,
            customer_health=customer.customer_health,
            is_broken_promise=(source_type == "PROMISE_TO_PAY")
        )
        priority = scoring_engine.determine_priority(rec_score, expected_rec, days_overdue)

        # 6. AI Agent Recommendation & Multi-step Strategy
        rec_output = recovery_agent.formulate_recommendation(
            source_type=source_type,
            root_cause=root_cause_res.root_cause,
            amount=amount,
            days_overdue=days_overdue,
            customer_health=customer.customer_health,
            preferred_channel=customer.preferred_channel
        )

        # 7. Policy Check
        policy_eval = policy_engine.evaluate({
            "amount_at_risk": amount,
            "outreach_attempts": 0,
            "retry_attempts": 0,
            "customer_opted_out": customer.opted_out,
            "dispute_status": getattr(customer, "dispute_status", "NONE"),
            "customer_health": customer.customer_health,
            "source_type": source_type,
            "recommended_action": rec_output["recommended_action"]
        })

        case_number = f"RV-{uuid.uuid4().hex[:6].upper()}"

        # 8. Create RecoveryCase entity
        new_case = RecoveryCase(
            case_number=case_number,
            customer_id=customer.id,
            source_type=source_type,
            source_id=source_id,
            amount_at_risk=amount,
            recovered_amount=0.0,
            days_overdue=days_overdue,
            recovery_probability=rec_prob,
            expected_recovery=expected_rec,
            recovery_score=rec_score,
            priority=priority,
            root_cause=root_cause_res.root_cause,
            root_cause_confidence=root_cause_res.confidence,
            recommended_action=rec_output["recommended_action"],
            policy_status=policy_eval.status,
            policy_reason=policy_eval.reason,
            status="Approval Required" if policy_eval.requires_approval else "Detected"
        )
        db.add(new_case)
        db.flush()

        # 9. Create AIRecommendation record
        ai_rec = AIRecommendation(
            case_id=new_case.id,
            diagnosis=f"Root cause: {root_cause_res.root_cause}. Confidence: {int(root_cause_res.confidence*100)}%.",
            recommendation=rec_output["recommended_action"],
            confidence=root_cause_res.confidence,
            reasoning_summary=rec_output["reasoning"],
            supporting_signals=root_cause_res.supporting_signals,
            multi_step_strategy=rec_output["strategy"]
        )
        db.add(ai_rec)

        # 10. Create Audit Trail Entry
        audit_service.log_event(
            db=db,
            case_id=new_case.id,
            event_type="CASE_CREATED",
            actor="Revenue Risk Detector",
            action=f"Detected {source_type} risk of ₹{amount:,.2f}",
            reason=f"Identified {root_cause_res.root_cause} with {int(rec_prob*100)}% recovery probability.",
            audit_metadata={
                "case_number": case_number,
                "amount": amount,
                "expected_recovery": expected_rec,
                "score": rec_score,
                "priority": priority,
                "policy_status": policy_eval.status
            },
            result="DETECTED"
        )

        db.commit()
        db.refresh(new_case)
        return new_case

risk_detector = RevenueRiskDetector()
