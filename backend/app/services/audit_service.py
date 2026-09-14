from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.entities import AuditEvent, get_utc_now

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        event_type: str,
        actor: str,
        action: str,
        case_id: Optional[str] = None,
        reason: Optional[str] = None,
        audit_metadata: Optional[Dict[str, Any]] = None,
        result: Optional[str] = None
    ) -> AuditEvent:
        event = AuditEvent(
            case_id=case_id,
            event_type=event_type,
            actor=actor,
            action=action,
            reason=reason,
            audit_metadata=audit_metadata or {},
            result=result,
            timestamp=get_utc_now()
        )
        db.add(event)
        db.flush()
        return event

audit_service = AuditService()
