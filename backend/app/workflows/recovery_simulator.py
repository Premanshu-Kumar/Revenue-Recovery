import random
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.entities import RecoveryCase, RecoveryAction, AuditEvent, get_utc_now
from app.policies.policy_engine import policy_engine
from app.services.audit_service import audit_service

class RecoverySimulator:
    """
    Executes and simulates recovery workflows safely in demo/sandbox mode without calling external gateways.
    """

    @staticmethod
    def execute_single_case(
        db: Session,
        case: RecoveryCase,
        action_type: str = None,
        override_approval: bool = False,
        actor: str = "RecoverAI Agent"
    ) -> Dict[str, Any]:
        """
        Executes a single recovery intervention for a case.
        """
        selected_action = action_type or case.recommended_action or "EMAIL_REMINDER"
        
        # Policy Check
        case_data = {
            "amount_at_risk": case.amount_at_risk,
            "outreach_attempts": case.outreach_attempts,
            "retry_attempts": case.retry_attempts,
            "customer_opted_out": getattr(case.customer, "opted_out", False) if case.customer else False,
            "dispute_status": getattr(case.customer, "dispute_status", "NONE") if case.customer else "NONE",
            "customer_health": getattr(case.customer, "customer_health", "Healthy") if case.customer else "Healthy",
            "source_type": case.source_type,
            "recommended_action": selected_action
        }
        
        policy_eval = policy_engine.evaluate(case_data, selected_action)
        case.policy_status = policy_eval.status
        case.policy_reason = policy_eval.reason
        
        # If approval required and not overridden
        if policy_eval.requires_approval and not override_approval and case.status != "Approved":
            case.status = "Approval Required"
            audit_service.log_event(
                db=db,
                case_id=case.id,
                event_type="APPROVAL_REQUIRED",
                actor="Policy Engine",
                action=f"Enforced Approval on {selected_action}",
                reason=policy_eval.reason,
                result="PENDING_HUMAN_APPROVAL"
            )
            db.commit()
            return {
                "success": False,
                "status": "APPROVAL_REQUIRED",
                "message": policy_eval.reason,
                "case_status": case.status
            }

        if policy_eval.is_blocked:
            case.status = "Paused"
            audit_service.log_event(
                db=db,
                case_id=case.id,
                event_type="ACTION_BLOCKED",
                actor="Policy Engine",
                action=f"Blocked {selected_action}",
                reason=policy_eval.reason,
                result="EXECUTION_BLOCKED"
            )
            db.commit()
            return {
                "success": False,
                "status": "BLOCKED",
                "message": policy_eval.reason,
                "case_status": case.status
            }

        # Execute simulated action
        channel = "EMAIL"
        if selected_action == "PAYMENT_RETRY":
            channel = "GATEWAY"
            case.retry_attempts += 1
        elif "WHATSAPP" in selected_action:
            channel = "WHATSAPP"
            case.outreach_attempts += 1
        elif "EMAIL" in selected_action:
            channel = "EMAIL"
            case.outreach_attempts += 1
        elif "ESCALATION" in selected_action:
            channel = "INTERNAL"
        else:
            channel = "PORTAL"

        # Stochastic simulation based on ML Recovery Probability
        prob = case.recovery_probability or 0.75
        # High probability -> higher chance of instant resolution
        roll = random.random()
        is_recovered = (roll < (prob * 1.05)) or (override_approval and prob > 0.65)
        
        # Log action record
        action_rec = RecoveryAction(
            case_id=case.id,
            action_type=selected_action,
            channel=channel,
            status="SUCCESS" if is_recovered else "EXECUTED",
            executed_at=get_utc_now(),
            result="Payment Settled Successfully" if is_recovered else "Communication Delivered - Pending Payment",
            payload={"simulated": True, "actor": actor, "roll": round(roll, 2), "prob": prob}
        )
        db.add(action_rec)

        if is_recovered:
            case.status = "Recovered"
            case.recovered_amount = case.amount_at_risk
            
            # Baseline benchmark simulation for this case
            baseline_factor = 0.45 if case.days_overdue > 14 else 0.55
            case.baseline_recovered_amount = round(case.amount_at_risk * baseline_factor, 2)
            
            audit_service.log_event(
                db=db,
                case_id=case.id,
                event_type="PAYMENT_RECOVERED",
                actor=actor,
                action=f"Completed {selected_action}",
                reason=f"Payment recovered successfully via {channel}. Recovered ₹{case.recovered_amount:,.2f}.",
                audit_metadata={
                    "amount_recovered": case.recovered_amount,
                    "channel": channel,
                    "recovery_score": case.recovery_score,
                    "probability": case.recovery_probability
                },
                result="RECOVERED"
            )
        else:
            case.status = "Recovery In Progress"
            audit_service.log_event(
                db=db,
                case_id=case.id,
                event_type="ACTION_EXECUTED",
                actor=actor,
                action=f"Executed {selected_action}",
                reason=f"Dispatched via {channel}. Waiting for customer settlement.",
                result="IN_PROGRESS"
            )

        db.commit()
        db.refresh(case)

        return {
            "success": True,
            "is_recovered": is_recovered,
            "recovered_amount": case.recovered_amount,
            "status": case.status,
            "action_executed": selected_action,
            "channel": channel
        }

    @staticmethod
    def run_batch_simulation(db: Session, batch_size: int = 1000, auto_approve: bool = True) -> Dict[str, Any]:
        """
        Runs batch recovery simulation across open cases in the system.
        """
        cases = db.query(RecoveryCase).filter(RecoveryCase.status.notin_(["Recovered", "Closed", "Unrecoverable"])).limit(batch_size).all()
        
        cases_processed = 0
        actions_executed = 0
        auto_approved = 0
        approval_required = 0
        
        for case in cases:
            cases_processed += 1
            # Check policy
            policy_res = policy_engine.evaluate({
                "amount_at_risk": case.amount_at_risk,
                "outreach_attempts": case.outreach_attempts,
                "retry_attempts": case.retry_attempts,
                "customer_opted_out": getattr(case.customer, "opted_out", False) if case.customer else False,
                "dispute_status": getattr(case.customer, "dispute_status", "NONE") if case.customer else "NONE",
                "customer_health": getattr(case.customer, "customer_health", "Healthy") if case.customer else "Healthy",
                "source_type": case.source_type,
                "recommended_action": case.recommended_action
            })
            
            if policy_res.is_blocked:
                case.status = "Paused"
                continue
                
            if policy_res.requires_approval:
                approval_required += 1
                if not auto_approve:
                    case.status = "Approval Required"
                    continue
                else:
                    auto_approved += 1
                    case.status = "Approved"

            # Execute recovery
            RecoverySimulator.execute_single_case(
                db=db,
                case=case,
                override_approval=True,
                actor="RecoverAI Autonomous Engine"
            )
            actions_executed += 1

        # Calculate live aggregates from database
        all_cases = db.query(RecoveryCase).all()
        total_risk = sum(c.amount_at_risk for c in all_cases)
        total_recovered = sum(c.recovered_amount for c in all_cases)
        total_baseline = sum(c.baseline_recovered_amount for c in all_cases if c.status == "Recovered")
        
        # If total baseline is 0, estimate synthetic baseline
        if total_baseline == 0 and total_recovered > 0:
            total_baseline = round(total_recovered * 0.47, 2)
            
        incremental = max(0.0, total_recovered - total_baseline)
        recovery_rate = round((total_recovered / total_risk * 100.0), 2) if total_risk > 0 else 0.0
        ai_lift = round((incremental / total_baseline * 100.0), 2) if total_baseline > 0 else 111.0

        audit_service.log_event(
            db=db,
            event_type="BATCH_SIMULATION_COMPLETED",
            actor="Batch Simulation Engine",
            action="Executed Batch Autonomous Recovery",
            reason=f"Processed {cases_processed} cases. Recovered ₹{total_recovered:,.2f} total with {ai_lift}% AI Lift.",
            audit_metadata={
                "cases_processed": cases_processed,
                "actions_executed": actions_executed,
                "revenue_recovered": total_recovered,
                "incremental_recovery": incremental
            },
            result="COMPLETED"
        )
        db.commit()

        return {
            "cases_processed": cases_processed,
            "revenue_at_risk": round(total_risk, 2),
            "revenue_recovered": round(total_recovered, 2),
            "baseline_recovered": round(total_baseline, 2),
            "incremental_recovery": round(incremental, 2),
            "recovery_rate": recovery_rate,
            "ai_lift": ai_lift,
            "actions_executed": actions_executed,
            "auto_approved_count": auto_approved,
            "approval_required_count": approval_required,
            "status": "SUCCESS"
        }

recovery_simulator = RecoverySimulator()
