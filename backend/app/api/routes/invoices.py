from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from app.database.session import get_db
from app.models.entities import Invoice, Customer, RecoveryCase

router = APIRouter(prefix="/invoices", tags=["Invoices"])

@router.get("", response_model=dict)
def list_invoices(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    status: Optional[str] = None,
    aging: Optional[str] = None, # 0-7, 8-30, 31-60, 60+
    search: Optional[str] = None
):
    query = db.query(Invoice).join(Customer, Invoice.customer_id == Customer.id)
    if status and status != "ALL":
        query = query.filter(Invoice.status == status)
    
    if aging:
        if aging == "0-7":
            query = query.filter(Invoice.days_overdue.between(0, 7), Invoice.status == "OVERDUE")
        elif aging == "8-30":
            query = query.filter(Invoice.days_overdue.between(8, 30), Invoice.status == "OVERDUE")
        elif aging == "31-60":
            query = query.filter(Invoice.days_overdue.between(31, 60), Invoice.status == "OVERDUE")
        elif aging == "60+":
            query = query.filter(Invoice.days_overdue > 60, Invoice.status == "OVERDUE")

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Invoice.invoice_number.ilike(term),
                Customer.name.ilike(term),
                Customer.company.ilike(term)
            )
        )

    total = query.count()
    invoices = query.order_by(desc(Invoice.days_overdue), desc(Invoice.amount)).offset((page - 1) * limit).limit(limit).all()

    items = []
    for inv in invoices:
        cust = inv.customer
        rec_case = db.query(RecoveryCase).filter(RecoveryCase.source_id == inv.id).first()
        items.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "customer_id": inv.customer_id,
            "customer_name": cust.name if cust else "Unknown",
            "customer_company": cust.company if cust else "Unknown",
            "amount": inv.amount,
            "status": inv.status,
            "issue_date": inv.issue_date.isoformat(),
            "due_date": inv.due_date.isoformat(),
            "days_overdue": inv.days_overdue,
            "dispute_status": inv.dispute_status,
            "recovery_case_id": rec_case.id if rec_case else None,
            "recovery_probability": rec_case.recovery_probability if rec_case else None,
            "recommended_action": rec_case.recommended_action if rec_case else None
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }
