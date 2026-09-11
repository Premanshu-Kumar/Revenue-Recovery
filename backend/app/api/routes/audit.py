from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from app.database.session import get_db
from app.models.entities import AuditEvent, RecoveryCase
from app.schemas.schemas import AuditEventResponse

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("", response_model=dict)
def list_audit_events(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    case_id: Optional[str] = None,
    actor: Optional[str] = None,
    event_type: Optional[str] = None,
    search: Optional[str] = None
):
    query = db.query(AuditEvent)
    if case_id:
        query = query.filter(AuditEvent.case_id == case_id)
    if actor and actor != "ALL":
        query = query.filter(AuditEvent.actor == actor)
    if event_type and event_type != "ALL":
        query = query.filter(AuditEvent.event_type == event_type)
    if search:
        term = f"%{search}%"
        query = query.filter(or_(AuditEvent.action.ilike(term), AuditEvent.reason.ilike(term)))

    total = query.count()
    events = query.order_by(desc(AuditEvent.timestamp)).offset((page - 1) * limit).limit(limit).all()

    items = []
    for e in events:
        c_num = None
        if e.case_id:
            c = db.query(RecoveryCase).filter(RecoveryCase.id == e.case_id).first()
            if c:
                c_num = c.case_number
        items.append({
            "id": e.id,
            "case_id": e.case_id,
            "case_number": c_num,
            "event_type": e.event_type,
            "actor": e.actor,
            "action": e.action,
            "reason": e.reason,
            "audit_metadata": e.audit_metadata,
            "result": e.result,
            "timestamp": e.timestamp.isoformat()
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/{case_id}", response_model=List[dict])
def get_case_audit_trail(case_id: str, db: Session = Depends(get_db)):
    events = db.query(AuditEvent).filter(AuditEvent.case_id == case_id).order_by(desc(AuditEvent.timestamp)).all()
    return [
        {
            "id": e.id,
            "case_id": e.case_id,
            "event_type": e.event_type,
            "actor": e.actor,
            "action": e.action,
            "reason": e.reason,
            "audit_metadata": e.audit_metadata,
            "result": e.result,
            "timestamp": e.timestamp.isoformat()
        } for e in events
    ]
