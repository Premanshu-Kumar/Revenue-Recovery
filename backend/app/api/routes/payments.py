from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database.session import get_db
from app.models.entities import Payment, Customer, RecoveryCase

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("", response_model=dict)
def list_payments(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    status: Optional[str] = None,
    method: Optional[str] = None,
    search: Optional[str] = None
):
    query = db.query(Payment).join(Customer, Payment.customer_id == Customer.id)
    if status and status != "ALL":
        query = query.filter(Payment.status == status)
    if method and method != "ALL":
        query = query.filter(Payment.payment_method == method)
    if search:
        term = f"%{search}%"
        query = query.filter(Customer.company.ilike(term) | Customer.name.ilike(term))

    total = query.count()
    payments = query.order_by(desc(Payment.created_at)).offset((page - 1) * limit).limit(limit).all()

    items = []
    for p in payments:
        cust = p.customer
        # find matching recovery case if failed
        rec_case = db.query(RecoveryCase).filter(RecoveryCase.source_id == p.id).first() if p.status == "FAILED" else None
        items.append({
            "id": p.id,
            "customer_id": p.customer_id,
            "customer_name": cust.name if cust else "Unknown",
            "customer_company": cust.company if cust else "Unknown",
            "amount": p.amount,
            "currency": p.currency,
            "payment_method": p.payment_method,
            "status": p.status,
            "failure_reason": p.failure_reason,
            "retry_count": p.retry_count,
            "created_at": p.created_at.isoformat(),
            "recovery_case_id": rec_case.id if rec_case else None,
            "recovery_probability": rec_case.recovery_probability if rec_case else None,
            "recommended_action": rec_case.recommended_action if rec_case else None
        })

    # Summary metrics for payment operations
    total_count = db.query(Payment).count()
    failed_count = db.query(Payment).filter(Payment.status == "FAILED").count()
    success_count = db.query(Payment).filter(Payment.status == "SUCCESS").count()
    fail_rate = round((failed_count / total_count * 100.0), 2) if total_count > 0 else 0.0

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "summary": {
            "total_transactions": total_count,
            "successful_transactions": success_count,
            "failed_transactions": failed_count,
            "failure_rate": fail_rate
        }
    }
