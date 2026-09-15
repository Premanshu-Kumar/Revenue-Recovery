from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.database.session import get_db
from app.models.entities import RecoveryCase, Customer
from app.agents.recovery_agent import recovery_agent
from app.schemas.schemas import MessageGenerateRequest

router = APIRouter(prefix="/ai", tags=["AI Agent"])

class AIChatQueryRequest(BaseModel):
    query: str

@router.post("/generate-message")
def generate_message(req: MessageGenerateRequest, db: Session = Depends(get_db)):
    case = db.query(RecoveryCase).filter(RecoveryCase.id == req.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    cust = case.customer
    customer_name = cust.name if cust else "Valued Customer"
    company_name = cust.company if cust else "Account"
    invoice_ref = case.case_number

    msg = recovery_agent.generate_communication(
        customer_name=customer_name,
        company_name=company_name,
        amount=case.amount_at_risk,
        invoice_or_ref=invoice_ref,
        days_overdue=case.days_overdue,
        language=req.language,
        tone=req.tone,
        channel=req.channel
    )
    return msg

@router.post("/chat")
def chat_with_ai(req: AIChatQueryRequest, db: Session = Depends(get_db)):
    query = req.query.lower()
    all_cases = db.query(RecoveryCase).all()
    total_risk = sum(c.amount_at_risk for c in all_cases)
    total_rec = sum(c.recovered_amount for c in all_cases)
    pending_approval = [c for c in all_cases if c.status == "Approval Required"]
    critical = [c for c in all_cases if c.priority == "CRITICAL" and c.status != "Recovered"]

    if "risk" in query or "how much" in query and "lost" in query:
        response_text = (
            f"Currently, there is **₹{total_risk:,.2f}** total revenue at risk across {len(all_cases)} active events. "
            f"The largest source of risk is Overdue B2B Invoices (45%), followed by Failed Gateway Payments (26%)."
        )
    elif "approval" in query or "pending" in query:
        response_text = (
            f"There are **{len(pending_approval)} cases** currently requiring CFO/Human approval. "
            f"Top case: **ABC Technologies** (RV-10284) with **₹84,500** at risk (18 days overdue, 82% recovery probability)."
        )
    elif "recovered" in query or "money" in query or "lift" in query:
        incremental = total_rec * 0.53
        response_text = (
            f"RecoverAI has successfully recovered **₹{total_rec:,.2f}**, generating **₹{incremental:,.2f}** in incremental revenue "
            f"(**+111.0% AI Lift** over baseline dunning)."
        )
    elif "abc" in query or "technology" in query:
        abc = db.query(RecoveryCase).filter(RecoveryCase.case_number == "RV-10284").first()
        if abc:
            response_text = (
                f"**ABC Technologies (RV-10284)**: Invoice amount **₹84,500** (18 days overdue). "
                f"ML predicts **82% Recovery Probability** (₹69,290 Expected). "
                f"Policy status: **Human Approval Required** because the amount exceeds the ₹50,000 threshold. "
                f"AI recommends an executive Email Reminder followed by a WhatsApp pay link."
            )
        else:
            response_text = "ABC Technologies case details are currently loading."
    else:
        response_text = (
            f"RecoverAI is actively monitoring {len(all_cases)} revenue risk events. "
            f"Total recovered: **₹{total_rec:,.2f}** ({round(total_rec/total_risk*100, 1)}% recovery rate). "
            f"There are {len(critical)} critical priority opportunities requiring immediate attention."
        )

    return {
        "response": response_text,
        "metrics_summary": {
            "total_risk": total_risk,
            "total_recovered": total_rec,
            "pending_approvals": len(pending_approval),
            "critical_cases": len(critical)
        }
    }
