from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.database.session import get_db
from app.models.entities import RecoveryCase, Customer, AIRecommendation, RecoveryAction, AuditEvent, get_utc_now
from app.schemas.schemas import (
    RecoveryCaseListResponse, RecoveryCaseDetailResponse, CaseActionRequest,
    CustomerResponse, RecoveryActionResponse, AIRecommendationResponse, AuditEventResponse
)
from app.workflows.recovery_simulator import recovery_simulator
from app.services.audit_service import audit_service
from app.services.root_cause import RootCauseClassifier
from app.agents.recovery_agent import recovery_agent
from app.policies.policy_engine import policy_engine

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.get("", response_model=dict)
def list_cases(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=200),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    source_type: Optional[str] = None,
    search: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    min_probability: Optional[float] = None,
    sort_by: str = Query("score_desc") # score_desc, amount_desc, prob_desc, created_desc
):
    query = db.query(RecoveryCase).join(Customer, RecoveryCase.customer_id == Customer.id)

    if status and status != "ALL":
        query = query.filter(RecoveryCase.status == status)
    if priority and priority != "ALL":
        query = query.filter(RecoveryCase.priority == priority)
    if source_type and source_type != "ALL":
        query = query.filter(RecoveryCase.source_type == source_type)
    if min_amount is not None:
        query = query.filter(RecoveryCase.amount_at_risk >= min_amount)
    if max_amount is not None:
        query = query.filter(RecoveryCase.amount_at_risk <= max_amount)
    if min_probability is not None:
        query = query.filter(RecoveryCase.recovery_probability >= min_probability)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                RecoveryCase.case_number.ilike(search_term),
                Customer.name.ilike(search_term),
                Customer.company.ilike(search_term),
                RecoveryCase.source_id.ilike(search_term)
            )
        )

    # Sorting
    if sort_by == "score_desc":
        query = query.order_by(desc(RecoveryCase.recovery_score), desc(RecoveryCase.expected_recovery))
    elif sort_by == "amount_desc":
        query = query.order_by(desc(RecoveryCase.amount_at_risk))
    elif sort_by == "prob_desc":
        query = query.order_by(desc(RecoveryCase.recovery_probability))
    elif sort_by == "created_desc":
        query = query.order_by(desc(RecoveryCase.created_at))
    else:
        query = query.order_by(desc(RecoveryCase.recovery_score))

    total = query.count()
    offset = (page - 1) * limit
    cases = query.offset(offset).limit(limit).all()

    items = []
    for c in cases:
        cust = c.customer
        items.append(RecoveryCaseListResponse(
            id=c.id,
            case_number=c.case_number,
            customer_id=c.customer_id,
            customer_name=cust.name if cust else None,
            customer_company=cust.company if cust else None,
            customer_segment=cust.segment if cust else None,
            customer_health=cust.customer_health if cust else None,
            source_type=c.source_type,
            source_id=c.source_id,
            amount_at_risk=c.amount_at_risk,
            recovered_amount=c.recovered_amount,
            currency=c.currency,
            days_overdue=c.days_overdue,
            recovery_probability=c.recovery_probability,
            expected_recovery=c.expected_recovery,
            recovery_score=c.recovery_score,
            priority=c.priority,
            root_cause=c.root_cause,
            root_cause_confidence=c.root_cause_confidence,
            recommended_action=c.recommended_action,
            policy_status=c.policy_status,
            policy_reason=c.policy_reason,
            status=c.status,
            outreach_attempts=c.outreach_attempts,
            retry_attempts=c.retry_attempts,
            created_at=c.created_at,
            updated_at=c.updated_at
        ))

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/{case_id}", response_model=RecoveryCaseDetailResponse)
def get_case_detail(case_id: str, db: Session = Depends(get_db)):
    case = db.query(RecoveryCase).filter(or_(RecoveryCase.id == case_id, RecoveryCase.case_number == case_id)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Recovery case not found")

    cust = case.customer
    cust_res = None
    if cust:
        cust_res = CustomerResponse.model_validate(cust)

    actions_res = [RecoveryActionResponse.model_validate(a) for a in case.actions]
    rec_res = [AIRecommendationResponse.model_validate(r) for r in case.recommendations]
    audit_res = [AuditEventResponse.model_validate(au) for au in sorted(case.audit_events, key=lambda x: x.timestamp, reverse=True)]

    return RecoveryCaseDetailResponse(
        id=case.id,
        case_number=case.case_number,
        customer_id=case.customer_id,
        customer_name=cust.name if cust else None,
        customer_company=cust.company if cust else None,
        customer_segment=cust.segment if cust else None,
        customer_health=cust.customer_health if cust else None,
        source_type=case.source_type,
        source_id=case.source_id,
        amount_at_risk=case.amount_at_risk,
        recovered_amount=case.recovered_amount,
        currency=case.currency,
        days_overdue=case.days_overdue,
        recovery_probability=case.recovery_probability,
        expected_recovery=case.expected_recovery,
        recovery_score=case.recovery_score,
        priority=case.priority,
        root_cause=case.root_cause,
        root_cause_confidence=case.root_cause_confidence,
        recommended_action=case.recommended_action,
        policy_status=case.policy_status,
        policy_reason=case.policy_reason,
        status=case.status,
        outreach_attempts=case.outreach_attempts,
        retry_attempts=case.retry_attempts,
        created_at=case.created_at,
        updated_at=case.updated_at,
        customer=cust_res,
        actions=actions_res,
        recommendations=rec_res,
        audit_events=audit_res
    )

@router.post("/{case_id}/approve")
def approve_case_action(case_id: str, db: Session = Depends(get_db)):
    case = db.query(RecoveryCase).filter(RecoveryCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if case.status == "Recovered":
        raise HTTPException(status_code=409, detail="Case already recovered")

    case.status = "Approved"
    case.approved_by = "Premanshu Kumar (CFO)"
    case.approved_at = get_utc_now()
    case.policy_status = "ALLOWED"
    
    audit_service.log_event(
        db=db,
        case_id=case.id,
        event_type="APPROVAL_GRANTED",
        actor="Premanshu Kumar (CFO)",
        action=f"Approved {case.recommended_action}",
        reason=f"Manual CFO sign-off granted for high-value recovery (₹{case.amount_at_risk:,.2f}).",
        result="APPROVED"
    )
    db.commit()
    db.refresh(case)
    return {"status": "SUCCESS", "case_status": case.status, "message": "Action approved successfully"}

@router.post("/{case_id}/execute")
def execute_case_action(case_id: str, req: CaseActionRequest = None, db: Session = Depends(get_db)):
    case = db.query(RecoveryCase).filter(RecoveryCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if case.status == "Recovered":
        raise HTTPException(status_code=409, detail="Case has already been recovered")

    action_type = req.action_type if req and req.action_type else case.recommended_action
    override = req.override_policy if req else False

    result = recovery_simulator.execute_single_case(
        db=db,
        case=case,
        action_type=action_type,
        override_approval=override,
        actor="CFO / Operator" if override else "RecoverAI Agent"
    )
    return result

@router.post("/{case_id}/pause")
def pause_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(RecoveryCase).filter(RecoveryCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case.status = "Paused"
    audit_service.log_event(
        db=db,
        case_id=case.id,
        event_type="CASE_PAUSED",
        actor="Finance Operator",
        action="Paused Recovery Workflow",
        reason="Manual operator intervention to hold automated dunning.",
        result="PAUSED"
    )
    db.commit()
    return {"status": "SUCCESS", "case_status": case.status}

@router.post("/{case_id}/diagnose")
def run_diagnosis(case_id: str, db: Session = Depends(get_db)):
    case = db.query(RecoveryCase).filter(RecoveryCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    cust = case.customer
    root_res = RootCauseClassifier.classify(case.source_type, {
        "failure_reason": case.root_cause or "UNKNOWN",
        "days_overdue": case.days_overdue,
        "payment_success_rate": cust.payment_success_rate if cust else 0.85,
        "customer_health": cust.customer_health if cust else "Healthy",
        "average_payment_delay": cust.average_payment_delay if cust else 4,
        "total_transactions": cust.total_transactions if cust else 10,
        "lifetime_value": cust.lifetime_value if cust else 100000,
        "customer_segment": cust.segment if cust else "Mid-Market",
        "amount_at_risk": case.amount_at_risk,
        "source_type": case.source_type
    })

    case.root_cause = root_res.root_cause
    case.root_cause_confidence = root_res.confidence
    case.status = "Diagnosing"
    
    audit_service.log_event(
        db=db,
        case_id=case.id,
        event_type="AI_DIAGNOSIS",
        actor="AI Root Cause Analyzer",
        action="Updated Root Cause Diagnosis",
        reason=f"Classified as {root_res.root_cause} with {int(root_res.confidence*100)}% confidence.",
        result="DIAGNOSED"
    )
    db.commit()
    return root_res.to_dict()
