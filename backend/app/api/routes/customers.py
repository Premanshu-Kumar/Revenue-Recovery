from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database.session import get_db
from app.models.entities import Customer, RecoveryCase, Payment, Invoice, Subscription
from app.schemas.schemas import CustomerResponse

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=dict)
def list_customers(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    segment: Optional[str] = None,
    health: Optional[str] = None,
    search: Optional[str] = None
):
    query = db.query(Customer)
    if segment and segment != "ALL":
        query = query.filter(Customer.segment == segment)
    if health and health != "ALL":
        query = query.filter(Customer.customer_health == health)
    if search:
        term = f"%{search}%"
        query = query.filter(or_(Customer.name.ilike(term), Customer.company.ilike(term), Customer.email.ilike(term)))

    total = query.count()
    customers = query.order_by(desc(Customer.lifetime_value)).offset((page - 1) * limit).limit(limit).all()

    items = [CustomerResponse.model_validate(c) for c in customers]
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/{customer_id}", response_model=dict)
def get_customer_360(customer_id: str, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    cases = db.query(RecoveryCase).filter(RecoveryCase.customer_id == customer_id).all()
    payments = db.query(Payment).filter(Payment.customer_id == customer_id).order_by(desc(Payment.created_at)).limit(10).all()
    invoices = db.query(Invoice).filter(Invoice.customer_id == customer_id).order_by(desc(Invoice.issue_date)).limit(10).all()
    subscriptions = db.query(Subscription).filter(Subscription.customer_id == customer_id).all()

    total_risk = sum(c.amount_at_risk for c in cases if c.status != "Recovered")
    total_recovered = sum(c.recovered_amount for c in cases)

    return {
        "customer": CustomerResponse.model_validate(cust),
        "total_revenue_at_risk": total_risk,
        "total_revenue_recovered": total_recovered,
        "open_cases_count": len([c for c in cases if c.status != "Recovered"]),
        "cases": [
            {
                "id": c.id,
                "case_number": c.case_number,
                "amount": c.amount_at_risk,
                "status": c.status,
                "priority": c.priority,
                "expected_recovery": c.expected_recovery,
                "probability": c.recovery_probability,
                "recommended_action": c.recommended_action
            } for c in cases
        ],
        "recent_payments": [
            {
                "id": p.id,
                "amount": p.amount,
                "status": p.status,
                "method": p.payment_method,
                "failure_reason": p.failure_reason,
                "date": p.created_at.isoformat()
            } for p in payments
        ],
        "invoices": [
            {
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "amount": inv.amount,
                "status": inv.status,
                "due_date": inv.due_date.isoformat(),
                "days_overdue": inv.days_overdue
            } for inv in invoices
        ],
        "subscriptions": [
            {
                "id": s.id,
                "plan": s.plan,
                "amount": s.monthly_amount,
                "status": s.status,
                "renewal_date": s.renewal_date.isoformat()
            } for s in subscriptions
        ]
    }
