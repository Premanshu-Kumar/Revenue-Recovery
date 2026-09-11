from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database.session import get_db
from app.models.entities import Invoice, PromiseToPay, Customer, RecoveryCase

router = APIRouter(prefix="/receivables", tags=["Receivables"])

@router.get("", response_model=dict)
def get_receivables_overview(db: Session = Depends(get_db)):
    overdue_invoices = db.query(Invoice).filter(Invoice.status == "OVERDUE").all()
    
    total_receivables = sum(inv.amount for inv in db.query(Invoice).filter(Invoice.status.in_(["OPEN", "OVERDUE"])).all())
    total_overdue = sum(inv.amount for inv in overdue_invoices)
    
    # Aging buckets
    b_0_7 = [inv for inv in overdue_invoices if inv.days_overdue <= 7]
    b_8_30 = [inv for inv in overdue_invoices if 8 <= inv.days_overdue <= 30]
    b_31_60 = [inv for inv in overdue_invoices if 31 <= inv.days_overdue <= 60]
    b_60_plus = [inv for inv in overdue_invoices if inv.days_overdue > 60]
    
    aging_buckets = [
        {"bucket": "0–7 Days", "key": "0-7", "count": len(b_0_7), "amount": round(sum(inv.amount for inv in b_0_7), 2), "risk_level": "LOW"},
        {"bucket": "8–30 Days", "key": "8-30", "count": len(b_8_30), "amount": round(sum(inv.amount for inv in b_8_30), 2), "risk_level": "MEDIUM"},
        {"bucket": "31–60 Days", "key": "31-60", "count": len(b_31_60), "amount": round(sum(inv.amount for inv in b_31_60), 2), "risk_level": "HIGH"},
        {"bucket": "60+ Days", "key": "60+", "count": len(b_60_plus), "amount": round(sum(inv.amount for inv in b_60_plus), 2), "risk_level": "CRITICAL"}
    ]

    # Promise to pay commitments
    promises = db.query(PromiseToPay).order_by(desc(PromiseToPay.created_at)).limit(20).all()
    promise_items = []
    for p in promises:
        cust = p.customer
        inv = p.invoice
        promise_items.append({
            "id": p.id,
            "customer_id": p.customer_id,
            "customer_name": cust.name if cust else "Unknown",
            "customer_company": cust.company if cust else "Unknown",
            "invoice_number": inv.invoice_number if inv else "INV-DIRECT",
            "promised_amount": p.promised_amount,
            "promise_date": p.promise_date.isoformat(),
            "status": p.status,
            "is_broken": (p.status == "BROKEN"),
            "created_at": p.created_at.isoformat()
        })

    avg_days_overdue = round(sum(inv.days_overdue for inv in overdue_invoices) / len(overdue_invoices), 1) if overdue_invoices else 0

    return {
        "kpis": {
            "total_receivables": round(total_receivables, 2),
            "total_overdue": round(total_overdue, 2),
            "overdue_count": len(overdue_invoices),
            "average_days_overdue": avg_days_overdue,
            "broken_promises_count": len([p for p in promises if p.status == "BROKEN"])
        },
        "aging_buckets": aging_buckets,
        "promises_to_pay": promise_items
    }
